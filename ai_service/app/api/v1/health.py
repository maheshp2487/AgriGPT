from fastapi import APIRouter
from app.core.config import settings
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
@router.get("/healthz", response_model=HealthResponse)
async def get_health():
    """
    Service health and readiness probe.
    Returns status of core adapters and runtime dependencies.
    """
    return HealthResponse(
        status="healthy",
        app_name=settings.APP_NAME,
        environment=settings.ENVIRONMENT,
        version="1.0.0",
        dependencies={
            "ogd_agmarknet": {
                "resource_id": settings.OGD_RESOURCE_ID,
                "configured": bool(settings.OGD_API_KEY.get_secret_value())
            },
            "open_meteo": {
                "base_url": settings.OPEN_METEO_BASE_URL,
                "status": "ready"
            },
            "imd_enterprise": {
                "enabled": settings.IMD_API_ENABLED,
                "status": "pending_institutional_partner"
            }
        }
    )
