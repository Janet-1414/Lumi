"""
app/ai/insights.py — Spending insight generator.
Produces the AI insight banner shown on Dashboard and Transactions page.
"""

from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from app.config import get_settings

settings = get_settings()

_INSIGHT_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are Lumi, an AI financial companion for African youth. "
               "Write ONE short, specific, actionable insight (max 2 sentences) "
               "based on the user's spending data. Be warm and direct. Use UGX amounts."),
    ("human", "Spending data: {data}\nWrite one insight:"),
])


class InsightsAI:
    """Generates personalised spending insights from transaction data."""

    def __init__(self) -> None:
        self._llm   = ChatOpenAI(model="gpt-4o-mini", temperature=0.6, api_key=settings.OPENAI_API_KEY)
        self._chain = _INSIGHT_PROMPT | self._llm

    async def generate(self, spending_data: dict) -> str:
        try:
            r = await self._chain.ainvoke({"data": str(spending_data)})
            return str(r.content).strip()
        except Exception:
            return "Keep tracking your spending — every shilling logged brings you closer to your goals."


_insights_ai: InsightsAI | None = None
def get_insights_ai() -> InsightsAI:
    global _insights_ai
    if _insights_ai is None: _insights_ai = InsightsAI()
    return _insights_ai
