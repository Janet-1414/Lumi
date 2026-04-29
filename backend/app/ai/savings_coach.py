"""app/ai/savings_coach.py — AI savings goal coach."""

from app.config import get_settings
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

settings = get_settings()

_COACH_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are Lumi's savings coach for African youth. "
               "Give a short (2-3 sentence), encouraging, specific coaching message "
               "about a savings goal. Use UGX amounts. Be direct and warm."),
    ("human", "Goal: {name}\nTarget: UGX {target:,.0f}\nSaved: UGX {saved:,.0f} ({pct:.0f}%)\n"
              "Days remaining: {days}\nWrite a coaching message:"),
])


class SavingsCoachAI:
    def __init__(self) -> None:
        self._llm   = ChatOpenAI(model="gpt-4o-mini", temperature=0.7, api_key=settings.OPENAI_API_KEY)
        self._chain = _COACH_PROMPT | self._llm

    async def coach(self, name: str, target: float, saved: float, days: int | None) -> str:
        pct = (saved / target * 100) if target > 0 else 0
        try:
            r = await self._chain.ainvoke({
                "name": name, "target": target,
                "saved": saved, "pct": pct, "days": days or 0,
            })
            return str(r.content).strip()
        except Exception:
            remaining = target - saved
            return (f"You're {pct:.0f}% toward your {name} goal. "
                    f"UGX {remaining:,.0f} to go — you've got this!")


_coach: SavingsCoachAI | None = None
def get_savings_coach() -> SavingsCoachAI:
    global _coach
    if _coach is None: _coach = SavingsCoachAI()
    return _coach
