"""
app/ai/report_writer.py

ReportWriter — AI-generated written financial report summary.
Uses LangChain to produce a readable, personalised narrative
from the user's actual spending data.
"""

from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from app.config import get_settings

settings = get_settings()

REPORT_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        """You are Lumi, an AI financial wellness companion for African youth.
Write a short, encouraging financial summary based on the data provided.
Be specific with numbers. Use UGX formatting (e.g. UGX 350,000).
Keep it warm, honest, and actionable. Maximum 4 sentences per section.""",
    ),
    (
        "human",
        """Write a financial report summary for this period: {period}

Data:
- Total income:   UGX {income:,.0f}
- Total expenses: UGX {expenses:,.0f}
- Net savings:    UGX {net:,.0f}
- Savings rate:   {rate:.1f}%
- Top category:   {top_category} ({top_pct:.0f}% of spending)

Return JSON only:
{{
  "headline":    "one punchy sentence summarising the month",
  "body":        "2-3 sentences about overall performance",
  "top_insight": "one specific insight about their biggest spending category",
  "savings_tip": "one actionable tip to improve next month"
}}""",
    ),
])


class ReportWriter:
    """Generates AI-written financial report summaries."""

    def __init__(self) -> None:
        self._llm   = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.6,
            api_key=settings.OPENAI_API_KEY,
        )
        self._chain = REPORT_PROMPT | self._llm

    async def generate_summary(
        self,
        period:       str,
        income:       float,
        expenses:     float,
        top_category: str,
        top_pct:      float,
    ) -> dict:
        """
        Generate a written summary from financial metrics.
        Returns a dict with headline, body, top_insight, savings_tip.
        Falls back to placeholder if AI call fails.
        """
        net  = income - expenses
        rate = (net / income * 100) if income > 0 else 0.0

        try:
            import json, re
            response = await self._chain.ainvoke({
                "period":       period,
                "income":       income,
                "expenses":     expenses,
                "net":          net,
                "rate":         rate,
                "top_category": top_category,
                "top_pct":      top_pct,
            })

            content = str(response.content)
            content = re.sub(r"^```(?:json)?\s*", "", content.strip())
            content = re.sub(r"\s*```$", "", content.strip())
            return json.loads(content)

        except Exception:
            # Graceful fallback — report still works without AI
            return self._fallback_summary(period, income, expenses, net, rate)

    @staticmethod
    def _fallback_summary(
        period: str, income: float, expenses: float, net: float, rate: float
    ) -> dict:
        sentiment = "great" if rate >= 20 else "tight"
        return {
            "headline":    f"Your {period.lower()} finances at a glance",
            "body":        f"You earned UGX {income:,.0f} and spent UGX {expenses:,.0f}, saving UGX {net:,.0f} ({rate:.1f}%). "
                           f"Your month looks {sentiment} overall.",
            "top_insight": "Your top spending category took the biggest chunk of your budget this period.",
            "savings_tip": "Try setting aside 20% of each income payment the moment it arrives.",
        }


_writer: ReportWriter | None = None


def get_report_writer() -> ReportWriter:
    global _writer
    if _writer is None:
        _writer = ReportWriter()
    return _writer
