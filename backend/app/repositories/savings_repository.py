"""
app/repositories/savings_repository.py
"""

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.savings_goal import SavingsGoal
from app.repositories.base import BaseRepository


class SavingsRepository(BaseRepository[SavingsGoal]):
    model = SavingsGoal

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db)

    async def get_all_for_user(
        self, user_id: uuid.UUID, include_archived: bool = False
    ) -> list[SavingsGoal]:
        q = select(SavingsGoal).where(SavingsGoal.user_id == user_id)
        if not include_archived:
            q = q.where(SavingsGoal.is_archived.is_(False))
        q = q.order_by(SavingsGoal.created_at.desc())
        result = await self.db.execute(q)
        return list(result.scalars().all())

    async def get_for_user(
        self, goal_id: uuid.UUID, user_id: uuid.UUID
    ) -> SavingsGoal | None:
        result = await self.db.execute(
            select(SavingsGoal).where(
                SavingsGoal.id      == goal_id,
                SavingsGoal.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def total_saved(self, user_id: uuid.UUID) -> float:
        result = await self.db.execute(
            select(func.coalesce(func.sum(SavingsGoal.current_amount), 0))
            .where(
                SavingsGoal.user_id     == user_id,
                SavingsGoal.is_archived.is_(False),
            )
        )
        return float(result.scalar_one())
