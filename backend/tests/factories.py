"""
tests/factories.py

factory_boy factories for generating realistic test data.

Usage in tests:
    user = UserFactory()
    tx   = TransactionFactory(user_id=user.id, amount=50_000)
    goal = SavingsGoalFactory(user_id=user.id)
"""

import uuid
from datetime import UTC, datetime, timedelta
from random import choice, randint, uniform

import factory
from factory import LazyFunction, SubFactory

from app.models.user        import User
from app.models.transaction import Transaction
from app.models.savings_goal import SavingsGoal
from app.utils.enums import (
    MoneyPersonality,
    TransactionCategory,
    TransactionSource,
    TransactionType,
)
from app.utils.security import hash_password


# ── User Factory ──────────────────────────────────────────────────────────────

AFRICAN_FIRST_NAMES = ["Akosua", "Tunde", "Zara", "Amara", "Kofi", "Fatima", "Chidi", "Nia"]
AFRICAN_LAST_NAMES  = ["Mensah", "Bello", "Okonkwo", "Diallo", "Asante", "Nwosu", "Kamau"]


class UserFactory(factory.Factory):
    class Meta:
        model = User

    id                 = LazyFunction(uuid.uuid4)
    first_name         = LazyFunction(lambda: choice(AFRICAN_FIRST_NAMES))
    last_name          = LazyFunction(lambda: choice(AFRICAN_LAST_NAMES))
    email              = factory.LazyAttribute(
        lambda o: f"{o.first_name.lower()}.{o.last_name.lower()}@example.com"
    )
    phone              = "+256700000000"
    hashed_password    = LazyFunction(lambda: hash_password("TestPass@123"))
    is_verified        = True
    is_active          = True
    money_personality  = MoneyPersonality.PLANNER
    otp_code           = None
    otp_expires_at     = None
    otp_purpose        = None
    created_at         = LazyFunction(lambda: datetime.now(UTC))
    updated_at         = LazyFunction(lambda: datetime.now(UTC))


class UnverifiedUserFactory(UserFactory):
    is_verified = False
    otp_code    = "123456"
    otp_expires_at = LazyFunction(
        lambda: datetime.now(UTC) + timedelta(minutes=10)
    )
    otp_purpose = "verify"


# ── Transaction Factory ───────────────────────────────────────────────────────

MTN_DESCRIPTIONS = [
    "MTN MoMo — Salary from Andela",
    "MTN MoMo — Sent to Nakato Sarah",
    "MTN MoMo — Airtime purchase",
    "Rolex from Wandegeya",
    "Game supermarket groceries",
    "Boda boda to Ntinda",
    "Umeme electricity token",
]


class TransactionFactory(factory.Factory):
    class Meta:
        model = Transaction

    id          = LazyFunction(uuid.uuid4)
    user_id     = LazyFunction(uuid.uuid4)
    amount      = LazyFunction(lambda: round(uniform(5_000, 500_000), 2))
    currency    = "UGX"
    type        = TransactionType.EXPENSE
    category    = TransactionCategory.FOOD
    source      = TransactionSource.MANUAL
    description = LazyFunction(lambda: choice(MTN_DESCRIPTIONS))
    date        = LazyFunction(lambda: datetime.now(UTC).date())
    ai_scanned  = False
    created_at  = LazyFunction(lambda: datetime.now(UTC))
    updated_at  = LazyFunction(lambda: datetime.now(UTC))


class IncomeTransactionFactory(TransactionFactory):
    type     = TransactionType.INCOME
    category = TransactionCategory.INCOME
    amount   = LazyFunction(lambda: round(uniform(500_000, 2_000_000), 2))


class SMSScannedTransactionFactory(TransactionFactory):
    source     = TransactionSource.SMS_SCAN
    ai_scanned = True


# ── Savings Goal Factory ──────────────────────────────────────────────────────

GOAL_NAMES = ["Emergency Fund", "Rent Fund", "Laptop Upgrade", "Holiday", "School Fees"]


class SavingsGoalFactory(factory.Factory):
    class Meta:
        model = SavingsGoal

    id             = LazyFunction(uuid.uuid4)
    user_id        = LazyFunction(uuid.uuid4)
    name           = LazyFunction(lambda: choice(GOAL_NAMES))
    target_amount  = LazyFunction(lambda: randint(500_000, 5_000_000))
    current_amount = LazyFunction(lambda: randint(0, 400_000))
    currency       = "UGX"
    deadline       = None
    emoji          = "🎯"
    is_completed   = False
    is_archived    = False
    created_at     = LazyFunction(lambda: datetime.now(UTC))
    updated_at     = LazyFunction(lambda: datetime.now(UTC))


class CompletedGoalFactory(SavingsGoalFactory):
    is_completed   = True
    current_amount = LazyFunction(lambda: randint(500_000, 5_000_000))

    @factory.lazy_attribute
    def target_amount(self):
        return self.current_amount
