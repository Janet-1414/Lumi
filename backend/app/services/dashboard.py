"""
app/routers/dashboard.py

Dashboard router — single endpoint that returns everything the
dashboard page needs in one network request.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_verified_user
from app.models.user import User
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "",
    response_model=DashboardResponse,
    summary="Get full dashboard data for the current user",
)
async def get_dashboard(
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
) -> DashboardResponse:
    """
    Returns stats, recent transactions, spending breakdown,
    and AI insight — everything the dashboard page needs in one call.
    """
    service = DashboardService(db)
    return await service.get_dashboard(current_user.id)
