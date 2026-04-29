"""
app/schemas/scanner.py

Pydantic schemas for the SMS and receipt scanner endpoints.
Kept separate from transaction schemas for clarity.
"""

from datetime import date

from pydantic import BaseModel, Field

from app.utils.enums import TransactionCategory, TransactionType


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
        description="List of SMS messages to scan in batch (max 20)",
    )


class ScanResponse(BaseModel):
    """
    Preview of the scanned transaction shown to the user
    before they confirm and save it.
    """
    amount:      float
    type:        TransactionType
    category:    TransactionCategory
    description: str
    date:        date
    currency:    str
    confidence:  float
    raw_text:    str


class ScanConfirmRequest(BaseModel):
    """
    User has reviewed the preview and confirmed.
    Optionally edited any fields before saving.
    """
    amount:      float               = Field(..., gt=0)
    type:        TransactionType
    category:    TransactionCategory
    description: str                 = Field(..., min_length=1, max_length=500)
    date:        date
    currency:    str                 = "UGX"
