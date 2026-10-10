from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.security import verify_service_token
from app.core.logging import logger
from app.providers.agmarknet import agmarknet_provider
from app.schemas.mandi import MandiPriceResponse

router = APIRouter(prefix="/mandi", tags=["Market Intelligence"])


@router.get("/prices", response_model=MandiPriceResponse)
async def get_mandi_prices(
    state: str = Query(..., description="Indian State (e.g. Tamil Nadu, Madhya Pradesh)"),
    district: str = Query(..., description="District Name (e.g. Thanjavur, Sehore)"),
    commodity: str = Query(..., description="Commodity Name (e.g. Groundnut, Soybean)"),
    limit: int = Query(20, ge=1, le=100),
    _authorized: bool = Depends(verify_service_token)
):
    """
    Retrieves normalized mandi wholesale prices for the specified commodity and district.
    Queries live AGMARKNET OGD endpoint with fallback to composite cache.
    Never fabricates mock prices.
    """
    logger.info(f"Querying mandi prices: state='{state}', district='{district}', commodity='{commodity}'")
    try:
        response = await agmarknet_provider.fetch_prices(
            state=state,
            district=district,
            commodity=commodity,
            limit=limit
        )
        return response
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc)
        )
    except Exception as exc:
        logger.error(f"Unexpected error in get_mandi_prices: {str(exc)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving mandi prices."
        )
