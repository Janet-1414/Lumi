"""
app/services/notification_service.py

NotificationService — decides when and what to notify users about.
Works with the AI notification intelligence module.
"""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.base import BaseService


class NotificationService(BaseService):
    """
    Manages in-app and email notifications.
    The AI layer (notification_ai.py) decides WHAT to send.
    This service handles WHEN and HOW.
    """

    async def send_spending_alert(
        self, user_id: uuid.UUID, category: str, pct_used: float
    ) -> None:
        """Send alert when user has used >80% of a category budget."""
        # TODO: fetch user email, call email_service.send_spending_alert
        pass

    async def send_savings_nudge(self, user_id: uuid.UUID, goal_name: str) -> None:
        """Remind user to contribute to a savings goal."""
        # TODO: push in-app notification + optional email
        pass

    async def send_streak_reminder(self, user_id: uuid.UUID, streak_days: int) -> None:
        """Remind user not to break their saving streak."""
        # TODO: push notification
        pass
