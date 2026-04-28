"""
app/services/dashboard_service.py

DashboardService — builds the complete dashboard response for a user.

Assembles:
  - DashboardStats (balance, income, expenses, savings rate + MoM change)
  - Recent transactions (last 10)
  - Spending by category with percentages and chart colors
  - AI insight (generated or cached)
"""

import uuid
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.transaction_repository import TransactionRepository
from app.schemas.dashboard import (
    AIInsight,
    CategorySpend,
    DashboardResponse,
    DashboardStats,
    TransactionResponse,
)
from app.utils.enums import TransactionCategory, TransactionType

# ── Category colors (matches frontend lib/categories.ts) ─────────────────────

CATEGORY_COLORS: dict[TransactionCategory, str] = {
    TransactionCategory.FOOD:         "#FAC775",
    TransactionCategory.TRANSPORT:    "#5DCAA5",
    TransactionCategory.SHOPPING:     "#AFA9EC",
    TransactionCategory.UTILITIES:    "#EF9F27",
    TransactionCategory.HEALTH:       "#ED93B1",
    TransactionCategory.EDUCATION:    "#85B7EB",
    TransactionCategory.SAVINGS:      "#1D9E75",
    TransactionCategory.INCOME:       "#1D9E75",
    TransactionCategory.MOBILE_MONEY: "#FAC775",
    TransactionCategory.OTHER:        "#888780",
}


class DashboardService:
    """
    Assembles the dashboard data for a given user.
    Keeps all data-assembly logic in one place so the router stays thin.
    """

    def __init__(self, db: AsyncSession) -> None:
        self._tx_repo = TransactionRepository(db)

    async def get_dashboard(self, user_id: uuid.UUID) -> DashboardResponse:
        now       = datetime.now(UTC)
        year      = now.year
        month     = now.month
        last_month, last_year = (month - 1, year) if month > 1 else (12, year - 1)

        # ── Current month totals ───────────────────────────────────────────────
        income   = await self._tx_repo.sum_by_type(user_id, TransactionType.INCOME,  year, month)
        expenses = await self._tx_repo.sum_by_type(user_id, TransactionType.EXPENSE, year, month)

        # ── Last month totals (for % change) ──────────────────────────────────
        prev_income   = await self._tx_repo.sum_by_type(user_id, TransactionType.INCOME,  last_year, last_month)
        prev_expenses = await self._tx_repo.sum_by_type(user_id, TransactionType.EXPENSE, last_year, last_month)

        balance      = income - expenses
        savings_rate = ((income - expenses) / income * 100) if income > 0 else 0.0

        stats = DashboardStats(
            total_balance=balance,
            monthly_income=income,
            monthly_expenses=expenses,
            savings_rate=round(savings_rate, 1),
            balance_change_pct=_pct_change(balance, prev_income - prev_expenses),
            income_change_pct=_pct_change(income, prev_income),
            expense_change_pct=_pct_change(expenses, prev_expenses),
        )

        # ── Recent transactions ────────────────────────────────────────────────
        raw_tx = await self._tx_repo.get_recent(user_id, limit=10)
        recent = [TransactionResponse.model_validate(tx) for tx in raw_tx]

        # ── Spending by category ───────────────────────────────────────────────
        raw_spend  = await self._tx_repo.spending_by_category(user_id, year, month)
        total_spend = sum(r["amount"] for r in raw_spend) or 1  # avoid div/0

        spending = [
            CategorySpend(
                category=row["category"],
                amount=row["amount"],
                percentage=round(row["amount"] / total_spend * 100, 1),
                color=CATEGORY_COLORS.get(row["category"], "#888780"),
            )
            for row in raw_spend
        ]

        # ── AI Insight ────────────────────────────────────────────────────────
        # TODO: Replace with real AI generation from app/ai/insights.py
        insight = AIInsight(
            id="ai-insight-1",
            message=_generate_placeholder_insight(stats),
            type="tip",
            created_at=now,
        )

        return DashboardResponse(
            stats=stats,
            recent_transactions=recent,
            spending_by_category=spending,
            ai_insight=insight,
        )


# ── Helpers ───────────────────────────────────────────────────────────────────

def _pct_change(current: float, previous: float) -> float:
    """Calculate percentage change between two values."""
    if previous == 0:
        return 0.0
    return round((current - previous) / previous * 100, 1)


def _generate_placeholder_insight(stats: DashboardStats) -> str:
    """
    Temporary rule-based insight until the AI module is wired up.
    Will be replaced by app/ai/insights.py LangChain call.
    """
    if stats.savings_rate >= 20:
        return (
            f"Great work! You're saving {stats.savings_rate:.1f}% of your income "
            f"this month. Keep it up and you'll hit your emergency fund goal faster."
        )
    if stats.monthly_expenses > stats.monthly_income:
        return (
            "You've spent more than you earned this month. "
            "Let's find 2-3 categories where you can cut back to get back on track."
        )
    return (
        f"You've spent UGX {stats.monthly_expenses:,.0f} so far this month. "
        f"Your savings rate is {stats.savings_rate:.1f}% — aim for 20% to build "
        f"a strong financial cushion."
    )
