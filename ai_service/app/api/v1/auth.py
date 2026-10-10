from fastapi import APIRouter, Header, HTTPException, status
from typing import Optional
from app.schemas.auth import (
    OtpRequest,
    OtpVerifyRequest,
    EmailLoginRequest,
    FarmerProfileUpdate,
    FarmerProfileResponse,
    AuthResponse,
)
from app.services.auth import auth_service, verify_token

router = APIRouter(prefix="/auth", tags=["auth"])


def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header"
        )
    token = authorization.split(" ")[1]
    user_id = verify_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token"
        )
    return user_id


@router.post("/otp/send")
async def send_otp(payload: OtpRequest):
    try:
        res = auth_service.send_otp(payload.phone_number)
        return res
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/otp/verify", response_model=AuthResponse)
async def verify_otp(payload: OtpVerifyRequest):
    try:
        return auth_service.verify_otp(payload.phone_number, payload.otp)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/email/login", response_model=AuthResponse)
async def login_email(payload: EmailLoginRequest):
    try:
        return auth_service.login_with_email(payload.email)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/profile", response_model=FarmerProfileResponse)
async def get_profile(authorization: Optional[str] = Header(None)):
    user_id = get_current_user_id(authorization)
    try:
        return auth_service.get_profile(user_id)
    except KeyError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")


@router.put("/profile", response_model=FarmerProfileResponse)
async def update_profile(updates: FarmerProfileUpdate, authorization: Optional[str] = Header(None)):
    user_id = get_current_user_id(authorization)
    try:
        return auth_service.update_profile(user_id, updates)
    except KeyError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")


@router.get("/privacy-policy", summary="DPDP Act 2023 Statutory Privacy Policy")
async def get_privacy_policy():
    """
    Returns data fiduciary disclosure, purpose specification, and DPO contact.
    """
    return auth_service.get_privacy_notice()


@router.get("/export-data", summary="DPDP Section 11 Data Portability Export")
async def export_farmer_data(authorization: Optional[str] = Header(None)):
    """
    Returns complete personal and farm profile data in structured JSON format.
    """
    user_id = get_current_user_id(authorization)
    try:
        return auth_service.export_user_data(user_id)
    except KeyError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User record not found")


@router.delete("/delete-account", summary="DPDP Section 12 Right to Erasure")
async def delete_farmer_account(authorization: Optional[str] = Header(None)):
    """
    Permanently purges personal identification, phone numbers, and profile records.
    """
    user_id = get_current_user_id(authorization)
    try:
        return auth_service.delete_user_data(user_id)
    except KeyError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User record not found")
