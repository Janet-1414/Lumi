"""
app/repositories/transaction_repository.py

TransactionRepository — all DB queries for transactions.
"""

import uuid
from datetime import date
from typing import Any

from sqlalchemy import and_, extract, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transaction import Transaction
from app.repositories.base import BaseRepository
from app.schemas.transaction import TransactionFilters
from app.utils.enums import TransactionType


class TransactionRepository(BaseRepository[Transaction]):
    model = Transaction

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db)

    # ── Fetch ─────────────────────────────────────────────────────────────────

    async def get_recent(
        self, user_id: uuid.UUID, limit: int = 10
    ) -> list[Transaction]:
        result = await self.db.execute(
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(Transaction.date.desc(), Transaction.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_filtered(
        self,
        user_id: uuid.UUID,
        filters: TransactionFilters,
    ) -> tuple[list[Transaction], int]:
        """
        Returns (items, total_count) for paginated + filtered queries.
        """
        base = select(Transaction).where(Transaction.user_id == user_id)

        # Apply optional filters
        if filters.type:
            base = base.where(Transaction.type == filters.type)

        if filters.category:
            base = base.where(Transaction.category == filters.category)

        if filters.date_from:
            base = base.where(Transaction.date >= filters.date_from)

        if filters.date_to:
            base = base.where(Transaction.date <= filters.date_to)

        if filters.search:
            term = f"%{filters.search}%"
            base = base.where(Transaction.description.ilike(term))

        # Count before pagination
        count_q = select(func.count()).select_from(base.subquery())
        total   = (await self.db.execute(count_q)).scalar_one()

        # Paginate
        offset = (filters.page - 1) * filters.per_page
        items_q = (
            base
            .order_by(Transaction.date.desc(), Transaction.created_at.desc())
            .offset(offset)
            .limit(filters.per_page)
        )
        items = list((await self.db.execute(items_q)).scalars().all())

        return items, total

    async def get_by_id_for_user(
        self, transaction_id: uuid.UUID, user_id: uuid.UUID
    ) -> Transaction | None:
        result = await self.db.execute(
            select(Transaction).where(
                Transaction.id      == transaction_id,
                Transaction.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    # ── Aggregations ──────────────────────────────────────────────────────────

    async def sum_by_type(
        self,
        user_id: uuid.UUID,
        tx_type: TransactionType,
        year: int,
        month: int,
    ) -> float:
        result = await self.db.execute(
            select(func.coalesce(func.sum(Transaction.amount), 0))
            .where(
                Transaction.user_id == user_id,
                Transaction.type    == tx_type,
                extract("year",  Transaction.date) == year,
                extract("month", Transaction.date) == month,
            )
        )
        return float(result.scalar_one())

    async def spending_by_category(
        self, user_id: uuid.UUID, year: int, month: int
    ) -> list[dict[str, Any]]:
        result = await self.db.execute(
            select(
                Transaction.category,
                func.sum(Transaction.amount).label("amount"),
            )
            .where(
                Transaction.user_id == user_id,
                Transaction.type    == TransactionType.EXPENSE,
                extract("year",  Transaction.date) == year,
                extract("month", Transaction.date) == month,
            )
            .group_by(Transaction.category)
            .order_by(func.sum(Transaction.amount).desc())
        )
        return [
            {"category": row.category, "amount": float(row.amount)}
            for row in result
        ]

    async def summary(
        self,
        user_id: uuid.UUID,
        date_from: date | None = None,
        date_to:   date | None = None,
    ) -> dict[str, float]:
        """Income total, expense total and net for a date range."""
        base = select(
            Transaction.type,
            func.sum(Transaction.amount).label("total"),
        ).where(Transaction.user_id == user_id)

        if date_from:
            base = base.where(Transaction.date >= date_from)
        if date_to:
            base = base.where(Transaction.date <= date_to)

        base = base.group_by(Transaction.type)
        rows = (await self.db.execute(base)).all()

        totals = {row.type.value: float(row.total) for row in rows}
        income   = totals.get("income",  0.0)
        expenses = totals.get("expense", 0.0)
        return {"income": income, "expenses": expenses, "net": income - expenses}
