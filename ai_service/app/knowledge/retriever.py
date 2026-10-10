import json
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from app.schemas.chat import Citation

DATA_PATH = Path(__file__).parent / "data" / "authoritative_documents.json"

from app.knowledge.hybrid_search import hybrid_search_engine

# Multilingual term synonyms mapping across 6 mandatory languages
MULTILINGUAL_SYNONYMS: Dict[str, List[str]] = {
    "stem borer": [
        "stem borer", "yellow stem borer", "dead heart", "white ear",
        "தண்டு துளைப்பான்", "குருத்து காய்வு", "வெண்கதிர்",
        "तना छेदक", "डेड हार्ट", "सफेद बाली",
        "కాండం తొలిచే పురుగు", "చచ్చిన మొవ్వు",
        "ಕಾಂಡ ಕೊರೆಯುವ ಹುಳು", "ಬೆಂಕಿ ಸುಳಿ",
        "തണ്ടുതുരപ്പൻ പുഴു", "വെള്ളക്കതിർ"
    ],
    "blast": [
        "blast", "magnaporthe", "neck blast",
        "குலை நோய்",
        "झुलसा", "ब्लास्ट", "नाव के आकार",
        "అగ్గి తెగులు", "మెడ విరుపు",
        "ಬೆಂಕಿ ರೋಗ", "ಕೊರಳು ಬೆಂಕಿ ರೋಗ",
        "കുലരോഗം", "കഴുത്തുരോഗം"
    ],
    "fall armyworm": [
        "fall armyworm", "faw", "spodoptera frugiperda",
        "படைப்புழு", "மக்காச்சோள படைப்புழு",
        "फाल आर्मीवर्म", "सैनिक कीट", "गोभ",
        "కత్తెర పురుగు", "మొక్కజొన్న కత్తెర పురుగు",
        "ಸೈನಿಕ ಹುಳು", "ಲದ್ದಿ ಹುಳು",
        "പട്ടാളപ്പുഴു", "കൂമ്പ് പുഴു"
    ],
    "tikka": [
        "tikka", "leaf spot", "cercospora", "gypsum",
        "டிக்கா", "இலைப்புள்ளி", "ஜிப்சம்",
        "टिक्का", "जिप्सम",
        "టిక్కా తెగులు", "ఆకుమచ్చ", "జిప్సం",
        "ಟಿಕಾ ರೋಗ", "ಎಲೆ ಚುಕ್ಕೆ ರೋಗ", "ಜಿಪ್ಸಮ್",
        "ടിക്ക രോഗം", "ഇലപ്പുള്ളി രോഗം", "ജിപ്സം"
    ],
    "pink bollworm": [
        "pink bollworm", "bollworm", "pectinophora",
        "காய்ப்புழு", "இளஞ்சிவப்பு காய்ப்புழு",
        "गुलाबी सुंडी", "फेरोमोन ट्रैप",
        "గులాబీ రంగు కాయ తొలుచు పురుగు",
        "ಗುಲಾಬಿ ಕಾಯಿ ಕೊರೆಯುವ ಹುಳು",
        "കായ്തുരപ്പൻ പുഴു"
    ],
    "yellow mosaic virus": [
        "yellow mosaic virus", "ymv", "whitefly",
        "மஞ்சள் தேமல்", "வெள்ளை ஈ",
        "पीला मोज़ेक", "सफेद मक्खी",
        "పసుపు పచ్చ తెగులు", "తెల్ల దోమ",
        "ಹಳದಿ ನಂಜು ರೋಗ", "ಬಿಳಿ ನೊಣ",
        "മഞ്ഞളിപ്പ് രോഗം", "വെള്ളീച്ച"
    ]
}

CROP_SYNONYMS: Dict[str, List[str]] = {
    "paddy": ["paddy", "rice", "oryza", "dhan", "நெல்", "அரிசி", "धान", "चावल", "వరి", "బియ్యం", "ಭತ್ತ", "ಅಕ್ಕಿ", "നെല്ല്", "അരി"],
    "maize": ["maize", "corn", "மக்காச்சோளம்", "சோளம்", "मक्का", "మొక్కజొన్న", "ಜೋಳ", "മക്കച്ചോളം"],
    "groundnut": ["groundnut", "peanut", "நிலக்கடலை", "வேர்க்கடலை", "मूंगफली", "వేరుశనగ", "కడలేకాయి", "നിലക്കടല"],
    "cotton": ["cotton", "பருத்தி", "कपास", "ప్రత్తి", "పత్తి", "ಹತ್ತಿ", "പരുത്തി"],
    "soybean": ["soybean", "soya", "சோயாபீன்", "சோயா", "सोयाबीन", "సోయాబీన్", "ಸೋಯಾಬೀನ್", "സോയാബീൻ"]
}


