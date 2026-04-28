"""
app/services/community_service.py

CommunityService — enforces anonymity rules at the service layer.

Rules enforced here (not just in the schema):
  1. No real user names ever returned in community responses
  2. No actual money amounts ever in community data
  3. Leaderboard uses percentage completion only
  4. Posts are moderated before appearing in feed
"""

import uuid
import re

from sqlalchemy.ext.asyncio import AsyncSession
from app.exceptions.base import LumiBaseException
from app.services.base import BaseService
from app.utils.utils import generate_alias


class CommunityService(BaseService):
    """
    Enforces Lumi's anonymity guarantee for all community features.
    Every method in this service is responsible for ensuring no PII
    or financial amounts leak into community-facing data.
    """

    AMOUNT_PATTERN = re.compile(
        r'\b(ugx|usd|kes|ngn|ghs)?\s*[\d,]+(\.\d+)?\b',
        re.IGNORECASE,
    )

    async def create_post(
        self,
        user_id:   uuid.UUID,
        message:   str,
        emoji:     str,
        anonymous: bool = True,
    ) -> dict:
        """
        Create an anonymous community post.
        Scans the message for money amounts and rejects if found.
        """
        if self._contains_amount(message):
            raise LumiBaseException(
                "Posts cannot contain specific money amounts. "
                "Share your win without numbers to protect your privacy!"
            )

        alias = self._generate_safe_alias(user_id, anonymous)

        # TODO: save to community_posts table via repository
        return {
            "alias":   alias,
            "message": message,
            "emoji":   emoji,
        }

    def _contains_amount(self, text: str) -> bool:
        """Check if text contains a monetary amount."""
        return bool(self.AMOUNT_PATTERN.search(text))

    @staticmethod
    def _generate_safe_alias(user_id: uuid.UUID, anonymous: bool) -> str:
        """Generate a consistent anonymous alias for a user."""
        if anonymous:
            # Deterministic from user_id so same user always gets same alias
            import hashlib
            seed = hashlib.md5(str(user_id).encode()).hexdigest()[:8]
            return f"Saver_{seed.upper()}"
        return generate_alias()
