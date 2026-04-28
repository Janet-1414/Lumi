"""
app/schemas/transaction.py

Pydantic v2 schemas for all transaction-related request/response shapes.
"""

import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.utils.enums import TransactionCategory, TransactionSource, TransactionType


# ─── Create ───────────────────────────────────────────────────────────────────

class TransactionCreate(BaseModel):
    amount:      float               = Field(..., gt=0)
    type:        TransactionType
    category:    TransactionCategory
    description: str                 = Field(..., min_length=1, max_length=500)
    date:        date
    currency:    str                 = Field(default="UGX", max_length=10)
    source:      TransactionSource   = TransactionSource.MANUAL
    ai_scanned:  bool                = False

    @field_validator("currency")
    @classmethod
    def uppercase_currency(cls, v: str) -> str:
        return v.upper().strip()


# ─── Update ───────────────────────────────────────────────────────────────────

class TransactionUpdate(BaseModel):
    amount:      float | None               = Field(None, gt=0)
    category:    TransactionCategory | None = None
    description: str | None                 = Field(None, min_length=1, max_length=500)
    date:        date | None                = None


# ─── Read ─────────────────────────────────────────────────────────────────────

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


# ─── Paginated list ───────────────────────────────────────────────────────────

class TransactionListResponse(BaseModel):
    items:    list[TransactionResponse]
    total:    int
    page:     int
    per_page: int
    has_next: bool


# ─── Filters ─────────────────────────────────────────────────────────────────

class TransactionFilters(BaseModel):
    type:       TransactionType | None     = None
    category:   TransactionCategory | None = None
    date_from:  date | None                = None
    date_to:    date | None                = None
    search:     str | None                 = None
    page:       int                        = Field(default=1, ge=1)
    per_page:   int                        = Field(default=20, ge=1, le=100)


# ─── Scanner request/response ─────────────────────────────────────────────────

class ScanRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=10,
        max_length=2000,
        description="Raw SMS or receipt text to scan",
    )


class ScanBatchRequest(BaseModel):
    texts: list[str] = Field(
        ...,
        min_length=1,
        max_length=20,
        description="List of SMS messages to scan in batch",
    )


class ScanResponse(BaseModel):
    """Preview of the scanned transaction before the user confirms."""
    amount:      float
    type:        TransactionType
    category:    TransactionCategory
    description: str
    date:        date
    currency:    str
    confidence:  float
    raw_text:    str


class ScanConfirmRequest(BaseModel):
    """User confirms and optionally edits the scanned transaction before saving."""
    amount:      float               = Field(..., gt=0)
    type:        TransactionType
    category:    TransactionCategory
    description: str                 = Field(..., min_length=1)
    date:        date
    currency:    str                 = "UGX"


# ─── Summary stats ────────────────────────────────────────────────────────────

class TransactionSummary(BaseModel):
    total_income:   float
    total_expenses: float
    net:            float
    count:          int
    currency:       str = "UGX"
