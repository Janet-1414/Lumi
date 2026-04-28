"""
app/routers/savings.py — Savings goals endpoints.
"""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_verified_user
from app.models.user import User
from app.schemas.savings import (
    AIChallenge,
    DepositRequest,
    SavingsGoalCreate,
    SavingsGoalListResponse,
    SavingsGoalResponse,
    SavingsGoalUpdate,
)
from app.services.savings_service import SavingsService

router = APIRouter(prefix="/savings", tags=["Savings"])


def _svc(db: AsyncSession = Depends(get_db)) -> SavingsService:
    return SavingsService(db)


@router.get("", response_model=SavingsGoalListResponse)
async def list_goals(
    user: User = Depends(get_verified_user),
    svc:  SavingsService = Depends(_svc),
) -> SavingsGoalListResponse:
    return await svc.list_goals(user.id)


@router.post("", response_model=SavingsGoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    payload: SavingsGoalCreate,
    user:    User = Depends(get_verified_user),
    svc:     SavingsService = Depends(_svc),
) -> SavingsGoalResponse:
    return await svc.create_goal(user.id, payload)


@router.patch("/{goal_id}", response_model=SavingsGoalResponse)
async def update_goal(
    goal_id: uuid.UUID,
    payload: SavingsGoalUpdate,
    user:    User = Depends(get_verified_user),
    svc:     SavingsService = Depends(_svc),
) -> SavingsGoalResponse:
    return await svc.update_goal(goal_id, user.id, payload)


@router.post("/{goal_id}/deposit", response_model=SavingsGoalResponse)
async def deposit(
    goal_id: uuid.UUID,
    payload: DepositRequest,
    user:    User = Depends(get_verified_user),
    svc:     SavingsService = Depends(_svc),
) -> SavingsGoalResponse:
    return await svc.deposit(goal_id, user.id, payload)


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: uuid.UUID,
    user:    User = Depends(get_verified_user),
    svc:     SavingsService = Depends(_svc),
) -> None:
    await svc.delete_goal(goal_id, user.id)


@router.get("/challenge", response_model=AIChallenge)
async def get_challenge(
    user: User = Depends(get_verified_user),
    svc:  SavingsService = Depends(_svc),
) -> AIChallenge:
    return await svc.get_ai_challenge(user.id)
