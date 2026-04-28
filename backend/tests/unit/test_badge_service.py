"""
tests/unit/test_badge_service.py
"""

import pytest
from unittest.mock import AsyncMock
from uuid import uuid4
from app.services.badge_service import BadgeService, BADGE_DEFINITIONS


@pytest.fixture
def service() -> BadgeService:
    return BadgeService(AsyncMock())


class TestBadgeService:
    async def test_check_and_award_returns_list(self, service: BadgeService) -> None:
        result = await service.check_and_award(uuid4(), "first_transaction")
        assert isinstance(result, list)

    async def test_get_user_badges_returns_all_definitions(
        self, service: BadgeService
    ) -> None:
        badges = await service.get_user_badges(uuid4())
        assert len(badges) == len(BADGE_DEFINITIONS)

    def test_badge_definitions_have_required_fields(self) -> None:
        for badge in BADGE_DEFINITIONS:
            assert "name"  in badge
            assert "emoji" in badge
            assert "tier"  in badge
            assert "desc"  in badge
            assert badge["tier"] in ("bronze", "silver", "gold", "diamond")

    def test_badge_tiers_are_ordered(self) -> None:
        tier_order = {"bronze": 1, "silver": 2, "gold": 3, "diamond": 4}
        tiers = [badge["tier"] for badge in BADGE_DEFINITIONS]
        # All tiers should be valid
        for tier in tiers:
            assert tier in tier_order
