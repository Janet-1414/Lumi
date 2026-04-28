"""
app/routers/chat.py — AI Chat endpoints with streaming support.
"""

import uuid

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_verified_user
from app.models.user import User
from app.schemas.chat import (
    ChatMessageRequest,
    ChatMessageResponse,
    ChatSessionResponse,
    SuggestedPrompt,
)
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["AI Chat"])


def _svc(db: AsyncSession = Depends(get_db)) -> ChatService:
    return ChatService(db)


@router.get("/session", response_model=ChatSessionResponse)
async def get_session(
    session_id: uuid.UUID | None = None,
    user:       User = Depends(get_verified_user),
    svc:        ChatService = Depends(_svc),
) -> ChatSessionResponse:
    """Get or create a chat session for the current user."""
    return await svc.get_session(user.id, session_id)


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(
    payload: ChatMessageRequest,
    user:    User = Depends(get_verified_user),
    svc:     ChatService = Depends(_svc),
) -> ChatMessageResponse:
    """Send a message and get the full AI response (non-streaming)."""
    return await svc.chat(user.id, payload.message, payload.session_id)


@router.post("/stream")
async def stream_message(
    payload: ChatMessageRequest,
    user:    User = Depends(get_verified_user),
    svc:     ChatService = Depends(_svc),
) -> StreamingResponse:
    """
    Send a message and stream the AI response as Server-Sent Events.
    Frontend reads: EventSource or fetch with ReadableStream.
    """
    return StreamingResponse(
        svc.stream_chat(user.id, payload.message, payload.session_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/prompts", response_model=list[SuggestedPrompt])
async def get_suggested_prompts(
    user: User = Depends(get_verified_user),
    svc:  ChatService = Depends(_svc),
) -> list[SuggestedPrompt]:
    """Suggested prompt chips shown in the chat UI."""
    return svc.get_suggested_prompts()
