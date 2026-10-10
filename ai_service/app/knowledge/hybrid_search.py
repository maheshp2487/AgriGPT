import math
import re
from typing import Dict, List, Tuple, Any, Optional

DEFAULT_K_RRF = 60
WEIGHT_DENSE = 0.65
WEIGHT_SPARSE = 0.35


def compute_cover_density_score(query: str, text: str) -> float:
    """
    Simulates PostgreSQL ts_rank_cd (Cover Density Ranking).
    Calculates proximity and clustering density of query terms within the document.
    """
    q_tokens = [t.lower() for t in re.findall(r"\w+", query) if len(t) > 2]
    if not q_tokens:
        return 0.0

    doc_tokens = [t.lower() for t in re.findall(r"\w+", text)]
    if not doc_tokens:
        return 0.0

    # Find token positions
    positions = []
    for i, token in enumerate(doc_tokens):
        if token in q_tokens:
            positions.append(i)

    if not positions:
        return 0.0

    matched_distinct = len(set(doc_tokens[p] for p in positions))
    coverage_ratio = matched_distinct / len(set(q_tokens))

    # Density calculation based on minimum span covering matching tokens
    if len(positions) == 1:
        span_penalty = 1.0
    else:
        span = positions[-1] - positions[0] + 1
        span_penalty = 1.0 / (1.0 + math.log1p(max(0, span - len(positions))))

    raw_score = (coverage_ratio * 2.0) + (span_penalty * 1.5)
    return round(raw_score, 4)


def compute_dense_similarity_score(query: str, text: str) -> float:
    """
    Dense semantic similarity score.
    Computes token and character trigram cosine similarity.
    In cloud environment with Supabase, this executes pgvector HNSW cosine distance (<=>).
    """
    def get_trigrams(s: str) -> set:
        s_norm = f"  {s.lower().strip()}  "
        return set(s_norm[i:i+3] for i in range(len(s_norm) - 2))

    q_tri = get_trigrams(query)
    doc_tri = get_trigrams(text)

    if not q_tri or not doc_tri:
        return 0.0

    intersection = len(q_tri.intersection(doc_tri))
    union = len(q_tri.union(doc_tri))
    jaccard = intersection / max(1, union)

    # Word-level overlap boost
    q_words = set(re.findall(r"\w+", query.lower()))
    doc_words = set(re.findall(r"\w+", text.lower()))
    word_overlap = len(q_words.intersection(doc_words)) / max(1, len(q_words))

    dense_score = (jaccard * 0.4) + (word_overlap * 0.6)
    return round(min(1.0, dense_score), 4)


def reciprocal_rank_fusion(
    dense_ranked_ids: List[str],
    sparse_ranked_ids: List[str],
    k: int = DEFAULT_K_RRF,
    w_dense: float = WEIGHT_DENSE,
    w_sparse: float = WEIGHT_SPARSE
) -> List[Tuple[str, float]]:
    """
    Computes Reciprocal Rank Fusion (RRF) according to ADR-0004:
    RRF(d) = (w_dense / (k + rank_dense(d))) + (w_sparse / (k + rank_sparse(d)))
    """
    all_doc_ids = set(dense_ranked_ids).union(set(sparse_ranked_ids))
    fused_scores: Dict[str, float] = {}

    for doc_id in all_doc_ids:
        score = 0.0

        if doc_id in dense_ranked_ids:
            dense_rank = dense_ranked_ids.index(doc_id) + 1
            score += w_dense / (k + dense_rank)
        else:
            score += w_dense / (k + len(dense_ranked_ids) + 10)

        if doc_id in sparse_ranked_ids:
            sparse_rank = sparse_ranked_ids.index(doc_id) + 1
            score += w_sparse / (k + sparse_rank)
        else:
            score += w_sparse / (k + len(sparse_ranked_ids) + 10)

        fused_scores[doc_id] = score

    # Sort descending by fused score
    sorted_docs = sorted(fused_scores.items(), key=lambda x: x[1], reverse=True)
    return sorted_docs


class HybridSearchEngine:
    """
    Hybrid Search Engine combining Cover Density Lexical Ranking and
    Dense Vector Similarity via Reciprocal Rank Fusion (RRF).
    """

    def __init__(self, k_rrf: int = DEFAULT_K_RRF, w_dense: float = WEIGHT_DENSE, w_sparse: float = WEIGHT_SPARSE):
        self.k_rrf = k_rrf
        self.w_dense = w_dense
        self.w_sparse = w_sparse

    def rank(
        self,
        query: str,
        candidates: List[Dict[str, Any]],
        text_field: str = "content_en"
    ) -> List[Dict[str, Any]]:
        """
        Ranks candidates using dense and sparse scorers, fused via RRF.
        Attaches rrf_score, dense_rank, and sparse_rank to candidate objects.
        """
        if not candidates:
            return []

        # 1. Compute Sparse (Cover Density) Scores
        sparse_scored = []
        for c in candidates:
            text = c.get(text_field, "")
            score = compute_cover_density_score(query, text)
            sparse_scored.append((c["chunk_id"], score, c))
        sparse_scored.sort(key=lambda x: x[1], reverse=True)
        sparse_ranked_ids = [item[0] for item in sparse_scored]

        # 2. Compute Dense (Vector/Embedding) Scores
        dense_scored = []
        for c in candidates:
            text = c.get(text_field, "")
            score = compute_dense_similarity_score(query, text)
            dense_scored.append((c["chunk_id"], score, c))
        dense_scored.sort(key=lambda x: x[1], reverse=True)
        dense_ranked_ids = [item[0] for item in dense_scored]

        # 3. Fuse with RRF
        fused = reciprocal_rank_fusion(
            dense_ranked_ids=dense_ranked_ids,
            sparse_ranked_ids=sparse_ranked_ids,
            k=self.k_rrf,
            w_dense=self.w_dense,
            w_sparse=self.w_sparse
        )

        # Build output list with ranking metadata
        id_to_candidate = {c["chunk_id"]: c for c in candidates}
        results = []

        for rank_pos, (doc_id, rrf_score) in enumerate(fused, start=1):
            cand = dict(id_to_candidate[doc_id])
            domain_bonus = cand.get("domain_score", 0.0) * 0.1
            cand["rrf_score"] = round(rrf_score, 6)
            cand["fused_score"] = round(rrf_score * (1.0 + domain_bonus), 6)
            cand["rrf_rank"] = rank_pos
            cand["dense_rank"] = dense_ranked_ids.index(doc_id) + 1 if doc_id in dense_ranked_ids else None
            cand["sparse_rank"] = sparse_ranked_ids.index(doc_id) + 1 if doc_id in sparse_ranked_ids else None
            results.append(cand)

        results.sort(key=lambda x: x["fused_score"], reverse=True)
        return results


# Global singleton instance
hybrid_search_engine = HybridSearchEngine()
