from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.security import verify_service_token
from app.core.logging import logger
from app.providers.weather import weather_provider
from app.schemas.weather import WeatherQueryResponse

router = APIRouter(prefix="/weather", tags=["Weather & Agromet"])


@router.get("/forecast", response_model=WeatherQueryResponse)
async def get_weather_forecast(
    district: str = Query(..., description="District Name (e.g. Thanjavur, Sehore)"),
    state: str = Query(..., description="State Name (e.g. Tamil Nadu, Madhya Pradesh)"),
    lat: float = Query(..., ge=-90.0, le=90.0, description="Latitude in decimal degrees"),
    lon: float = Query(..., ge=-180.0, le=180.0, description="Longitude in decimal degrees"),
    _authorized: bool = Depends(verify_service_token)
):
    """
    Retrieves current weather and 5-day NWP numerical model forecast with
    actionable Delta-T based agromet spraying suitability calculations.
    """
    logger.info(f"Querying weather forecast: district='{district}', lat={lat}, lon={lon}")
    try:
        response = await weather_provider.get_forecast(
            district=district,
            state=state,
            lat=lat,
            lon=lon
        )
        return response
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc)
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc)
        )
    except Exception as exc:
        logger.error(f"Unexpected error in get_weather_forecast: {str(exc)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving meteorological forecast."
        )
