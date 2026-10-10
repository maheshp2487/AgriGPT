from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_telemetry_metrics_and_traces():
    # Send a query
    resp = client.post(
        "/v1/chat/completions",
        json={"query": "How to control yellow stem borer in paddy?"},
        headers={"X-Correlation-ID": "test-telemetry-corr-1"}
    )
    assert resp.status_code == 200

    # Verify metrics
    metrics_res = client.get("/v1/telemetry/metrics")
    assert metrics_res.status_code == 200
    metrics = metrics_res.json()
    assert metrics["total_spans_recorded"] > 0
    assert metrics["grounded_advisories"] > 0

    # Verify traces
    traces_res = client.get("/v1/telemetry/traces?limit=10")
    assert traces_res.status_code == 200
    traces = traces_res.json()
    assert len(traces) > 0
    latest_span = traces[0]
    assert "span_id" in latest_span
    assert "duration_ms" in latest_span
    assert "inputs" in latest_span
    assert "outputs" in latest_span
