"""app/schemas/transaction.py"""

import uuid
from datetime import date as Date, datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.utils.enums import TransactionCategory, TransactionSource, TransactionType


class TransactionCreate(BaseModel):
    amount:      float               = Field(..., gt=0)
    type:        TransactionType
    category:    TransactionCategory
    description: str                 = Field(..., min_length=1, max_length=500)
    date:        Date
    currency:    str                 = Field(default="UGX", max_length=10)
    source:      TransactionSource   = TransactionSource.MANUAL
    ai_scanned:  bool                = False

    @field_validator("currency")
    @classmethod
    def uppercase_currency(cls, v: str) -> str:
        return v.upper().strip()


class TransactionUpdate(BaseModel):
    amount:      float | None               = Field(None, gt=0)
    category:    TransactionCategory | None = None
    description: str | None                 = Field(None, min_length=1, max_length=500)
    date:        Date | None                = None


class TransactionResponse(BaseModel):
    id:          uuid.UUID
    amount:      float
    type:        TransactionType
    category:    TransactionCategory
    description: str
    date:        Date
    source:      TransactionSource
    currency:    str
    ai_scanned:  bool
    created_at:  datetime

    model_config = {"from_attributes": True}


class TransactionListResponse(BaseModel):
    items:    list[TransactionResponse]
    total:    int
    page:     int
    per_page: int
    has_next: bool


class TransactionFilters(BaseModel):
    type:       TransactionType | None     = None
    category:   TransactionCategory | None = None
    date_from:  Date | None                = None
    date_to:    Date | None                = None
    search:     str | None                 = None
    page:       int                        = Field(default=1, ge=1)
    per_page:   int                        = Field(default=20, ge=1, le=100)


class ScanRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=2000)


class ScanBatchRequest(BaseModel):
    texts: list[str] = Field(..., min_length=1, max_length=20)


class ScanResponse(BaseModel):
    amount:      float
    type:        TransactionType
    category:    TransactionCategory
    description: str
    date:        Date
    currency:    str
    confidence:  float
    raw_text:    str


class ScanConfirmRequest(BaseModel):
    amount:      float               = Field(..., gt=0)
    type:        TransactionType
    category:    TransactionCategory
    description: str                 = Field(..., min_length=1)
    date:        Date
    currency:    str                 = "UGX"


class TransactionSummary(BaseModel):
    total_income:   float
    total_expenses: float
    net:            float
    count:          int
    currency:       str = "UGX"