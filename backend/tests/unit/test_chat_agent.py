"""
tests/unit/test_chat_agent.py

Unit tests for LumiChatAgent.
LangGraph and LLM calls are fully mocked.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.ai.chat_agent import LumiChatAgent


@pytest.fixture
def agent() -> LumiChatAgent:
    with (
        patch("app.ai.chat_agent.ChatOpenAI"),
        patch("app.ai.chat_agent.StateGraph"),
    ):
        a = LumiChatAgent()
        a._graph = MagicMock()
        return a


class TestLumiChatAgent:

    async def test_stream_yields_chunks(self, agent: LumiChatAgent) -> None:
        """Agent stream should yield text chunks."""
        async def mock_events(*args, **kwargs):
            for chunk in ["Hello", " Akosua", "!"]:
                yield {
                    "event": "on_chat_model_stream",
                    "name":  "agent",
                    "data":  {"chunk": MagicMock(content=chunk)},
                }

        agent._graph.astream_events = mock_events

        chunks = []
        async for chunk in agent.stream("Hi", [], "user-123"):
            chunks.append(chunk)

        assert chunks == ["Hello", " Akosua", "!"]

    async def test_invoke_returns_full_response(self, agent: LumiChatAgent) -> None:
        """invoke() should concatenate all streamed chunks."""
        async def mock_events(*args, **kwargs):
            for text in ["Your balance is ", "UGX 2,450,000."]:
                yield {
                    "event": "on_chat_model_stream",
                    "name":  "agent",
                    "data":  {"chunk": MagicMock(content=text)},
                }

        agent._graph.astream_events = mock_events

        result = await agent.invoke("What's my balance?", [], "user-123")
        assert result == "Your balance is UGX 2,450,000."

    async def test_stream_skips_non_text_events(self, agent: LumiChatAgent) -> None:
        """Tool call events should not yield text chunks."""
        async def mock_events(*args, **kwargs):
            yield {"event": "on_tool_start", "name": "agent", "data": {}}
            yield {
                "event": "on_chat_model_stream",
                "name":  "agent",
                "data":  {"chunk": MagicMock(content="Great!")},
            }

        agent._graph.astream_events = mock_events

        chunks = []
        async for c in agent.stream("Test", [], "user-123"):
            chunks.append(c)

        assert chunks == ["Great!"]

    async def test_history_is_passed_to_graph(self, agent: LumiChatAgent) -> None:
        """The last 10 history messages should be passed to the graph."""
        events_received = []

        async def mock_events(state, **kwargs):
            events_received.append(state)
            return
            yield  # make it an async generator

        agent._graph.astream_events = mock_events

        history = [
            {"role": "user",      "content": "Hello"},
            {"role": "assistant", "content": "Hi there!"},
        ]

        async for _ in agent.stream("How am I doing?", history, "user-123"):
            pass

        # Verify graph was called with correct message count
        assert len(events_received) == 1
        state = events_received[0]
        # 2 history + 1 current = 3 messages
        assert len(state["messages"]) == 3
