"""
app/schemas/user.py

Pydantic schemas for user profile management.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.utils.enums import MoneyPersonality


class UserCreate(BaseModel):
    first_name: str       = Field(..., min_length=2, max_length=100)
    last_name:  str       = Field(..., min_length=2, max_length=100)
    email:      EmailStr
    phone:      str | None = Field(None, max_length=30)
    password:   str       = Field(..., min_length=8)


class UserRead(BaseModel):
    id:                uuid.UUID
    first_name:        str
    last_name:         str
    email:             str
    phone:             str | None
    is_verified:       bool
    money_personality: MoneyPersonality | None
    created_at:        datetime

    model_config = {"from_attributes": True}

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"


class UserUpdate(BaseModel):
    first_name:        str | None            = Field(None, min_length=2, max_length=100)
    last_name:         str | None            = Field(None, min_length=2, max_length=100)
    phone:             str | None            = Field(None, max_length=30)
    money_personality: MoneyPersonality | None = None


class UserPublic(BaseModel):
    """Safe public-facing user data — no sensitive fields."""
    id:         uuid.UUID
    first_name: str
    email:      str

    model_config = {"from_attributes": True}
