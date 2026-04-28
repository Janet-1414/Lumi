"""
tests/unit/test_savings_service.py
"""

from datetime import date
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from app.schemas.savings import DepositRequest, SavingsGoalCreate
from app.services.savings_service import SavingsService


@pytest.fixture
def service() -> SavingsService:
    return SavingsService(AsyncMock())


def _mock_goal(
    current: float = 0,
    target: float = 1_000_000,
    completed: bool = False,
):
    g = MagicMock()
    g.id             = uuid4()
    g.name           = "Test Goal"
    g.target_amount  = target
    g.current_amount = current
    g.currency       = "UGX"
    g.deadline       = None
    g.emoji          = "🎯"
    g.is_completed   = completed
    g.is_archived    = False
    g.progress_pct   = round(current / target * 100, 1) if target > 0 else 0
    g.remaining      = max(target - current, 0)
    g.created_at     = date.today()
    return g


class TestSavingsService:

    async def test_list_goals_sums_totals(self, service: SavingsService) -> None:
        goals = [_mock_goal(300_000, 1_000_000), _mock_goal(700_000, 2_000_000)]
        service._repo.get_all_for_user = AsyncMock(return_value=goals)

        result = await service.list_goals(uuid4())

        assert result.total_saved    == 1_000_000
        assert result.total_targeted == 3_000_000
        assert len(result.goals)     == 2

    async def test_deposit_adds_to_current_amount(
        self, service: SavingsService
    ) -> None:
        goal = _mock_goal(current=500_000, target=1_000_000)
        service._repo.get_for_user = AsyncMock(return_value=goal)
        service._repo.update       = AsyncMock(return_value=goal)

        await service.deposit(goal.id, uuid4(), DepositRequest(amount=200_000))

        assert goal.current_amount == 700_000

    async def test_deposit_marks_completed_when_target_reached(
        self, service: SavingsService
    ) -> None:
        goal = _mock_goal(current=900_000, target=1_000_000)
        service._repo.get_for_user = AsyncMock(return_value=goal)
        service._repo.update       = AsyncMock(return_value=goal)

        await service.deposit(goal.id, uuid4(), DepositRequest(amount=100_000))

        assert goal.is_completed is True

    async def test_get_ai_challenge_returns_challenge(
        self, service: SavingsService
    ) -> None:
        service._repo.total_saved = AsyncMock(return_value=200_000)
        result = await service.get_ai_challenge(uuid4())

        assert result.target_save > 0
        assert len(result.title) > 0
        assert len(result.duration) > 0
