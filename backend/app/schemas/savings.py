"""
app/schemas/savings.py

Pydantic v2 schemas for savings goals.
"""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator, computed_field


class SavingsGoalCreate(BaseModel):
    name:          str   = Field(..., min_length=1, max_length=200)
    target_amount: float = Field(..., gt=0)
    current_amount: float = Field(default=0.0, ge=0)
    currency:      str   = Field(default="UGX", max_length=10)
    deadline:      date | None = None
    emoji:         str   = Field(default="🎯", max_length=10)

    @field_validator("currency")
    @classmethod
    def uppercase_currency(cls, v: str) -> str:
        return v.upper().strip()


class SavingsGoalUpdate(BaseModel):
    name:           str | None   = Field(None, min_length=1, max_length=200)
    target_amount:  float | None = Field(None, gt=0)
    current_amount: float | None = Field(None, ge=0)
    deadline:       date | None  = None
    emoji:          str | None   = Field(None, max_length=10)


class DepositRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount to add to the goal")


class SavingsGoalResponse(BaseModel):
    id:             uuid.UUID
    name:           str
    target_amount:  float
    current_amount: float
    currency:       str
    deadline:       date | None
    emoji:          str
    is_completed:   bool
    progress_pct:   float
    remaining:      float
    created_at:     datetime

    model_config = {"from_attributes": True}


class SavingsGoalListResponse(BaseModel):
    goals:          list[SavingsGoalResponse]
    total_saved:    float
    total_targeted: float
    currency:       str = "UGX"


class AIChallenge(BaseModel):
    title:       str
    description: str
    target_save: float
    duration:    str       # e.g. "7 days"
    currency:    str = "UGX"
