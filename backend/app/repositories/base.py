"""
app/repositories/base.py

BaseRepository[T] — generic async CRUD operations.
All concrete repositories extend this and add domain-specific queries.

Pattern: Repository layer handles ALL database access.
Services call repositories — never write raw queries in services.
"""

from typing import Generic, TypeVar
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import BaseModel

T = TypeVar("T", bound=BaseModel)


class BaseRepository(Generic[T]):
    """
    Generic async repository providing standard CRUD operations.

    Usage:
        class UserRepository(BaseRepository[User]):
            model = User
    """

    model: type[T]

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, record_id: UUID) -> T | None:
        """Fetch a single record by primary key."""
        result = await self.db.execute(
            select(self.model).where(self.model.id == record_id)
        )
        return result.scalar_one_or_none()

    async def get_all(self, limit: int = 100, offset: int = 0) -> list[T]:
        """Fetch paginated records."""
        result = await self.db.execute(
            select(self.model).limit(limit).offset(offset)
        )
        return list(result.scalars().all())

    async def create(self, instance: T) -> T:
        """Persist a new record."""
        self.db.add(instance)
        await self.db.flush()   # flush to get server defaults (id, timestamps)
        await self.db.refresh(instance)
        return instance

    async def update(self, instance: T) -> T:
        """Persist changes to an existing record."""
        self.db.add(instance)
        await self.db.flush()
        await self.db.refresh(instance)
        return instance

    async def delete(self, instance: T) -> None:
        """Hard-delete a record."""
        await self.db.delete(instance)
        await self.db.flush()

    async def save(self, instance: T) -> T:
        """Add and flush without committing (commit happens at request end)."""
        self.db.add(instance)
        await self.db.flush()
        await self.db.refresh(instance)
        return instance
