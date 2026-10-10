from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime

import time
import uuid

from app.core.config import settings
from app.core.logging import logger
from app.api.v1.health import router as health_router
from app.api.v1.mandi import router as mandi_router
from app.api.v1.weather import router as weather_router
from app.api.v1.chat import router as chat_router
from app.api.v1.auth import router as auth_router
from app.api.v1.crop_doctor import router as crop_doctor_router
from app.api.v1.apisetu import router as apisetu_router
from app.api.v1.telemetry import router as telemetry_router

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Agricultural Intelligence and Provider Integration Service for AgriGPT National Platform",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Distributed Observability Middleware (Correlation IDs & Response Latency Profiling)
@app.middleware("http")
async def observability_and_correlation_middleware(request: Request, call_next):
    correlation_id = request.headers.get("X-Correlation-ID") or f"corr_{uuid.uuid4().hex[:12]}"
    request.state.correlation_id = correlation_id
    start_time = time.perf_counter()

    response = await call_next(request)

    duration_ms = (time.perf_counter() - start_time) * 1000.0
    response.headers["X-Correlation-ID"] = correlation_id
    response.headers["X-Response-Time-Ms"] = f"{duration_ms:.2f}"
    return response

# CORS configuration for Next.js BFF and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global RFC 7807 Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "type": "https://agrigpt.in/errors/internal-error",
            "title": "Internal Server Error",
            "status": 500,
            "detail": "An internal error occurred in the AgriGPT AI service.",
            "instance": request.url.path,
            "timestamp": datetime.now().isoformat()
        }
    )

# Mount API Routers
app.include_router(health_router, prefix="/v1")
app.include_router(health_router)  # Also mounts /healthz at root for Kubernetes probes
app.include_router(mandi_router, prefix="/v1")
app.include_router(weather_router, prefix="/v1")
app.include_router(chat_router, prefix="/v1")
app.include_router(auth_router, prefix="/v1")
app.include_router(crop_doctor_router, prefix="/v1")
app.include_router(apisetu_router, prefix="/v1")
app.include_router(telemetry_router, prefix="/v1")


@app.get("/")
async def root():
    return {
        "service": settings.APP_NAME,
        "status": "operational",
        "documentation": "/docs",
        "health": "/v1/health"
    }
