"""
app/repositories/user_repository.py

UserRepository — all database queries related to users.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    model = User

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db)

    async def get_by_email(self, email: str) -> User | None:
        """Fetch a user by email address (case-insensitive)."""
        result = await self.db.execute(
            select(User).where(User.email == email.lower())
        )
        return result.scalar_one_or_none()

    async def email_exists(self, email: str) -> bool:
        """Check if an email is already registered."""
        user = await self.get_by_email(email)
        return user is not None

    async def get_active_by_email(self, email: str) -> User | None:
        """Fetch an active (non-disabled) user by email."""
        result = await self.db.execute(
            select(User).where(
                User.email == email.lower(),
                User.is_active.is_(True),
            )
        )
        return result.scalar_one_or_none()
