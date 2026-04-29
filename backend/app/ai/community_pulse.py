"""app/ai/community_pulse.py — Weekly anonymous collective savings summary."""

from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from app.config import get_settings

settings = get_settings()

_PULSE_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "Generate an inspiring one-sentence community savings summary for Lumi. "
               "Use the aggregate data provided. Never mention individual amounts. "
               "Be celebratory and community-focused."),
    ("human", "Total saved by all users this week: UGX {total:,.0f}\n"
              "Active savers: {savers}\nTop category: {category}\nWrite the headline:"),
])


class CommunityPulseAI:
    """Generates the weekly community pulse headline from aggregated data."""

    def __init__(self) -> None:
        self._llm   = ChatOpenAI(model="gpt-4o-mini", temperature=0.8, api_key=settings.OPENAI_API_KEY)
        self._chain = _PULSE_PROMPT | self._llm

    async def generate_headline(
        self, total_saved: float, active_savers: int, top_category: str
    ) -> str:
        try:
            r = await self._chain.ainvoke({
                "total": total_saved, "savers": active_savers, "category": top_category,
            })
            return str(r.content).strip()
        except Exception:
            return f"Lumi users saved a combined UGX {total_saved:,.0f} this week 🌍"


_pulse_ai: CommunityPulseAI | None = None
def get_community_pulse_ai() -> CommunityPulseAI:
    global _pulse_ai
    if _pulse_ai is None: _pulse_ai = CommunityPulseAI()
    return _pulse_ai
