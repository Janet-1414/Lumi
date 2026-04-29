"""
app/ai/personality.py

MoneyPersonalityAI — analyses quiz answers and assigns a money personality type.
This is Lumi's onboarding AI feature — runs once at signup.
"""

from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from app.config import get_settings
from app.utils.enums import MoneyPersonality

settings = get_settings()

QUIZ_QUESTIONS = [
    {"id": "q1", "text": "When you get paid, what do you do first?",
     "options": ["Save a fixed amount immediately", "Pay bills then see what's left",
                 "Spend on something I've been wanting", "I don't have a system"]},
    {"id": "q2", "text": "You find UGX 50,000 you forgot about. You:",
     "options": ["Add it to savings", "Use it on a treat", "Invest it", "Feel stressed about money"]},
    {"id": "q3", "text": "How do you feel about tracking expenses?",
     "options": ["I track everything", "I track sometimes", "I avoid it", "I want to but don't know how"]},
]

PERSONALITY_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a financial personality analyst. Based on quiz answers, "
               "classify the user as one of: saver, spender, investor, avoider, planner. "
               "Return ONLY the personality type word, nothing else."),
    ("human", "Quiz answers: {answers}\nPersonality type:"),
])


class MoneyPersonalityAI:
    """Analyses quiz responses and returns a personality type."""

    def __init__(self) -> None:
        self._llm   = ChatOpenAI(model="gpt-4o-mini", temperature=0, api_key=settings.OPENAI_API_KEY)
        self._chain = PERSONALITY_PROMPT | self._llm

    async def classify(self, answers: dict[str, str]) -> MoneyPersonality:
        try:
            response = await self._chain.ainvoke({"answers": str(answers)})
            raw = str(response.content).strip().lower()
            return MoneyPersonality(raw)
        except Exception:
            return MoneyPersonality.PLANNER  # safe fallback

    @staticmethod
    def get_questions() -> list[dict]:
        return QUIZ_QUESTIONS


_personality_ai: MoneyPersonalityAI | None = None

def get_personality_ai() -> MoneyPersonalityAI:
    global _personality_ai
    if _personality_ai is None:
        _personality_ai = MoneyPersonalityAI()
    return _personality_ai
