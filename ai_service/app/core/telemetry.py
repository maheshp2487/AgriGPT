import time
import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class TraceSpan(BaseModel):
    span_id: str = Field(default_factory=lambda: uuid.uuid4().hex[:16])
    parent_span_id: Optional[str] = None
    name: str
    span_type: str = "chain"  # llm | tool | retriever | chain
    start_time: float
    end_time: float
    duration_ms: float
    status: str = "OK"  # OK | ERROR
    inputs: Dict[str, Any] = Field(default_factory=dict)
    outputs: Dict[str, Any] = Field(default_factory=dict)
    attributes: Dict[str, Any] = Field(default_factory=dict)


class SystemMetrics(BaseModel):
    total_spans_recorded: int
    total_llm_queries: int
    cibrc_statutory_refusals: int
    grounded_advisories: int
    avg_duration_ms: float
    p95_duration_ms: float
    estimated_prompt_tokens: int
    estimated_completion_tokens: int


class TelemetryCollector:
    """
    In-memory OpenTelemetry & LangSmith/Phoenix compatible trace collector.
    Records distributed execution spans, token usage, latency percentiles,
    and agricultural safety enforcement events.
    """

    def __init__(self, max_spans: int = 500) -> None:
        self.max_spans = max_spans
        self._spans: List[TraceSpan] = []
        self._statutory_refusals = 0
        self._grounded_advisories = 0
        self._total_prompt_tokens = 0
        self._total_completion_tokens = 0

    def record_span(
        self,
        name: str,
        span_type: str,
        start_time: float,
        end_time: float,
        inputs: Dict[str, Any],
        outputs: Dict[str, Any],
        attributes: Dict[str, Any],
        parent_span_id: Optional[str] = None,
        status: str = "OK",
    ) -> TraceSpan:
        duration_ms = round((end_time - start_time) * 1000.0, 2)
        span = TraceSpan(
            parent_span_id=parent_span_id,
            name=name,
            span_type=span_type,
            start_time=start_time,
            end_time=end_time,
            duration_ms=duration_ms,
            status=status,
            inputs=inputs,
            outputs=outputs,
            attributes=attributes,
        )

        if len(self._spans) >= self.max_spans:
            self._spans.pop(0)
        self._spans.append(span)

        # Track safety and token metrics
        safety_status = attributes.get("safety_status")
        if safety_status == "STATUTORY_REFUSAL":
            self._statutory_refusals += 1
        elif safety_status == "SAFE":
            self._grounded_advisories += 1

        self._total_prompt_tokens += attributes.get("prompt_tokens", 0)
        self._total_completion_tokens += attributes.get("completion_tokens", 0)

        return span

    def get_traces(self, limit: int = 50) -> List[TraceSpan]:
        return list(reversed(self._spans[-limit:]))

    def get_metrics(self) -> SystemMetrics:
        if not self._spans:
            return SystemMetrics(
                total_spans_recorded=0,
                total_llm_queries=0,
                cibrc_statutory_refusals=0,
                grounded_advisories=0,
                avg_duration_ms=0.0,
                p95_duration_ms=0.0,
                estimated_prompt_tokens=0,
                estimated_completion_tokens=0,
            )

        durations = sorted(s.duration_ms for s in self._spans)
        avg_dur = round(sum(durations) / len(durations), 2)
        p95_index = int(len(durations) * 0.95)
        p95_dur = durations[min(p95_index, len(durations) - 1)]

        return SystemMetrics(
            total_spans_recorded=len(self._spans),
            total_llm_queries=self._statutory_refusals + self._grounded_advisories,
            cibrc_statutory_refusals=self._statutory_refusals,
            grounded_advisories=self._grounded_advisories,
            avg_duration_ms=avg_dur,
            p95_duration_ms=p95_dur,
            estimated_prompt_tokens=self._total_prompt_tokens,
            estimated_completion_tokens=self._total_completion_tokens,
        )


telemetry_collector = TelemetryCollector()
