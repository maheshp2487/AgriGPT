from typing import Optional
from fastapi import APIRouter, Header, HTTPException, status

from app.core.config import settings
from app.core.logging import get_logger
from app.schemas.apisetu import EligibilityCheckRequest, EligibilityCheckResponse
from app.services.apisetu import apisetu_service

logger = get_logger(__name__)

router = APIRouter(prefix="/apisetu", tags=["API Setu Gateway"])


@router.post(
    "/verify",
    response_model=EligibilityCheckResponse,
    summary="Verify Farmer Scheme Eligibility via API Setu",
    description="Validates beneficiary status, eKYC compliance, and DBT disbursement records against National Data Exchange registries."
)
async def verify_scheme_eligibility(
    request: EligibilityCheckRequest,
    x_correlation_id: Optional[str] = Header(None, alias="X-Correlation-ID"),
) -> EligibilityCheckResponse:
    """
    Checks beneficiary eligibility across PM-KISAN, Soil Health Card, KCC, and PMFBY.
    """
    try:
        logger.info(
            f"API Setu verification request: scheme={request.scheme} "
            f"state={request.state} district={request.district}"
        )
        response = await apisetu_service.verify_scheme_eligibility(
            request=request,
            correlation_id=x_correlation_id,
        )
        return response
    except Exception as e:
        logger.error(f"API Setu verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"API Setu gateway error: {str(e)}",
        )


@router.get(
    "/status",
    summary="API Setu Gateway Adapter Status",
    description="Returns configuration status and token lifecycle details of the API Setu adapter."
)
async def get_apisetu_status() -> dict:
    return {
        "enabled": settings.API_SETU_ENABLED,
        "mode": apisetu_service.mode,
        "base_url": apisetu_service.base_url,
        "token_valid": apisetu_service._is_token_valid(),
        "attribution": "National Data Exchange (API Setu) / Govt. of India",
    }
