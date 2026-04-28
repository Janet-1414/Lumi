"""
tests/unit/test_report_writer.py
"""

from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from app.ai.report_writer import ReportWriter


@pytest.fixture
def writer() -> ReportWriter:
    with patch("app.ai.report_writer.ChatOpenAI"):
        w = ReportWriter()
        w._chain = AsyncMock()
        return w


class TestReportWriter:

    async def test_returns_valid_summary(self, writer: ReportWriter) -> None:
        writer._chain.ainvoke = AsyncMock(return_value=MagicMock(content='''{
            "headline": "Great month!",
            "body": "You saved well.",
            "top_insight": "Food was your top spend.",
            "savings_tip": "Save 20% first."
        }'''))

        result = await writer.generate_summary(
            period="This Month",
            income=1_800_000,
            expenses=1_200_000,
            top_category="Food",
            top_pct=25.8,
        )

        assert result["headline"] == "Great month!"
        assert "body" in result
        assert "savings_tip" in result

    async def test_falls_back_gracefully_on_ai_failure(
        self, writer: ReportWriter
    ) -> None:
        writer._chain.ainvoke = AsyncMock(side_effect=Exception("OpenAI error"))

        result = await writer.generate_summary(
            period="This Month",
            income=1_800_000,
            expenses=1_200_000,
            top_category="Food",
            top_pct=25.8,
        )

        # Fallback should still return a valid dict
        assert "headline" in result
        assert "savings_tip" in result

    async def test_strips_markdown_fences(self, writer: ReportWriter) -> None:
        writer._chain.ainvoke = AsyncMock(return_value=MagicMock(content="""```json
{
    "headline": "Solid month!",
    "body": "You did well.",
    "top_insight": "Keep it up.",
    "savings_tip": "Save more."
}
```"""))

        result = await writer.generate_summary(
            period="This Month",
            income=1_800_000,
            expenses=1_200_000,
            top_category="Food",
            top_pct=25.0,
        )

        assert result["headline"] == "Solid month!"
