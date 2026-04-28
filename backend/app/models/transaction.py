"""
app/models/transaction.py

Transaction ORM model.
"""

import uuid
from datetime import date

from sqlalchemy import Boolean, Date, Enum, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel
from app.utils.enums import TransactionCategory, TransactionSource, TransactionType


class Transaction(BaseModel):
    __tablename__ = "transactions"

    # ── Owner ─────────────────────────────────────────────────────────────────
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ── Money ─────────────────────────────────────────────────────────────────
    amount:   Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    currency: Mapped[str]   = mapped_column(String(10), default="UGX", nullable=False)

    # ── Classification ────────────────────────────────────────────────────────
    type:     Mapped[TransactionType]     = mapped_column(Enum(TransactionType),     nullable=False)
    category: Mapped[TransactionCategory] = mapped_column(Enum(TransactionCategory), nullable=False)
    source:   Mapped[TransactionSource]   = mapped_column(
        Enum(TransactionSource), default=TransactionSource.MANUAL, nullable=False
    )

    # ── Details ───────────────────────────────────────────────────────────────
    description: Mapped[str]  = mapped_column(String(500), nullable=False)
    date:        Mapped[date] = mapped_column(Date, nullable=False, index=True)
    ai_scanned:  Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # ── Relationships ─────────────────────────────────────────────────────────
    # user = relationship("User", back_populates="transactions")
