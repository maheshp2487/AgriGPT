from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, Field


class SchemeType(str, Enum):
    PM_KISAN = "PM_KISAN"
    SOIL_HEALTH_CARD = "SOIL_HEALTH_CARD"
    KISAN_CREDIT_CARD = "KISAN_CREDIT_CARD"
    PMFBY = "PMFBY"


class EligibilityCheckRequest(BaseModel):
    scheme: SchemeType = Field(..., description="Target government scheme to verify")
    beneficiary_id: str = Field(..., min_length=4, max_length=50, description="Farmer ID, Registration No, or Sample No")
    state: str = Field(..., min_length=2, max_length=50, description="Farmer state of cultivation")
    district: str = Field(..., min_length=2, max_length=50, description="Farmer district")
    mobile_number: Optional[str] = Field(default=None, description="Optional 10-digit mobile number for matching")


class BeneficiaryDetails(BaseModel):
    beneficiary_name_masked: str = Field(..., description="Privacy-preserving masked name (e.g. S****m K******h)")
    registration_id: str = Field(..., description="Official scheme registration identifier")
    state: str = Field(..., description="Registered State")
    district: str = Field(..., description="Registered District")
    ekyc_verified: bool = Field(..., description="Biometric/OTP eKYC verification status")
    aadhaar_seeded: bool = Field(..., description="Aadhaar-seeded bank account for Direct Benefit Transfer (DBT)")
    land_records_verified: bool = Field(..., description="State land portal integration verification status")
    installment_count: Optional[int] = Field(default=None, description="Total successful DBT installments credited")
    latest_installment_date: Optional[str] = Field(default=None, description="Date of most recent disbursement (ISO-8601)")
    latest_installment_status: Optional[str] = Field(default=None, description="CREDITED | PENDING_FTO | REJECTED")
    disbursement_amount: Optional[float] = Field(default=None, description="Amount in INR credited in latest cycle")
    rejection_reason: Optional[str] = Field(default=None, description="Reason if disbursement is pending or rejected")
    additional_metadata: Optional[dict[str, Any]] = Field(default_factory=dict, description="Scheme specific fields (e.g. NPK values)")


class EligibilityCheckResponse(BaseModel):
    success: bool = Field(..., description="Whether the verification query completed")
    scheme: SchemeType = Field(..., description="Verified scheme")
    status: str = Field(..., description="ELIGIBLE_AND_ACTIVE | PENDING_EKYC | PENDING_LAND_SEEDING | NOT_FOUND | SANDBOX_SIMULATED")
    gateway_mode: str = Field(..., description="SANDBOX | PRODUCTION")
    verified_at: str = Field(..., description="Timestamp of authoritative gateway verification")
    details: Optional[BeneficiaryDetails] = Field(default=None, description="Verified beneficiary record details")
    actionable_recommendations: list[str] = Field(default_factory=list, description="Immediate guidance steps for the farmer")
    attribution: str = Field(
        default="National Data Exchange (API Setu) / Ministry of Agriculture & Farmers Welfare, Govt. of India",
        description="Statutory source attribution"
    )
    correlation_id: Optional[str] = Field(default=None, description="Distributed tracing correlation ID")
