"""app/utils/enums.py — All application enums."""

import enum


class TransactionType(str, enum.Enum):
    INCOME  = "income"
    EXPENSE = "expense"


class TransactionCategory(str, enum.Enum):
    FOOD         = "food"
    TRANSPORT    = "transport"
    SHOPPING     = "shopping"
    UTILITIES    = "utilities"
    HEALTH       = "health"
    EDUCATION    = "education"
    SAVINGS      = "savings"
    INCOME       = "income"
    MOBILE_MONEY = "mobile_money"
    OTHER        = "other"


class TransactionSource(str, enum.Enum):
    MANUAL       = "manual"
    SMS_SCAN     = "sms_scan"
    RECEIPT_SCAN = "receipt_scan"


class MoneyPersonality(str, enum.Enum):
    SAVER    = "saver"
    SPENDER  = "spender"
    INVESTOR = "investor"
    AVOIDER  = "avoider"
    PLANNER  = "planner"


class BadgeTier(str, enum.Enum):
    BRONZE  = "bronze"
    SILVER  = "silver"
    GOLD    = "gold"
    DIAMOND = "diamond"


class OtpPurpose(str, enum.Enum):
    VERIFY         = "verify"
    RESET_PASSWORD = "reset_password"


class InsightType(str, enum.Enum):
    TIP         = "tip"
    WARNING     = "warning"
    CELEBRATION = "celebration"
    NUDGE       = "nudge"