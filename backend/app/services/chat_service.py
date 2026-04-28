"""
app/services/chat_service.py

ChatService — manages chat sessions and orchestrates the LangGraph agent.
"""

import uuid
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.chat_agent import get_chat_agent
from app.repositories.chat_repository import ChatRepository
from app.schemas.chat import (
    ChatMessageResponse,
    ChatSessionResponse,
    SuggestedPrompt,
)


SUGGESTED_PROMPTS: list[SuggestedPrompt] = [
    SuggestedPrompt(label="💸 Where did my money go?",       text="Where did most of my money go this month?"),
    SuggestedPrompt(label="🎯 Savings progress",             text="How am I doing on my savings goals?"),
    SuggestedPrompt(label="📊 Am I overspending?",           text="Am I overspending in any category?"),
    SuggestedPrompt(label="💡 How can I save more?",         text="Give me 3 practical ways to save more money this month."),
    SuggestedPrompt(label="📈 My financial health",          text="Give me an honest summary of my financial health."),
    SuggestedPrompt(label="🍔 Food spending",                text="How much am I spending on food and can I reduce it?"),
]


class ChatService:

    def __init__(self, db: AsyncSession) -> None:
        self._repo  = ChatRepository(db)
        self._agent = get_chat_agent()

    # ── Get or start session ──────────────────────────────────────────────────

    async def get_session(
        self, user_id: uuid.UUID, session_id: uuid.UUID | None = None
    ) -> ChatSessionResponse:
        session = await self._repo.get_or_create_session(user_id, session_id)
        return ChatSessionResponse.model_validate(session)

    # ── Chat (non-streaming) ──────────────────────────────────────────────────

    async def chat(
        self,
        user_id:    uuid.UUID,
        message:    str,
        session_id: uuid.UUID | None = None,
    ) -> ChatMessageResponse:
        session = await self._repo.get_or_create_session(user_id, session_id)
        history = await self._repo.get_history(session.id)

        # Save user message
        await self._repo.add_message(session.id, "user", message)

        # Build history for agent
        history_dicts = [{"role": m.role, "content": m.content} for m in history]

        # Invoke agent
        response_text = await self._agent.invoke(message, history_dicts, str(user_id))

        # Save assistant response
        assistant_msg = await self._repo.add_message(
            session.id, "assistant", response_text
        )

        return ChatMessageResponse.model_validate(assistant_msg)

    # ── Chat (streaming) ──────────────────────────────────────────────────────

    async def stream_chat(
        self,
        user_id:    uuid.UUID,
        message:    str,
        session_id: uuid.UUID | None = None,
    ) -> AsyncGenerator[str, None]:
        """
        Streams the AI response as Server-Sent Events.
        Saves both the user message and full AI response to DB.
        """
        session = await self._repo.get_or_create_session(user_id, session_id)
        history = await self._repo.get_history(session.id)

        # Save user message
        await self._repo.add_message(session.id, "user", message)

        history_dicts = [{"role": m.role, "content": m.content} for m in history]

        # Stream and collect
        full_response = ""
        async for chunk in self._agent.stream(message, history_dicts, str(user_id)):
            full_response += chunk
            yield f"data: {chunk}\n\n"

        # Save complete response after streaming finishes
        await self._repo.add_message(session.id, "assistant", full_response)
        yield "data: [DONE]\n\n"

    # ── Suggested prompts ─────────────────────────────────────────────────────

    def get_suggested_prompts(self) -> list[SuggestedPrompt]:
        return SUGGESTED_PROMPTS
