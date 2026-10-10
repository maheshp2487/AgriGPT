from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from app.core.security import verify_service_key
from app.schemas.chat import ChatQueryRequest, ChatCompletionResponse
from app.services.agronomy import agronomy_service

router = APIRouter(prefix="/chat", tags=["Chat & Agronomy Advisory"])


@router.post("/completions", response_model=ChatCompletionResponse)
async def chat_completions(
    request: ChatQueryRequest,
    _authenticated: bool = Depends(verify_service_key)
) -> ChatCompletionResponse:
    """
    Synchronous grounded agronomy query completion with statutory CIBRC guardrails and citations.
    """
    return agronomy_service.process_query(
        query=request.query,
        locale=request.locale,
        crop=request.crop,
        district=request.district,
        state=request.state,
        session_id=request.session_id,
        messages=request.messages
    )


@router.post("/stream")
async def chat_stream(
    request: ChatQueryRequest,
    _authenticated: bool = Depends(verify_service_key)
):
    """
    Server-Sent Events (SSE) streaming conversational completion.
    Emits word tokens, citations, grounding metadata, and completion event.
    """
    generator = agronomy_service.stream_query(
        query=request.query,
        locale=request.locale,
        crop=request.crop,
        district=request.district,
        state=request.state,
        session_id=request.session_id,
        messages=request.messages
    )
    return StreamingResponse(generator, media_type="text/event-stream")
