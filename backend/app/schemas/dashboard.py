"""
app/schemas/dashboard.py

Pydantic v2 response schemas for the dashboard endpoint.
"""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, computed_field

from app.utils.enums import TransactionCategory, TransactionSource, TransactionType


class TransactionResponse(BaseModel):
    id:          uuid.UUID
    amount:      float
    type:        TransactionType
    category:    TransactionCategory
    description: str
    date:        date
    source:      TransactionSource
    currency:    str
    ai_scanned:  bool
    created_at:  datetime

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    total_balance:      float
    monthly_income:     float
    monthly_expenses:   float
    savings_rate:       float           # 0–100
    currency:           str = "UGX"
    balance_change_pct: float = 0.0
    income_change_pct:  float = 0.0
    expense_change_pct: float = 0.0


class CategorySpend(BaseModel):
    category:   TransactionCategory
    amount:     float
    percentage: float
    color:      str


class AIInsight(BaseModel):
    id:         str
    message:    str
    type:       str          # tip | warning | celebration | nudge
    created_at: datetime


class DashboardResponse(BaseModel):
    stats:                  DashboardStats
    recent_transactions:    list[TransactionResponse]
    spending_by_category:   list[CategorySpend]
    ai_insight:             AIInsight
