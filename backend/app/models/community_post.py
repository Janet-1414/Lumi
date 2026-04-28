"""
app/models/community_post.py

CommunityPost — anonymous community wins feed.
No real names or money amounts are ever stored.
"""

import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel


class CommunityPost(BaseModel):
    __tablename__ = "community_posts"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ── Display (anonymous by design) ─────────────────────────────────────────
    alias:   Mapped[str] = mapped_column(String(60),  nullable=False)  # e.g. "SavingsLion_KLA"
    message: Mapped[str] = mapped_column(String(300), nullable=False)  # No amounts allowed
    emoji:   Mapped[str] = mapped_column(String(10),  default="🎉",   nullable=False)
    likes:   Mapped[int] = mapped_column(Integer,     default=0,       nullable=False)

    # ── Moderation ────────────────────────────────────────────────────────────
    is_approved: Mapped[bool] = mapped_column(Boolean, default=True,  nullable=False)
    is_flagged:  Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
