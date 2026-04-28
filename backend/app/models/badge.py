"""app/models/badge.py"""

import uuid
from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import BaseModel
from app.utils.enums import BadgeTier


class Badge(BaseModel):
    __tablename__ = "badges"

    name:        Mapped[str]      = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str]      = mapped_column(String(300), nullable=False)
    emoji:       Mapped[str]      = mapped_column(String(10),  nullable=False)
    tier:        Mapped[BadgeTier] = mapped_column(Enum(BadgeTier), nullable=False)
    requirement: Mapped[str]      = mapped_column(String(200), nullable=False)
