"""
app/routers/dashboard.py

Dashboard router — single endpoint that assembles the full
dashboard payload: stats, spending breakdown, recent transactions,
and an AI insight.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_verified_user
from app.models.user import User
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardResponse, summary="Get full dashboard data")
async def get_dashboard(
    current_user: User           = Depends(get_verified_user),
    db:           AsyncSession   = Depends(get_db),
) -> DashboardResponse:
    """
    Returns everything the dashboard page needs in one call:
    - Stat cards (balance, income, expenses, savings rate)
    - Spending by category (donut chart data)
    - Recent transactions
    - AI insight of the day
    """
    service = DashboardService(db)
    return await service.get_dashboard(current_user.id)