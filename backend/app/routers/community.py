"""
app/routers/community.py

Community is 100% anonymous — no real names or actual amounts ever exposed.
"""

import uuid
from datetime import UTC, datetime
from typing import Literal

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_verified_user
from app.models.user import User
from app.schemas.community import (
    CommunityPost,
    CommunityTip,
    CreatePostRequest,
    GroupChallenge,
    LeaderboardEntry,
    WeeklyPulse,
)

router = APIRouter(prefix="/community", tags=["Community"])

# ── Realistic anonymous placeholder data ──────────────────────────────────────
# In production these come from the DB — for MVP they're served as-is.

_POSTS = [
    {"id": uuid.uuid4(), "alias": "SavingsLion_KLA",   "message": "Just hit 60% of my emergency fund! Starting from zero 6 months ago 💪", "emoji": "🦁", "likes": 47, "created_at": datetime.now(UTC)},
    {"id": uuid.uuid4(), "alias": "BudgetQueen_ABJ",   "message": "Cooked at home all week and saved my transport budget. Small wins!", "emoji": "👑", "likes": 31, "created_at": datetime.now(UTC)},
    {"id": uuid.uuid4(), "alias": "ZaraSaves",          "message": "First time saving 20% of my salary. It's possible fr 🎯", "emoji": "🎯", "likes": 28, "created_at": datetime.now(UTC)},
    {"id": uuid.uuid4(), "alias": "TundeMoney",         "message": "Paid off my data loan this month. Never borrowing for airtime again!", "emoji": "🔥", "likes": 22, "created_at": datetime.now(UTC)},
    {"id": uuid.uuid4(), "alias": "AkosuaFinance_ACC",  "message": "14-day saving streak! The Lumi fire emoji keeps me going lol", "emoji": "😂", "likes": 19, "created_at": datetime.now(UTC)},
]

_CHALLENGES = [
    {"id": uuid.uuid4(), "title": "No Eating Out Challenge", "description": "Cook all meals at home for 7 days", "emoji": "🍳", "participants": 234, "progress_pct": 68.0, "duration": "7 days"},
    {"id": uuid.uuid4(), "title": "Transport Budget Week",   "description": "Cut transport spending by 30% this week", "emoji": "🚌", "participants": 189, "progress_pct": 45.2, "duration": "7 days"},
    {"id": uuid.uuid4(), "title": "No-Spend Weekend",        "description": "Zero non-essential spending Sat–Sun", "emoji": "💪", "participants": 312, "progress_pct": 82.1, "duration": "3 days"},
]

_LEADERBOARD = [
    {"rank": 1, "alias": "DiamondSaver_LGS", "progress_pct": 97.4, "badge_tier": "diamond"},
    {"rank": 2, "alias": "GoldGoals_NBO",    "progress_pct": 94.1, "badge_tier": "gold"},
    {"rank": 3, "alias": "SavingsLion_KLA",  "progress_pct": 91.7, "badge_tier": "gold"},
    {"rank": 4, "alias": "BudgetQueen_ABJ",  "progress_pct": 88.3, "badge_tier": "silver"},
    {"rank": 5, "alias": "You",              "progress_pct": 75.0, "badge_tier": "silver", "is_you": True},
    {"rank": 6, "alias": "ZaraSaves",        "progress_pct": 71.2, "badge_tier": "silver"},
    {"rank": 7, "alias": "TundeMoney",       "progress_pct": 68.9, "badge_tier": "bronze"},
    {"rank": 8, "alias": "AkosuaFinance_ACC","progress_pct": 61.3, "badge_tier": "bronze"},
    {"rank": 9, "alias": "FrugalKing_ACC",   "progress_pct": 55.0, "badge_tier": "bronze"},
    {"rank": 10,"alias": "PennyWise_KLA",    "progress_pct": 48.7, "badge_tier": "bronze"},
]

_TIPS = [
    {"id": uuid.uuid4(), "alias": "BudgetQueen_ABJ",  "tip": "Set your savings transfer for the same day as salary. Treat it like a bill.", "likes": 89},
    {"id": uuid.uuid4(), "alias": "SavingsLion_KLA",  "tip": "Delete your payment apps for 48 hours when temptation strikes. Works every time.", "likes": 72},
    {"id": uuid.uuid4(), "alias": "GoldGoals_NBO",    "tip": "Use three MoMo wallets: bills, spending, savings. Never mix them.", "likes": 61},
]


@router.get("/feed", response_model=list[CommunityPost])
async def get_feed(
    user: User = Depends(get_verified_user)
) -> list[CommunityPost]:
    return [CommunityPost(**p) for p in _POSTS]


@router.post("/feed", response_model=CommunityPost, status_code=status.HTTP_201_CREATED)
async def create_post(
    payload: CreatePostRequest,
    user:    User = Depends(get_verified_user),
) -> CommunityPost:
    """Post a win to the community feed. Always anonymous — no real name stored."""
    new = {
        "id":         uuid.uuid4(),
        "alias":      "You" if not payload.anonymous else f"Saver_{str(user.id)[:6].upper()}",
        "message":    payload.message,
        "emoji":      payload.emoji,
        "likes":      0,
        "created_at": datetime.now(UTC),
    }
    _POSTS.insert(0, new)
    return CommunityPost(**new)


@router.get("/challenges", response_model=list[GroupChallenge])
async def get_challenges(
    user: User = Depends(get_verified_user)
) -> list[GroupChallenge]:
    return [GroupChallenge(**c) for c in _CHALLENGES]


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
async def get_leaderboard(
    user: User = Depends(get_verified_user)
) -> list[LeaderboardEntry]:
    """
    Ranked by savings goal completion percentage ONLY.
    No actual money amounts are ever included in this response.
    """
    return [LeaderboardEntry(**e) for e in _LEADERBOARD]


@router.get("/pulse", response_model=WeeklyPulse)
async def get_weekly_pulse(
    user: User = Depends(get_verified_user)
) -> WeeklyPulse:
    """AI-generated anonymous collective savings impact summary."""
    return WeeklyPulse(
        headline="Lumi users saved a combined UGX 124M this week 🌍",
        total_saved_ugx=124_000_000,
        active_savers=1_847,
        top_category="Food & Dining",
        generated_at=datetime.now(UTC),
    )


@router.get("/tips", response_model=list[CommunityTip])
async def get_tips(
    user: User = Depends(get_verified_user)
) -> list[CommunityTip]:
    return [CommunityTip(**t, created_at=datetime.now(UTC)) for t in _TIPS]
