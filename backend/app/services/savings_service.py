"""
app/services/savings_service.py

SavingsService — business logic for savings goals.
"""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions.base import LumiBaseException
from app.models.savings_goal import SavingsGoal
from app.repositories.savings_repository import SavingsRepository
from app.schemas.savings import (
    AIChallenge,
    DepositRequest,
    SavingsGoalCreate,
    SavingsGoalListResponse,
    SavingsGoalResponse,
    SavingsGoalUpdate,
)


class SavingsService:

    def __init__(self, db: AsyncSession) -> None:
        self._repo = SavingsRepository(db)

    # ── List ──────────────────────────────────────────────────────────────────

    async def list_goals(self, user_id: uuid.UUID) -> SavingsGoalListResponse:
        goals = await self._repo.get_all_for_user(user_id)
        total_saved    = sum(g.current_amount for g in goals)
        total_targeted = sum(g.target_amount  for g in goals)

        return SavingsGoalListResponse(
            goals=[self._to_response(g) for g in goals],
            total_saved=total_saved,
            total_targeted=total_targeted,
        )

    # ── Create ────────────────────────────────────────────────────────────────

    async def create_goal(
        self, user_id: uuid.UUID, payload: SavingsGoalCreate
    ) -> SavingsGoalResponse:
        goal = SavingsGoal(user_id=user_id, **payload.model_dump())
        saved = await self._repo.create(goal)
        return self._to_response(saved)

    # ── Update ────────────────────────────────────────────────────────────────

    async def update_goal(
        self,
        goal_id: uuid.UUID,
        user_id: uuid.UUID,
        payload: SavingsGoalUpdate,
    ) -> SavingsGoalResponse:
        goal = await self._get_or_404(goal_id, user_id)
        for field, value in payload.model_dump(exclude_none=True).items():
            setattr(goal, field, value)
        # Auto-complete when target reached
        if goal.current_amount >= goal.target_amount:
            goal.is_completed = True
        saved = await self._repo.update(goal)
        return self._to_response(saved)

    # ── Deposit ───────────────────────────────────────────────────────────────

    async def deposit(
        self,
        goal_id: uuid.UUID,
        user_id: uuid.UUID,
        payload: DepositRequest,
    ) -> SavingsGoalResponse:
        goal = await self._get_or_404(goal_id, user_id)
        goal.current_amount = float(goal.current_amount) + payload.amount
        if goal.current_amount >= goal.target_amount:
            goal.is_completed = True
        saved = await self._repo.update(goal)
        return self._to_response(saved)

    # ── Delete ────────────────────────────────────────────────────────────────

    async def delete_goal(
        self, goal_id: uuid.UUID, user_id: uuid.UUID
    ) -> None:
        goal = await self._get_or_404(goal_id, user_id)
        await self._repo.delete(goal)

    # ── AI Challenge ──────────────────────────────────────────────────────────

    async def get_ai_challenge(self, user_id: uuid.UUID) -> AIChallenge:
        """
        Generate a personalised savings challenge.
        TODO: Replace with real AI generation from app/ai/challenge_gen.py
        Uses rule-based placeholder for now.
        """
        total_saved = await self._repo.total_saved(user_id)

        # Placeholder — will be replaced by LangChain call
        if total_saved < 500_000:
            return AIChallenge(
                title="No-Spend Weekend 💪",
                description=(
                    "Skip all non-essential spending this weekend. "
                    "No eating out, no shopping. Every shilling counts!"
                ),
                target_save=50_000,
                duration="3 days",
            )
        return AIChallenge(
            title="Cook at Home Week 🍳",
            description=(
                "Cook all your meals at home for 7 days. "
                "The average Lumi user saves UGX 80,000 doing this!"
            ),
            target_save=80_000,
            duration="7 days",
        )

    # ── Helpers ───────────────────────────────────────────────────────────────

    async def _get_or_404(
        self, goal_id: uuid.UUID, user_id: uuid.UUID
    ) -> SavingsGoal:
        goal = await self._repo.get_for_user(goal_id, user_id)
        if not goal:
            raise LumiBaseException("Savings goal not found")
        return goal

    @staticmethod
    def _to_response(goal: SavingsGoal) -> SavingsGoalResponse:
        return SavingsGoalResponse(
            id=goal.id,
            name=goal.name,
            target_amount=float(goal.target_amount),
            current_amount=float(goal.current_amount),
            currency=goal.currency,
            deadline=goal.deadline,
            emoji=goal.emoji,
            is_completed=goal.is_completed,
            progress_pct=goal.progress_pct,
            remaining=goal.remaining,
            created_at=goal.created_at,
        )
