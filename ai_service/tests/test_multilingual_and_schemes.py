import pytest
from app.knowledge.schemes import government_schemes_engine
from app.knowledge.cibrc import cibrc_validator
from app.services.agronomy import agronomy_service
from app.schemas.chat import SafetyStatus


def test_pmfby_localized_active_window():
    """Verify PMFBY localized calamity within 72h returns actionable notice instructions."""
    res = government_schemes_engine.evaluate_pmfby_scenario(
        peril="hailstorm damage",
        hours_elapsed=24,
        locale="en"
    )
    assert res["peril_category"] == "LOCALIZED_CALAMITY_ACTIVE_WINDOW"
    assert res["requires_72h_notice"] is True
    assert "14447" in res["helpline"]
    assert "Crop Insurance App" in res["advisory"]
    assert len(res["required_documents"]) >= 3


def test_pmfby_localized_expired_window():
    """Verify PMFBY localized calamity beyond 72h directs farmer to AAO condonation petition."""
    res = government_schemes_engine.evaluate_pmfby_scenario(
        peril="inundation",
        hours_elapsed=96,
        locale="en"
    )
    assert res["peril_category"] == "LOCALIZED_CALAMITY_EXPIRED_WINDOW"
    assert res["requires_72h_notice"] is True
    assert "Assistant Agriculture Officer" in res["advisory"]


def test_pmfby_widespread_area_approach():
    """Verify PMFBY widespread drought uses Area Approach without requiring individual 72h notice."""
    res = government_schemes_engine.evaluate_pmfby_scenario(
        peril="severe drought across the district",
        locale="en"
    )
    assert res["peril_category"] == "WIDESPREAD_PERIL_AREA_APPROACH"
    assert res["requires_72h_notice"] is False
    assert "Crop Cutting Experiments" in res["advisory"]
    assert "NOT required" in res["advisory"]


def test_pmfby_post_harvest_loss():
    """Verify PMFBY post-harvest loss applies to cut-and-spread crops within 14 days."""
    res = government_schemes_engine.evaluate_pmfby_scenario(
        peril="unseasonal rain on harvested crop",
        is_post_harvest=True,
        locale="en"
    )
    assert res["peril_category"] == "POST_HARVEST_LOSS_72H"
    assert res["requires_72h_notice"] is True
    assert "cut-and-spread" in res["advisory"]
    assert "14 days" in res["advisory"]


def test_pm_kisan_query_matching():
    """Verify PM-KISAN query returns ₹6,000 DBT and mandatory eKYC prerequisites."""
    res = agronomy_service.process_query(
        query="What are the eligibility requirements for PM-KISAN 2000 installment?",
        locale="en"
    )
    assert res.grounding_metadata.safety_status == SafetyStatus.SAFE
    assert "PM-KISAN" in res.answer
    assert "eKYC" in res.answer
    assert "6,000" in res.answer
    assert len(res.citations) > 0
    assert "pmkisan.gov.in" in res.citations[0].source_url


def test_soil_health_card_query():
    """Verify Soil Health Card query retrieves 12 parameter testing advice."""
    res = agronomy_service.process_query(
        query="How to apply for Soil Health Card testing?",
        locale="en"
    )
    assert res.grounding_metadata.safety_status == SafetyStatus.SAFE
    assert "Soil Health Card" in res.answer
    assert "soilhealth.dac.gov.in" in res.citations[0].source_url


def test_agronomy_all_six_languages():
    """Verify grounded benchmark agronomy query succeeds across all 6 mandatory languages."""
    queries = [
        ("en", "How to manage yellow stem borer in paddy?"),
        ("ta", "நெல் தண்டு துளைப்பான் மேலாண்மை என்ன?"),
        ("hi", "धान के तना छेदक का प्रबंधन कैसे करें?"),
        ("te", "వరిలో కాండం తొలిచే పురుగు నివారణ ఏమిటి?"),
        ("kn", "ಭತ್ತದ ಕಾಂಡ ಕೊರೆಯುವ ಹುಳು ನಿರ್ವಹಣೆ ಹೇಗೆ?"),
        ("ml", "നെല്ലിലെ തണ്ടുതുരപ്പൻ പുഴു നിയന്ത്രണം എങ്ങനെ?")
    ]

    for loc, q in queries:
        resp = agronomy_service.process_query(query=q, crop="paddy", locale=loc)
        assert resp.grounding_metadata.safety_status == SafetyStatus.SAFE, f"Failed on locale {loc}"
        assert resp.grounding_metadata.is_grounded is True, f"Ungrounded on locale {loc}"
        assert resp.grounding_metadata.retrieval_confidence >= 0.70, f"Low confidence on {loc}"
        assert len(resp.citations) > 0, f"Missing citations on {loc}"
        assert resp.locale == loc, f"Locale mismatch on {loc}"


def test_cibrc_refusal_across_indic_languages():
    """Verify statutory CIBRC refusal triggers in Telugu, Kannada, and Malayalam."""
    # Telugu
    res_te = agronomy_service.process_query(
        query="వరి పంటలో ఎండోసల్ఫాన్ వాడొచ్చా?",
        crop="paddy",
        locale="te"
    )
    assert res_te.grounding_metadata.safety_status == SafetyStatus.STATUTORY_REFUSAL
    assert "నిషేధించబడింది" in res_te.answer

    # Kannada
    res_kn = agronomy_service.process_query(
        query="ಭತ್ತಕ್ಕೆ ಎಂಡೋಸಲ್ಫಾನ್ ಸಿಂಪಡಿಸಬಹುದೇ?",
        crop="paddy",
        locale="kn"
    )
    assert res_kn.grounding_metadata.safety_status == SafetyStatus.STATUTORY_REFUSAL
    assert "ನಿಷೇಧಿಸಲಾಗಿದೆ" in res_kn.answer

    # Malayalam
    res_ml = agronomy_service.process_query(
        query="നെല്ലിൽ എൻഡോസൾഫാൻ മരുന്ന് തളിക്കാമോ?",
        crop="paddy",
        locale="ml"
    )
    assert res_ml.grounding_metadata.safety_status == SafetyStatus.STATUTORY_REFUSAL
    assert "നിരോധിച്ചിരിക്കുന്നു" in res_ml.answer


def test_multiturn_conversational_memory():
    """Verify follow-up queries resolve context from previous conversation turns using session_id."""
    session_id = "test-session-multiturn-123"

    # Turn 1: Specific query about Paddy Stem Borer
    t1_res = agronomy_service.process_query(
        query="How to manage yellow stem borer in paddy?",
        crop="paddy",
        session_id=session_id,
        locale="en"
    )
    assert t1_res.grounding_metadata.safety_status == SafetyStatus.SAFE
    assert "Chlorantraniliprole" in t1_res.answer or "Cartap" in t1_res.answer

    # Turn 2: Follow-up query using contextual anaphora ("this spray")
    t2_res = agronomy_service.process_query(
        query="What is the waiting period for this spray?",
        session_id=session_id,
        locale="en"
    )
    assert t2_res.grounding_metadata.safety_status == SafetyStatus.SAFE
    assert t2_res.grounding_metadata.is_grounded is True
    # Should resolve context to paddy stem borer and return 47 days PHI
    assert "47 days" in t2_res.answer or "Pre-Harvest" in t2_res.answer

