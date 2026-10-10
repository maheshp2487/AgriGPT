import pytest
from app.services.agronomy import agronomy_service
from app.schemas.chat import SafetyStatus


def test_agri_universe_tomato_leaf_curl_advisory():
    """Verify that Tomato pest and disease queries return comprehensive ICAR-grounded advice."""
    res = agronomy_service.process_query(
        query="How to manage tomato leaf curl virus and fruit borer?",
        crop="tomato",
        locale="en"
    )
    assert res.grounding_metadata.safety_status == SafetyStatus.SAFE
    assert res.grounding_metadata.is_grounded is True
    assert "Tomato" in res.answer or "Leaf Curl" in res.answer
    assert len(res.citations) > 0
    assert "IIHR" in res.citations[0].institution or "ICAR" in res.citations[0].institution
    assert "krishi.icar.gov.in" in res.citations[0].source_url


def test_agri_universe_soil_health_and_npk_multilingual_tamil():
    """Verify Soil Health Card NPK query in Tamil."""
    res = agronomy_service.process_query(
        query="மண் பரிசோதனை மற்றும் NPK உரம் இடும் முறை என்ன?",
        locale="ta"
    )
    assert res.grounding_metadata.safety_status == SafetyStatus.SAFE
    assert res.grounding_metadata.is_grounded is True
    assert "மண்" in res.answer or "உர" in res.answer
    assert len(res.citations) > 0


def test_agri_universe_drip_irrigation_hindi():
    """Verify Drip irrigation advisory in Hindi."""
    res = agronomy_service.process_query(
        query="ड्रिप सिंचाई के क्या फायदे हैं और सरकारी सब्सिडी कैसे मिलती है?",
        locale="hi"
    )
    assert res.grounding_metadata.safety_status == SafetyStatus.SAFE
    assert res.grounding_metadata.is_grounded is True
    assert "ड्रिप" in res.answer or "सिंचाई" in res.answer
    assert len(res.citations) > 0


def test_agri_universe_organic_jeevamrutha():
    """Verify organic Jeevamrutha preparation protocol."""
    res = agronomy_service.process_query(
        query="How to prepare liquid Jeevamrutha for natural farming?",
        locale="en"
    )
    assert res.grounding_metadata.safety_status == SafetyStatus.SAFE
    assert res.grounding_metadata.is_grounded is True
    assert "Jeevamrutha" in res.answer or "cow dung" in res.answer
    assert len(res.citations) > 0
