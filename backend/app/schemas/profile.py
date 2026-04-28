"""app/schemas/profile.py"""

import uuid
from datetime import datetime
from pydantic import BaseModel
from app.utils.enums import BadgeTier, MoneyPersonality


class BadgeResponse(BaseModel):
    id:          uuid.UUID
    name:        str
    description: str
    emoji:       str
    tier:        BadgeTier
    unlocked:    bool
    unlocked_at: datetime | None = None


class ProfileStatsResponse(BaseModel):
    total_transactions: int
    total_saved:        float
    saving_streak_days: int
    goals_completed:    int
    ai_scans_done:      int
    currency:           str = "UGX"


class ProfileResponse(BaseModel):
    id:                uuid.UUID
    first_name:        str
    last_name:         str
    email:             str
    money_personality: MoneyPersonality | None
    badges:            list[BadgeResponse]
    stats:             ProfileStatsResponse
    created_at:        datetime
    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    first_name:        str | None = None
    last_name:         str | None = None
    money_personality: MoneyPersonality | None = None


class NotificationSettings(BaseModel):
    spending_alerts:   bool = True
    weekly_report:     bool = True
    savings_reminders: bool = True
    community_digest:  bool = False
