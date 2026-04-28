"""
app/schemas/community.py

Community schemas — everything is anonymous by design.
No real names, no actual money amounts are ever exposed.
Leaderboard uses percentage completion only.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class CommunityPost(BaseModel):
    id:          uuid.UUID
    alias:       str       # e.g. "SavingsLion_KLA" — never real name
    message:     str       # win description — no amounts
    emoji:       str
    likes:       int
    created_at:  datetime

    model_config = {"from_attributes": True}


class CreatePostRequest(BaseModel):
    message: str = Field(..., min_length=5, max_length=300)
    emoji:   str = Field(default="🎉", max_length=5)
    anonymous: bool = True  # always anonymous by default


class GroupChallenge(BaseModel):
    id:           uuid.UUID
    title:        str
    description:  str
    emoji:        str
    participants: int
    progress_pct: float     # collective % completion
    duration:     str
    joined:       bool = False


class LeaderboardEntry(BaseModel):
    rank:        int
    alias:       str       # anonymous username
    progress_pct: float    # percentage of goal completed — NEVER actual amount
    badge_tier:  str       # bronze | silver | gold | diamond
    is_you:      bool = False


class WeeklyPulse(BaseModel):
    headline:         str     # "Lumi users saved a combined UGX 124M this week"
    total_saved_ugx:  float   # aggregate — safe to show, not individual
    active_savers:    int
    top_category:     str
    generated_at:     datetime


class CommunityTip(BaseModel):
    id:      uuid.UUID
    alias:   str
    tip:     str
    likes:   int
    created_at: datetime
