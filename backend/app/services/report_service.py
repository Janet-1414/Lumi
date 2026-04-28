"""
app/services/reports_service.py
"""

import uuid
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.report_writer import get_report_writer
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.reports import (
    AIReportSummary,
    CategoryBreakdown,
    MonthlyBar,
    ReportResponse,
)
from app.utils.enums import TransactionCategory, TransactionType

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

MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun",
                 "Jul","Aug","Sep","Oct","Nov","Dec"]


class ReportsService:

    def __init__(self, db: AsyncSession) -> None:
        self._tx_repo = TransactionRepository(db)
        self._writer  = get_report_writer()

    async def get_report(
        self, user_id: uuid.UUID, period: str = "this_month"
    ) -> ReportResponse:
        now   = datetime.now(UTC)
        year  = now.year
        month = now.month

        # Build monthly bars (last 6 months)
        bars: list[MonthlyBar] = []
        for i in range(5, -1, -1):
            m = month - i
            y = year
            if m <= 0:
                m += 12
                y -= 1
            inc = await self._tx_repo.sum_by_type(user_id, TransactionType.INCOME,  y, m)
            exp = await self._tx_repo.sum_by_type(user_id, TransactionType.EXPENSE, y, m)
            bars.append(MonthlyBar(
                month=MONTH_LABELS[m - 1], income=inc, expenses=exp, net=inc - exp
            ))

        # Current month totals
        total_income   = bars[-1].income
        total_expenses = bars[-1].expenses
        net_savings    = total_income - total_expenses
        savings_rate   = (net_savings / total_income * 100) if total_income > 0 else 0.0

        # Category breakdown
        raw_spend   = await self._tx_repo.spending_by_category(user_id, year, month)
        total_spend = sum(r["amount"] for r in raw_spend) or 1

        breakdown = [
            CategoryBreakdown(
                category=r["category"],
                amount=r["amount"],
                percentage=round(r["amount"] / total_spend * 100, 1),
                color=CATEGORY_COLORS.get(r["category"], "#888780"),
            )
            for r in raw_spend
        ]

        top_cat = raw_spend[0]["category"].value.title() if raw_spend else "Other"
        top_pct = breakdown[0].percentage if breakdown else 0

        # AI summary
        ai_data = await self._writer.generate_summary(
            period=period.replace("_", " ").title(),
            income=total_income,
            expenses=total_expenses,
            top_category=top_cat,
            top_pct=top_pct,
        )
        ai_summary = AIReportSummary(**ai_data)

        return ReportResponse(
            period=period.replace("_", " ").title(),
            monthly_bars=bars,
            category_breakdown=breakdown,
            ai_summary=ai_summary,
            total_income=total_income,
            total_expenses=total_expenses,
            net_savings=net_savings,
            savings_rate=round(savings_rate, 1),
        )
