"""
app/repositories/chat_repository.py
"""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.chat_session import ChatMessage, ChatSession
from app.repositories.base import BaseRepository


class ChatRepository(BaseRepository[ChatSession]):
    model = ChatSession

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db)

    async def get_or_create_session(
        self, user_id: uuid.UUID, session_id: uuid.UUID | None = None
    ) -> ChatSession:
        """Get an existing session or create a new one."""
        if session_id:
            result = await self.db.execute(
                select(ChatSession)
                .options(selectinload(ChatSession.messages))
                .where(
                    ChatSession.id      == session_id,
                    ChatSession.user_id == user_id,
                )
            )
            session = result.scalar_one_or_none()
            if session:
                return session

        # Create new session
        session = ChatSession(user_id=user_id)
        self.db.add(session)
        await self.db.flush()
        await self.db.refresh(session)
        return session

    async def get_history(
        self, session_id: uuid.UUID, limit: int = 20
    ) -> list[ChatMessage]:
        """Most recent N messages for context window."""
        result = await self.db.execute(
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at.desc())
            .limit(limit)
        )
        return list(reversed(result.scalars().all()))

    async def add_message(
        self, session_id: uuid.UUID, role: str, content: str
    ) -> ChatMessage:
        msg = ChatMessage(session_id=session_id, role=role, content=content)
        self.db.add(msg)
        await self.db.flush()
        await self.db.refresh(msg)
        return msg
