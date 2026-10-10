from typing import List, Optional
from fastapi import APIRouter, Query

from app.core.telemetry import SystemMetrics, TraceSpan, telemetry_collector

router = APIRouter(prefix="/telemetry", tags=["Observability & Telemetry"])


@router.get(
    "/metrics",
    response_model=SystemMetrics,
    summary="Agricultural LLM System Operational Metrics",
    description="Returns aggregate inference latency percentiles (P50, P95), CIBRC statutory safety enforcement counts, and token telemetry."
)
async def get_system_metrics() -> SystemMetrics:
    return telemetry_collector.get_metrics()


@router.get(
    "/traces",
    response_model=List[TraceSpan],
    summary="Distributed OpenTelemetry & LangSmith Trace Spans",
    description="Returns recent execution spans with inputs, outputs, grounding citations, and safety metadata."
)
async def get_trace_spans(limit: int = Query(default=20, ge=1, le=100)) -> List[TraceSpan]:
    return telemetry_collector.get_traces(limit=limit)
