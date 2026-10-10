import secrets
from fastapi import Header, HTTPException, status
from app.core.config import settings


def verify_service_token(x_service_key: str = Header(None, alias="X-Service-Key")) -> bool:
    """
    Validates service-to-service authentication header.
    Next.js BFF sends this secret when forwarding browser requests.
    In development mode, allows missing key with warning if configured.
    """
    expected = settings.SERVICE_SHARED_SECRET.get_secret_value()

    # If secret is set, enforce constant-time check
    if expected and expected != "development_shared_secret_min_32_chars_long":
        if not x_service_key or not secrets.compare_digest(x_service_key, expected):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or missing service authentication token."
            )
    return True


verify_service_key = verify_service_token
