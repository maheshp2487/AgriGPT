from typing import List, Optional
from pydantic import BaseModel, Field


class OtpRequest(BaseModel):
    phone_number: str = Field(..., description="Indian 10-digit mobile number, e.g. 9876543210 or +919876543210")


class OtpVerifyRequest(BaseModel):
    phone_number: str = Field(..., description="Mobile number associated with OTP request")
    otp: str = Field(..., min_length=4, max_length=6, description="4 to 6 digit OTP")


class EmailLoginRequest(BaseModel):
    email: str = Field(..., description="Farmer or stakeholder email address")
    otp: Optional[str] = Field("123456", description="Optional verification OTP or passcode")


class FarmerProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=120)
    state: Optional[str] = Field(None, max_length=60)
    district: Optional[str] = Field(None, max_length=60)
    primary_language: Optional[str] = Field(None, pattern="^(en|ta|hi|te|kn|ml)$")
    crops_grown: Optional[List[str]] = Field(None)
    land_area_acres: Optional[float] = Field(None, ge=0.1, le=1000.0)
    preferred_market: Optional[str] = Field(None, max_length=100)


class FarmerProfileResponse(BaseModel):
    id: str
    user_id: str
    full_name: Optional[str] = None
    state: str = "Tamil Nadu"
    district: str = "Thanjavur"
    primary_language: str = "ta"
    crops_grown: List[str] = ["paddy"]
    land_area_acres: float = 2.50
    preferred_market: Optional[str] = None
    fpo_name: Optional[str] = "Thanjavur Farmers Cooperative"


class UserResponse(BaseModel):
    id: str
    phone_number: str
    role: str = "farmer"
    created_at: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    profile: FarmerProfileResponse
