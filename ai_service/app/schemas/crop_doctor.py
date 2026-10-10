from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.chat import Citation, SafetyStatus


class CropDoctorResponse(BaseModel):
    crop: str
    detected_pest_disease: str
    confidence: float
    confidence_level: str  # "HIGH_CONFIDENCE", "MARGINAL_INDICATION", "INCONCLUSIVE"
    symptoms_observed: List[str]
    cultural_management: List[str]
    recommended_chemical: Optional[str] = None
    dosage_per_hectare: Optional[str] = None
    pre_harvest_interval_days: Optional[int] = None
    cibrc_safety_status: SafetyStatus
    citations: List[Citation]
    advisory_text: str
    mandatory_field_disclaimer: str
