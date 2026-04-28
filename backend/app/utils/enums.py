"""
app/utils/enums.py

Shared Python Enum definitions used in both ORM models and Pydantic schemas.
"""

import enum


class MoneyPersonality(str, enum.Enum):
    SAVER    = "saver"
    SPENDER  = "spender"
    INVESTOR = "investor"
    AVOIDER  = "avoider"
    PLANNER  = "planner"


class TransactionCategory(str, enum.Enum):
    FOOD        = "food"
    TRANSPORT   = "transport"
    SHOPPING    = "shopping"
    UTILITIES   = "utilities"
    HEALTH      = "health"
    EDUCATION   = "education"
    SAVINGS     = "savings"
    INCOME      = "income"
    MOBILE_MONEY = "mobile_money"
    OTHER       = "other"


class BadgeTier(str, enum.Enum):
    BRONZE   = "bronze"
    SILVER   = "silver"
    GOLD     = "gold"
    DIAMOND  = "diamond"


class OtpPurpose(str, enum.Enum):
    VERIFY = "verify"
    RESET  = "reset"
