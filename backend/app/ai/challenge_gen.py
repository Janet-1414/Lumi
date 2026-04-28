"""app/ai/challenge_gen.py — Personalised savings challenge generator."""

from app.config import get_settings
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
import json, re

settings = get_settings()

_CHALLENGE_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "Generate a personalised savings challenge for an African youth based on their spending habits. "
               "Return ONLY JSON: {{\"title\": str, \"description\": str, \"target_save\": number, \"duration\": str}}"),
    ("human", "Top spending categories: {categories}\nMonthly income: UGX {income:,.0f}\nGenerate a challenge:"),
])


class ChallengeGenAI:
    def __init__(self) -> None:
        self._llm   = ChatOpenAI(model="gpt-4o-mini", temperature=0.8, api_key=settings.OPENAI_API_KEY)
        self._chain = _CHALLENGE_PROMPT | self._llm

    async def generate(self, categories: list[str], income: float) -> dict:
        try:
            r    = await self._chain.ainvoke({"categories": categories, "income": income})
            text = re.sub(r"^```(?:json)?\s*|\s*```$", "", str(r.content).strip())
            return json.loads(text)
        except Exception:
            return {"title": "No-Spend Weekend 💪", "description": "Skip all non-essential spending this weekend.",
                    "target_save": 50_000, "duration": "3 days"}


_challenge_gen: ChallengeGenAI | None = None
def get_challenge_gen() -> ChallengeGenAI:
    global _challenge_gen
    if _challenge_gen is None: _challenge_gen = ChallengeGenAI()
    return _challenge_gen
