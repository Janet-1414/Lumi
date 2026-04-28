"""
tests/unit/test_personality.py

Unit tests for Money Personality AI — LLM is fully mocked.
"""

from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from app.ai.personality import MoneyPersonalityAI
from app.utils.enums import MoneyPersonality


@pytest.fixture
def ai() -> MoneyPersonalityAI:
    with patch("app.ai.personality.ChatOpenAI"):
        a = MoneyPersonalityAI()
        a._chain = AsyncMock()
        return a


class TestMoneyPersonalityAI:

    async def test_classify_returns_valid_personality(
        self, ai: MoneyPersonalityAI
    ) -> None:
        ai._chain.ainvoke = AsyncMock(return_value=MagicMock(content="saver"))
        result = await ai.classify({"q1": "Save first", "q2": "Add to savings"})
        assert result == MoneyPersonality.SAVER

    async def test_classify_falls_back_on_unknown_type(
        self, ai: MoneyPersonalityAI
    ) -> None:
        ai._chain.ainvoke = AsyncMock(return_value=MagicMock(content="unknown_type"))
        result = await ai.classify({"q1": "??"})
        assert result == MoneyPersonality.PLANNER  # safe fallback

    async def test_classify_falls_back_on_error(
        self, ai: MoneyPersonalityAI
    ) -> None:
        ai._chain.ainvoke = AsyncMock(side_effect=Exception("OpenAI error"))
        result = await ai.classify({"q1": "test"})
        assert result == MoneyPersonality.PLANNER

    def test_get_questions_returns_list(self, ai: MoneyPersonalityAI) -> None:
        questions = ai.get_questions()
        assert len(questions) >= 3
        for q in questions:
            assert "id" in q
            assert "text" in q
            assert "options" in q
            assert len(q["options"]) >= 2
