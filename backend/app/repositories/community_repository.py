"""
app/repositories/community_repository.py

CommunityRepository — all DB queries for community posts.
Enforces anonymity at the repository level.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.community_post import CommunityPost
from app.repositories.base import BaseRepository


class CommunityRepository(BaseRepository[CommunityPost]):
    model = CommunityPost

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db)

    async def get_approved_feed(
        self, limit: int = 20, offset: int = 0
    ) -> list[CommunityPost]:
        """Return approved, non-flagged posts for the public feed."""
        result = await self.db.execute(
            select(CommunityPost)
            .where(
                CommunityPost.is_approved.is_(True),
                CommunityPost.is_flagged.is_(False),
            )
            .order_by(CommunityPost.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def increment_likes(self, post_id: uuid.UUID) -> None:
        """Increment like count for a post."""
        post = await self.get_by_id(post_id)
        if post:
            post.likes += 1
            await self.save(post)

    async def flag_post(self, post_id: uuid.UUID) -> None:
        """Flag a post for moderation review."""
        post = await self.get_by_id(post_id)
        if post:
            post.is_flagged = True
            await self.save(post)