class GroundedRetriever:
    """
    Retriever for official, authoritative ICAR and State Agricultural University documents.
    Preserves document metadata, citations, and provenance.
    """

    def __init__(self, data_path: Optional[Path] = None):
        path = data_path or DATA_PATH
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.provenance_statement = data.get("provenance_statement", "")
        self.documents = data.get("documents", [])
        self._flattened_chunks: List[Dict[str, Any]] = []

        for doc in self.documents:
            for chunk in doc.get("chunks", []):
                self._flattened_chunks.append({
                    "doc_id": doc["doc_id"],
                    "institution": doc["institution"],
                    "title": doc["title"],
                    "publication_year": doc["publication_year"],
                    "source_url": doc["source_url"],
                    "crop": doc["crop"],
                    "target_pest": doc.get("target_pest", ""),
                    "target_topic": doc.get("target_topic", ""),
                    "chunk_id": chunk["chunk_id"],
                    "section": chunk["section"],
                    "content_en": chunk.get("content_en", ""),
                    "content_ta": chunk.get("content_ta", ""),
                    "content_hi": chunk.get("content_hi", ""),
                    "content_te": chunk.get("content_te", ""),
                    "content_kn": chunk.get("content_kn", ""),
                    "content_ml": chunk.get("content_ml", ""),
                    "approved_chemicals": chunk.get("approved_chemicals", []),
                    "prohibited_chemicals": chunk.get("prohibited_chemicals", []),
                    "search_text": (
                        f"{doc['title']} {chunk['section']} {doc['crop']} {doc.get('target_pest', '')} "
                        f"{doc.get('target_topic', '')} {chunk.get('content_en', '')} {chunk.get('content_ta', '')} "
                        f"{chunk.get('content_hi', '')} {chunk.get('content_te', '')} {chunk.get('content_kn', '')} "
                        f"{chunk.get('content_ml', '')}"
                    )
                })

    def retrieve(
        self,
        query: str,
        crop: Optional[str] = None,
        locale: str = "en",
        top_k: int = 2
    ) -> Tuple[List[Dict[str, Any]], float]:
        """
        Retrieves top matching grounded chunks for query.
        Returns:
            (matched_chunks, confidence_score)
        """
        norm_query = query.lower()
        query_words = set(re.findall(r"\w+", norm_query))

        # Detect crop from query if not explicitly passed
        detected_crop = (crop or "").lower()
        if not detected_crop:
            for c_key, c_syns in CROP_SYNONYMS.items():
                if any(syn in norm_query for syn in c_syns):
                    detected_crop = c_key
                    break

        # Check topic expansions
        active_topics = []
        for topic_key, synonyms in MULTILINGUAL_SYNONYMS.items():
            if any(syn in norm_query for syn in synonyms):
                active_topics.append(topic_key)

        scored_chunks: List[Tuple[float, Dict[str, Any]]] = []

        for chunk in self._flattened_chunks:
            score = 0.0

            # Crop matching bonus
            if detected_crop and chunk["crop"] == detected_crop:
                score += 3.0

            # Topic matching bonus
            for topic in active_topics:
                if topic in chunk["target_pest"].lower() or topic in chunk["target_topic"].lower() or topic in chunk["section"].lower():
                    score += 6.0

            # Keyword overlap in localized and English content
            combined_text = (
                chunk.get("content_en", "") + " " +
                chunk.get("content_ta", "") + " " +
                chunk.get("content_hi", "") + " " +
                chunk.get("content_te", "") + " " +
                chunk.get("content_kn", "") + " " +
                chunk.get("content_ml", "") + " " +
                chunk["section"] + " " +
                chunk["target_pest"]
            ).lower()

            matches = sum(1 for w in query_words if len(w) > 2 and w in combined_text)
            score += matches * 0.8

            # Specific chemical matches
            for chem in chunk["approved_chemicals"]:
                if chem.lower() in norm_query:
                    score += 4.0

            if score > 1.5:
                scored_chunks.append((score, chunk))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)

        if not scored_chunks:
            return [], 0.0

        top_score = scored_chunks[0][0]
        # Calibrate confidence score between 0.0 and 0.98
        confidence = min(0.98, max(0.15, top_score / 11.0))

        # Re-rank candidates using Reciprocal Rank Fusion (ADR-0004)
        top_candidates = []
        for score, chunk in scored_chunks[:6]:
            c_cand = dict(chunk)
            c_cand["domain_score"] = score
            top_candidates.append(c_cand)

        if detected_crop:
            # Sort top candidates so those matching detected_crop come first
            top_candidates.sort(key=lambda c: 0 if c["crop"] == detected_crop else 1)
        rrf_ranked = hybrid_search_engine.rank(query, top_candidates, text_field="search_text")
        selected = rrf_ranked[:top_k]

        return selected, round(confidence, 2)


# Global singleton instance
grounded_retriever = GroundedRetriever()
