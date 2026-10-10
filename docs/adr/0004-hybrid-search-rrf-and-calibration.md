# ADR-0004: Hybrid Search Specification, RRF Formula & Similarity Calibration

## Status
Accepted

## Context
1. The early specification conflated PostgreSQL standard full-text search with BM25. PostgreSQL native full-text search uses `tsvector` and `tsquery` with Cover Density ranking (`ts_rank_cd`), not the BM25 probabilistic algorithm (unless using third-party extensions like ParadeDB `pg_search`).
2. The Reciprocal Rank Fusion (RRF) formula was unspecified.
3. A similarity score cutoff of `0.72` was stated as a universal constant. In vector search, cosine distance/similarity distributions vary drastically based on embedding models, dimensionality, and query length.

## Decision
1. **Accurate Terminology & PostgreSQL Search Implementation:**
   - PostgreSQL native full-text search will be explicitly documented as **PostgreSQL Cover Density FTS** using `tsvector`, `tsquery`, and `ts_rank_cd(tsv_content, query)`.
   - If BM25 is strictly required in Phase 2, either the ParadeDB `pg_search` extension or an in-memory Tantivy/BM25 index will be benchmarked and introduced.
2. **Explicit Reciprocal Rank Fusion (RRF) Formula:**
   For a candidate chunk $d$, the hybrid score across retrieval lists is defined as:
   $$RRF\_Score(d) = \sum_{m \in \{\text{dense}, \text{sparse}\}} \frac{w_m}{k + r_m(d)}$$
   Where:
   - $k = 60$ (the canonical Cormack et al. smoothing constant).
   - $r_m(d) \in \{1, 2, \dots, N\}$ is the 1-based rank position of chunk $d$ in retrieval method $m$.
   - $w_{\text{dense}} = 0.65$ (weight for pgvector cosine ranking).
   - $w_{\text{sparse}} = 0.35$ (weight for PostgreSQL full-text rank).
3. **Calibrated Similarity Cutoffs:**
   - A static `0.72` threshold is rejected.
   - Retrieval confidence will be calibrated empirically using an agricultural question-answering evaluation dataset (50 benchmark agronomy queries per language).
   - Precision-recall curves will establish the operational threshold for each embedding model (e.g., `text-embedding-3-small` vs `BGE-M3`) to differentiate between high-confidence answers, advisory fallbacks, and fail-closed refusals.

## Consequences
- Precise engineering definition preventing false claims about PostgreSQL capabilities.
- Mathematically defined hybrid rank fusion with model-calibrated thresholds.
