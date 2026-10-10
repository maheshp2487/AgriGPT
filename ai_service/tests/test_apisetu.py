import asyncio
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.apisetu import EligibilityCheckRequest, SchemeType
from app.services.apisetu import apisetu_service

client = TestClient(app)


def test_apisetu_token_lifecycle():
    token = asyncio.run(apisetu_service.get_access_token())
    assert token.startswith("sandbox_setu_token_")
    assert apisetu_service._is_token_valid() is True

    # Calling again returns cached token
    token2 = asyncio.run(apisetu_service.get_access_token())
    assert token2 == token


def test_apisetu_verify_pm_kisan_active():
    req = EligibilityCheckRequest(
        scheme=SchemeType.PM_KISAN,
        beneficiary_id="TN-TH-1029485",
        state="Tamil Nadu",
        district="Thanjavur",
    )
    res = asyncio.run(apisetu_service.verify_scheme_eligibility(req))
    assert res.success is True
    assert res.status == "ELIGIBLE_AND_ACTIVE"
    assert res.details is not None
    assert res.details.ekyc_verified is True
    assert res.details.aadhaar_seeded is True
    assert res.details.land_records_verified is True
    assert res.details.installment_count == 18
    assert res.details.disbursement_amount == 2000.0
    assert len(res.actionable_recommendations) > 0


def test_apisetu_verify_pm_kisan_ekyc_pending():
    req = EligibilityCheckRequest(
        scheme=SchemeType.PM_KISAN,
        beneficiary_id="TEST-PMKISAN-EKYC-PENDING",
        state="Uttar Pradesh",
        district="Varanasi",
    )
    res = asyncio.run(apisetu_service.verify_scheme_eligibility(req))
    assert res.success is True
    assert res.status == "PENDING_EKYC"
    assert res.details is not None
    assert res.details.ekyc_verified is False
    assert "Common Service Centre" in res.actionable_recommendations[0]


def test_apisetu_verify_soil_health_card():
    req = EligibilityCheckRequest(
        scheme=SchemeType.SOIL_HEALTH_CARD,
        beneficiary_id="SHC-2025-TN-9812",
        state="Tamil Nadu",
        district="Madurai",
    )
    res = asyncio.run(apisetu_service.verify_scheme_eligibility(req))
    assert res.success is True
    assert res.details is not None
    assert "nitrogen_rating" in res.details.additional_metadata
    assert res.details.additional_metadata["nitrogen_rating"].startswith("LOW")


def test_apisetu_verify_kisan_credit_card():
    req = EligibilityCheckRequest(
        scheme=SchemeType.KISAN_CREDIT_CARD,
        beneficiary_id="KCC-AP-09281",
        state="Andhra Pradesh",
        district="Kurnool",
    )
    res = asyncio.run(apisetu_service.verify_scheme_eligibility(req))
    assert res.success is True
    assert res.details is not None
    assert res.details.disbursement_amount == 160000.0
    assert "credit_limit" in res.details.additional_metadata


def test_apisetu_api_endpoint():
    response = client.post(
        "/v1/apisetu/verify",
        json={
            "scheme": "PM_KISAN",
            "beneficiary_id": "TEST-PMKISAN-ACTIVE-1",
            "state": "Karnataka",
            "district": "Davanagere",
        },
        headers={"X-Correlation-ID": "test-corr-abc-123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["scheme"] == "PM_KISAN"
    assert data["status"] == "ELIGIBLE_AND_ACTIVE"
    assert response.headers.get("x-correlation-id") == "test-corr-abc-123"
    assert "x-response-time-ms" in response.headers


def test_observability_middleware_generates_correlation_id_if_omitted():
    response = client.get("/v1/health")
    assert response.status_code == 200
    assert response.headers.get("x-correlation-id") is not None
    assert response.headers.get("x-correlation-id").startswith("corr_")
    assert "x-response-time-ms" in response.headers
