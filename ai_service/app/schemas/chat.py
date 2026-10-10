from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field


class SafetyStatus(str, Enum):
    SAFE = "SAFE"
    STATUTORY_REFUSAL = "STATUTORY_REFUSAL"
    FAIL_CLOSED_UNGROUNDED = "FAIL_CLOSED_UNGROUNDED"


class Citation(BaseModel):
    chunk_id: str
    doc_title: str
    institution: str
    publication_year: int
    source_url: str
    section: str
    crop: str


class GroundingMetadata(BaseModel):
    is_grounded: bool
    retrieval_confidence: float = Field(..., ge=0.0, le=1.0)
    safety_status: SafetyStatus
    cibrc_checked: bool = True
    cibrc_restricted_substances_detected: List[str] = Field(default_factory=list)
    statutory_gazette_reference: Optional[str] = None


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(..., max_length=2000)


class ChatQueryRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=1000)
    locale: str = Field(default="en", description="Locale code: 'en', 'ta', 'hi', 'te', 'kn', or 'ml'")
    crop: Optional[str] = Field(default=None, description="Optional crop filter, e.g. 'paddy', 'maize'")
    state: Optional[str] = Field(default=None)
    district: Optional[str] = Field(default=None)
    session_id: Optional[str] = Field(default=None)
    messages: Optional[List[ChatMessage]] = Field(default_factory=list, description="Multi-turn conversation history")


class ChatCompletionResponse(BaseModel):
    answer: str
    locale: str
    citations: List[Citation] = Field(default_factory=list)
    grounding_metadata: GroundingMetadata
    field_disclaimer: str
