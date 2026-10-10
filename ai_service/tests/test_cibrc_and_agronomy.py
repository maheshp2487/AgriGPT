import pytest
from app.knowledge.cibrc import cibrc_validator
from app.knowledge.retriever import grounded_retriever
from app.services.agronomy import agronomy_service
from app.schemas.chat import SafetyStatus


def test_cibrc_endosulfan_prohibited_all_crops():
    """Verify Endosulfan triggers an immediate statutory refusal for any crop."""
    is_safe, refusal = cibrc_validator.check_query_safety(
        query="What is the dosage of Endosulfan for stem borer in paddy?",
        crop="paddy",
        locale="en"
    )
    assert is_safe is False
    assert refusal is not None
    assert refusal["chemical_name"] == "Endosulfan"
    assert "Supreme Court" in refusal["gazette_notification"]
    assert "BANNED" in refusal["statutory_remark"]


def test_cibrc_monocrotophos_prohibited_on_vegetables():
    """Verify Monocrotophos triggers statutory refusal on vegetable crops."""
    is_safe, refusal = cibrc_validator.check_query_safety(
        query="Can I spray Monocrotophos on tomato for fruit borer?",
        crop="tomato",
        locale="en"
    )
    assert is_safe is False
    assert refusal is not None
    assert refusal["chemical_name"] == "Monocrotophos"
    assert "vegetables" in refusal["statutory_remark"].lower()


def test_cibrc_multilingual_refusal_tamil_and_hindi():
    """Verify localized statutory warnings in Tamil and Hindi."""
    # Tamil
    res_ta = agronomy_service.process_query(
        query="நெல் தண்டு துளைப்பானுக்கு எண்டோசல்பான் மருந்து அளவு என்ன?",
        crop="paddy",
        locale="ta"
    )
    assert res_ta.grounding_metadata.safety_status == SafetyStatus.STATUTORY_REFUSAL
    assert "எண்டோசல்பான்" in res_ta.answer
    assert "தடை" in res_ta.answer

    # Hindi
    res_hi = agronomy_service.process_query(
        query="धान के तना छेदक के लिए एंडोसल्फान की मात्रा क्या है?",
        crop="paddy",
        locale="hi"
    )
    assert res_hi.grounding_metadata.safety_status == SafetyStatus.STATUTORY_REFUSAL
    assert "प्रतिबंधित" in res_hi.answer


def test_grounded_agronomy_paddy_stem_borer_citations():
    """Verify valid agronomy query retrieves grounded advice and citations."""
    response = agronomy_service.process_query(
        query="How to manage yellow stem borer in paddy?",
        crop="paddy",
        locale="en"
    )
    assert response.grounding_metadata.safety_status == SafetyStatus.SAFE
    assert response.grounding_metadata.is_grounded is True
    assert response.grounding_metadata.retrieval_confidence >= 0.70
    assert len(response.citations) > 0
    
    citation = response.citations[0]
    assert "TNAU" in citation.institution or "ICAR" in citation.institution
    assert citation.crop == "paddy"
    assert citation.publication_year >= 2020
    assert "Chlorantraniliprole" in response.answer or "Cartap" in response.answer


def test_grounded_agronomy_maize_faw_tamil():
    """Verify Maize Fall Armyworm advisory retrieval in Tamil."""
    response = agronomy_service.process_query(
        query="மக்காச்சோளம் படைப்புழு மேலாண்மை என்ன?",
        crop="maize",
        locale="ta"
    )
    assert response.grounding_metadata.safety_status == SafetyStatus.SAFE
    assert len(response.citations) > 0
    assert "படைப்புழு" in response.answer or "எமாமெக்டின்" in response.answer


def test_fail_closed_ungrounded_chemical_query():
    """
    Verify fail-closed behavior: An unverified/ungrounded query asking for chemical
    recommendations refuses to fabricate dosages and redirects to KVK.
    """
    response = agronomy_service.process_query(
        query="What chemical pesticide should I spray for unknown purple spots on vanilla orchids?",
        crop="vanilla",
        locale="en"
    )
    assert response.grounding_metadata.safety_status == SafetyStatus.FAIL_CLOSED_UNGROUNDED
    assert response.grounding_metadata.is_grounded is False
    assert len(response.citations) == 0
    assert "No verified ICAR or State Agricultural University recommendation" in response.answer
    assert "Krishi Vigyan Kendra" in response.answer


def test_chat_api_endpoint():
    """Verify FastAPI /v1/chat/completions endpoint returns valid response."""
    import asyncio
    from httpx import ASGITransport, AsyncClient
    from app.main import app

    async def _test():
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            payload = {
                "query": "How to manage stem borer in paddy?",
                "crop": "paddy",
                "locale": "en"
            }
            res = await client.post("/v1/chat/completions", json=payload)
            assert res.status_code == 200
            data = res.json()
            assert "answer" in data
            assert len(data["citations"]) > 0
            assert data["grounding_metadata"]["safety_status"] == "SAFE"

    asyncio.run(_test())


def test_chat_stream_api_endpoint():
    """Verify FastAPI /v1/chat/stream SSE endpoint emits token events."""
    import asyncio
    from httpx import ASGITransport, AsyncClient
    from app.main import app

    async def _test():
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            payload = {
                "query": "What is the dosage of Endosulfan?",
                "crop": "paddy",
                "locale": "en"
            }
            res = await client.post("/v1/chat/stream", json=payload)
            assert res.status_code == 200
            assert "text/event-stream" in res.headers["content-type"]
            body = res.text
            assert "event" in body
            assert "[DONE]" in body
            assert "BANNED" in body

    asyncio.run(_test())

