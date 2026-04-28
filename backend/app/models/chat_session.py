"""
app/models/chat_session.py

ChatSession and ChatMessage ORM models.
Stores conversation history for the LangGraph AI chat.
"""

import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class ChatSession(BaseModel):
    """One chat session per user (or multiple — one is fine for MVP)."""

    __tablename__ = "chat_sessions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(200), default="My Finances", nullable=False
    )

    messages: Mapped[list["ChatMessage"]] = relationship(
        "ChatMessage",
        back_populates="session",
        order_by="ChatMessage.created_at",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class ChatMessage(BaseModel):
    """Individual message within a chat session."""

    __tablename__ = "chat_messages"

    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("chat_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    role:    Mapped[str] = mapped_column(String(20),  nullable=False)   # "user" | "assistant"
    content: Mapped[str] = mapped_column(Text,         nullable=False)

    session: Mapped["ChatSession"] = relationship(
        "ChatSession", back_populates="messages"
    )
