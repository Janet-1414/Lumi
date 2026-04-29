"""
app/repositories/badge_repository.py

BadgeRepository — badge and user_badge DB queries.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.badge import Badge
from app.models.user_badge import UserBadge
from app.repositories.base import BaseRepository


class BadgeRepository(BaseRepository[Badge]):
    model = Badge

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db)

    async def get_all_badges(self) -> list[Badge]:
        result = await self.db.execute(
            select(Badge).order_by(Badge.created_at)
        )
        return list(result.scalars().all())

    async def get_user_badge_ids(self, user_id: uuid.UUID) -> set[uuid.UUID]:
        """Return set of badge IDs the user has already earned."""
        result = await self.db.execute(
            select(UserBadge.badge_id).where(UserBadge.user_id == user_id)
        )
        return {row for row in result.scalars().all()}

    async def award_badge(
        self, user_id: uuid.UUID, badge_id: uuid.UUID
    ) -> UserBadge:
        """Award a badge to a user — safe to call even if already awarded."""
        existing = await self.db.execute(
            select(UserBadge).where(
                UserBadge.user_id  == user_id,
                UserBadge.badge_id == badge_id,
            )
        )
        if existing.scalar_one_or_none():
            return existing.scalar_one_or_none()  # type: ignore[return-value]

        user_badge = UserBadge(user_id=user_id, badge_id=badge_id)
        self.db.add(user_badge)
        await self.db.flush()
        return user_badge
