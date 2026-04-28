"""
app/models/user.py

User ORM model — core auth entity.
"""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel
from app.utils.enums import MoneyPersonality


class User(BaseModel):
    __tablename__ = "users"

    # ── Identity ──────────────────────────────────────────────────────────────
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name:  Mapped[str] = mapped_column(String(100), nullable=False)
    email:      Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    phone:      Mapped[str | None] = mapped_column(String(30), nullable=True)

    # ── Auth ──────────────────────────────────────────────────────────────────
    hashed_password: Mapped[str] = mapped_column(Text, nullable=False)
    is_verified:     Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active:       Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # ── OTP (verification + password reset) ──────────────────────────────────
    otp_code:       Mapped[str | None] = mapped_column(String(10), nullable=True)
    otp_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    otp_purpose:    Mapped[str | None] = mapped_column(String(30), nullable=True)  # "verify" | "reset"

    # ── AI Personality ────────────────────────────────────────────────────────
    money_personality: Mapped[MoneyPersonality | None] = mapped_column(
        Enum(MoneyPersonality), nullable=True
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    # transactions = relationship("Transaction", back_populates="user", lazy="dynamic")
    # savings_goals = relationship("SavingsGoal", back_populates="user", lazy="dynamic")

    # ── Computed ──────────────────────────────────────────────────────────────

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    @property
    def display_name(self) -> str:
        return self.first_name
