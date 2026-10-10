import json
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any

DATA_PATH = Path(__file__).parent / "data" / "cibrc_restrictions_v2026.json"


class CIBRCValidator:
    """
    Central Insecticides Board & Registration Committee (CIBRC) statutory restriction validator.
    Inspects queries and agronomic recommendations against the statutory list of banned and
    restricted pesticides in India.
    """

    def __init__(self, data_path: Optional[Path] = None):
        path = data_path or DATA_PATH
        with open(path, "r", encoding="utf-8") as f:
            self._catalog = json.load(f)
        self.version = self._catalog.get("version", "2026.1")
        self.restrictions = self._catalog.get("restrictions", [])

    def check_query_safety(
        self,
        query: str,
        crop: Optional[str] = None,
        locale: str = "en"
    ) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """
        Inspects query text for mentions of prohibited substances.
        Returns:
            (is_safe, refusal_details)
            If unsafe, is_safe is False and refusal_details contains statutory citations and localized messages.
        """
        norm_query = query.lower()
        norm_crop = (crop or "").lower()

        # Check against each restricted substance
        for item in self.restrictions:
            chem_name = item["chemical_name"].lower()
            synonyms = [s.lower() for s in item.get("synonyms", [])]
            names_to_check = [chem_name] + synonyms

            matched_name = None
            for name in names_to_check:
                # For ASCII names, use word boundary; for Unicode/Indic names, use substring or Unicode-aware boundary
                if name.isascii():
                    pattern = r"\b" + re.escape(name) + r"\b"
                    if re.search(pattern, norm_query, re.IGNORECASE):
                        matched_name = item["chemical_name"]
                        break
                else:
                    if name in norm_query:
                        matched_name = item["chemical_name"]
                        break

            if matched_name:
                prohibited_crops = [c.lower() for c in item.get("prohibited_crops", [])]
                
                # Check if banned across all crops or banned on this specific crop/vegetables
                is_prohibited = False
                if "all_crops" in prohibited_crops or "all" in prohibited_crops:
                    is_prohibited = True
                elif "vegetables" in prohibited_crops:
                    veg_keywords = [
                        "vegetable", "vegetables", "tomato", "brinjal", "chilli", "okra", "bhendi", "cabbage", "cauliflower",
                        "காய்கறி", "தக்காளி", "கத்தரி", "வெண்டை",
                        "सब्जी", "सब्जियों", "टमाटर", "बैंगन", "मिर्च", "भिंडी",
                        "కూరగాయ", "కూరగాయలు", "టమోటా", "వంకాయ", "బెండకాయ",
                        "ತರಕಾರಿ", "ತರಕಾರಿಗಳು", "ಟೊಮೆಟೊ", "ಬದನೆಕಾಯಿ", "ಬೆಂಡೆಕಾಯಿ",
                        "പച്ചക്കറി", "പച്ചക്കറികൾ", "തക്കാളി", "വഴുതന", "വെണ്ടക്ക"
                    ]
                    if norm_crop in ["vegetable", "vegetables", "tomato", "brinjal", "chilli", "okra", "bhendi"] or any(vk in norm_query for vk in veg_keywords):
                        is_prohibited = True
                else:
                    is_prohibited = True

                if is_prohibited:
                    loc = locale.lower()
                    if loc.startswith("ta"):
                        remark = item.get("statutory_remark_ta", item.get("statutory_remark_en", ""))
                    elif loc.startswith("hi"):
                        remark = item.get("statutory_remark_hi", item.get("statutory_remark_en", ""))
                    elif loc.startswith("te"):
                        remark = item.get("statutory_remark_te", item.get("statutory_remark_en", ""))
                    elif loc.startswith("kn"):
                        remark = item.get("statutory_remark_kn", item.get("statutory_remark_en", ""))
                    elif loc.startswith("ml"):
                        remark = item.get("statutory_remark_ml", item.get("statutory_remark_en", ""))
                    else:
                        remark = item.get("statutory_remark_en", "")

                    return False, {
                        "chemical_name": matched_name,
                        "regulatory_status": item["regulatory_status"],
                        "gazette_notification": item["gazette_notification"],
                        "statutory_remark": remark
                    }

        return True, None


# Global singleton instance
cibrc_validator = CIBRCValidator()
