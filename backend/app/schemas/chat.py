"""
app/schemas/chat.py

Pydantic v2 schemas for the AI chat feature.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ChatMessageRequest(BaseModel):
    message:    str       = Field(..., min_length=1, max_length=2000)
    session_id: uuid.UUID | None = None


class ChatMessageResponse(BaseModel):
    id:         uuid.UUID
    role:       str        # "user" | "assistant"
    content:    str
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatSessionResponse(BaseModel):
    id:       uuid.UUID
    title:    str
    messages: list[ChatMessageResponse]

    model_config = {"from_attributes": True}


class ChatStreamChunk(BaseModel):
    """Single chunk in a streaming response."""
    chunk:      str
    done:       bool = False
    session_id: uuid.UUID | None = None


class SuggestedPrompt(BaseModel):
    label: str
    text:  str
