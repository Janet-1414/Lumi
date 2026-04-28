"""
app/services/badge_service.py

BadgeService — detects milestones and awards badges to users.

Milestones tracked:
  - First transaction logged
  - 7-day saving streak
  - 14-day saving streak
  - 30-day saving streak
  - First savings goal created
  - First SMS scan completed
  - First savings goal completed
  - 10 AI chat sessions
"""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.base import BaseService


# ── Milestone definitions ─────────────────────────────────────────────────────

BADGE_DEFINITIONS = [
    {"name": "First Step",      "emoji": "👣", "tier": "bronze",  "desc": "Logged your first transaction"},
    {"name": "Week Warrior",    "emoji": "🔥", "tier": "bronze",  "desc": "7-day saving streak"},
    {"name": "SMS Scanner",     "emoji": "📱", "tier": "bronze",  "desc": "Scanned your first MoMo SMS"},
    {"name": "Goal Setter",     "emoji": "🎯", "tier": "bronze",  "desc": "Created your first savings goal"},
    {"name": "Fortnight Fire",  "emoji": "💫", "tier": "silver",  "desc": "14-day saving streak"},
    {"name": "Budget Boss",     "emoji": "💼", "tier": "silver",  "desc": "Stayed under budget for a month"},
    {"name": "Goal Crusher",    "emoji": "🏆", "tier": "gold",    "desc": "Completed a savings goal"},
    {"name": "AI Whisperer",    "emoji": "🤖", "tier": "gold",    "desc": "10 AI chat sessions"},
    {"name": "Diamond Saver",   "emoji": "💎", "tier": "diamond", "desc": "100-day saving streak"},
]


class BadgeService(BaseService):
    """
    Checks user activity and awards badges when milestones are hit.
    Called after key actions: transaction logged, goal completed, etc.
    """

    async def check_and_award(self, user_id: uuid.UUID, event: str) -> list[str]:
        """
        Check if the given event triggers any badge awards.

        Args:
            user_id: The user to check.
            event:   One of: "first_transaction", "streak_7", "streak_14",
                     "streak_30", "streak_100", "first_goal", "goal_completed",
                     "first_scan", "chat_session_10"

        Returns:
            List of newly awarded badge names.
        """
        # TODO: implement full DB-backed milestone tracking
        # For now returns empty list — badges shown via profile placeholder data
        awarded: list[str] = []
        return awarded

    async def get_user_badges(self, user_id: uuid.UUID) -> list[dict]:
        """Return all badges with unlocked status for the user."""
        # TODO: query user_badges junction table
        return BADGE_DEFINITIONS
