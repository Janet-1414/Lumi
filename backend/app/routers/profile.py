"""app/routers/profile.py"""

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_verified_user
from app.models.user import User
from app.schemas.profile import (
    BadgeResponse,
    NotificationSettings,
    ProfileResponse,
    ProfileStatsResponse,
    UpdateProfileRequest,
)
from app.utils.enums import BadgeTier, MoneyPersonality

router = APIRouter(prefix="/profile", tags=["Profile"])

# ── Placeholder badge data (replaced by badge_service in production) ──────────

def _build_badges(user: User) -> list[BadgeResponse]:
    now = datetime.now(UTC)
    all_badges = [
        {"name": "First Step",      "desc": "Logged your first transaction",   "emoji": "👣", "tier": BadgeTier.BRONZE,  "unlocked": True,  "at": now},
        {"name": "Week Warrior",    "desc": "7-day saving streak",             "emoji": "🔥", "tier": BadgeTier.BRONZE,  "unlocked": True,  "at": now},
        {"name": "SMS Scanner",     "desc": "Scanned your first MoMo SMS",     "emoji": "📱", "tier": BadgeTier.BRONZE,  "unlocked": True,  "at": now},
        {"name": "Goal Setter",     "desc": "Created your first savings goal", "emoji": "🎯", "tier": BadgeTier.BRONZE,  "unlocked": True,  "at": now},
        {"name": "Fortnight Fire",  "desc": "14-day saving streak",            "emoji": "💫", "tier": BadgeTier.SILVER,  "unlocked": True,  "at": now},
        {"name": "Budget Boss",     "desc": "Stayed under budget for a month", "emoji": "💼", "tier": BadgeTier.SILVER,  "unlocked": False, "at": None},
        {"name": "Goal Crusher",    "desc": "Completed a savings goal",        "emoji": "🏆", "tier": BadgeTier.GOLD,    "unlocked": False, "at": None},
        {"name": "AI Whisperer",    "desc": "Had 10 AI chat sessions",         "emoji": "🤖", "tier": BadgeTier.GOLD,    "unlocked": False, "at": None},
        {"name": "Diamond Saver",   "desc": "100-day saving streak",           "emoji": "💎", "tier": BadgeTier.DIAMOND, "unlocked": False, "at": None},
    ]
    return [
        BadgeResponse(
            id=uuid.uuid4(), name=b["name"], description=b["desc"],
            emoji=b["emoji"], tier=b["tier"],
            unlocked=b["unlocked"], unlocked_at=b["at"],
        )
        for b in all_badges
    ]


@router.get("", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_verified_user),
) -> ProfileResponse:
    return ProfileResponse(
        id=current_user.id,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        email=current_user.email,
        money_personality=current_user.money_personality,
        badges=_build_badges(current_user),
        stats=ProfileStatsResponse(
            total_transactions=47,
            total_saved=2_890_000,
            saving_streak_days=14,
            goals_completed=1,
            ai_scans_done=12,
        ),
        created_at=current_user.created_at,
    )


@router.patch("", response_model=ProfileResponse)
async def update_profile(
    payload:      UpdateProfileRequest,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession   = Depends(get_db),
) -> ProfileResponse:
    if payload.first_name:
        current_user.first_name = payload.first_name
    if payload.last_name:
        current_user.last_name = payload.last_name
    if payload.money_personality:
        current_user.money_personality = payload.money_personality
    await db.flush()
    await db.refresh(current_user)
    return await get_profile(current_user)


@router.get("/notification-settings", response_model=NotificationSettings)
async def get_notification_settings(
    user: User = Depends(get_verified_user),
) -> NotificationSettings:
    return NotificationSettings()


@router.patch("/notification-settings", response_model=NotificationSettings)
async def update_notification_settings(
    payload: NotificationSettings,
    user:    User = Depends(get_verified_user),
) -> NotificationSettings:
    # TODO: persist to user_settings table
    return payload
