"""
app/models/savings_goal.py

SavingsGoal ORM model.
"""

import uuid
from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel


class SavingsGoal(BaseModel):
    __tablename__ = "savings_goals"

    # ── Owner ─────────────────────────────────────────────────────────────────
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ── Goal details ──────────────────────────────────────────────────────────
    name:           Mapped[str]   = mapped_column(String(200), nullable=False)
    target_amount:  Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    current_amount: Mapped[float] = mapped_column(Numeric(15, 2), default=0.0, nullable=False)
    currency:       Mapped[str]   = mapped_column(String(10), default="UGX", nullable=False)
    deadline:       Mapped[date | None] = mapped_column(Date, nullable=True)
    emoji:          Mapped[str]   = mapped_column(String(10), default="🎯", nullable=False)
    is_completed:   Mapped[bool]  = mapped_column(Boolean, default=False, nullable=False)
    is_archived:    Mapped[bool]  = mapped_column(Boolean, default=False, nullable=False)

    # ── Computed property ─────────────────────────────────────────────────────
    @property
    def progress_pct(self) -> float:
        if self.target_amount <= 0:
            return 0.0
        return min(round(self.current_amount / self.target_amount * 100, 1), 100.0)

    @property
    def remaining(self) -> float:
        return max(self.target_amount - self.current_amount, 0.0)
