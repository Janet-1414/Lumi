"""app/routers/reports.py"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_verified_user
from app.models.user import User
from app.schemas.reports import ReportResponse
from app.services.reports_service import ReportsService

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("", response_model=ReportResponse)
async def get_report(
    period:       str  = Query(default="this_month",
                               description="this_month | last_3_months | last_6_months | this_year"),
    current_user: User = Depends(get_verified_user),
    db: AsyncSession   = Depends(get_db),
) -> ReportResponse:
    """Full financial report with bar chart data, category breakdown and AI summary."""
    svc = ReportsService(db)
    return await svc.get_report(current_user.id, period)
