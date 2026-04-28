"""
app/schemas/reports.py — Report response schemas.
"""

from pydantic import BaseModel
from app.utils.enums import TransactionCategory


class MonthlyBar(BaseModel):
    month:    str     # "Jan", "Feb" etc.
    income:   float
    expenses: float
    net:      float


class CategoryBreakdown(BaseModel):
    category:   TransactionCategory
    amount:     float
    percentage: float
    color:      str


class AIReportSummary(BaseModel):
    headline:      str
    body:          str
    top_insight:   str
    savings_tip:   str


class ReportResponse(BaseModel):
    period:             str        # "This Month", "Last 3 Months" etc.
    monthly_bars:       list[MonthlyBar]
    category_breakdown: list[CategoryBreakdown]
    ai_summary:         AIReportSummary
    total_income:       float
    total_expenses:     float
    net_savings:        float
    savings_rate:       float
    currency:           str = "UGX"
