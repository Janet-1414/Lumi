"""
tests/unit/test_dashboard_service.py
"""

from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest

from app.services.dashboard_service import DashboardService, _pct_change


class TestPctChange:
    def test_positive_change(self) -> None:
        assert _pct_change(120, 100) == 20.0

    def test_negative_change(self) -> None:
        assert _pct_change(80, 100) == -20.0

    def test_zero_previous(self) -> None:
        assert _pct_change(100, 0) == 0.0

    def test_no_change(self) -> None:
        assert _pct_change(100, 100) == 0.0


class TestDashboardService:
    @pytest.fixture
    def service(self) -> DashboardService:
        return DashboardService(AsyncMock())

    async def test_get_dashboard_returns_response(
        self, service: DashboardService
    ) -> None:
        user_id = uuid4()

        with (
            patch.object(service._tx_repo, "sum_by_type",    return_value=1_800_000.0),
            patch.object(service._tx_repo, "get_recent",     return_value=[]),
            patch.object(service._tx_repo, "spending_by_category", return_value=[]),
        ):
            result = await service.get_dashboard(user_id)

        assert result.stats.monthly_income   == 1_800_000.0
        assert result.stats.monthly_expenses == 1_800_000.0
        assert result.ai_insight.type        == "tip"
        assert isinstance(result.spending_by_category, list)

    async def test_savings_rate_calculation(
        self, service: DashboardService
    ) -> None:
        user_id = uuid4()

        side_effects = [
            1_800_000.0,   # current income
            1_200_000.0,   # current expenses
            1_700_000.0,   # prev income
            1_300_000.0,   # prev expenses
        ]

        with (
            patch.object(
                service._tx_repo, "sum_by_type", side_effect=side_effects
            ),
            patch.object(service._tx_repo, "get_recent", return_value=[]),
            patch.object(service._tx_repo, "spending_by_category", return_value=[]),
        ):
            result = await service.get_dashboard(user_id)

        # (1_800_000 - 1_200_000) / 1_800_000 * 100 = 33.3%
        assert result.stats.savings_rate == pytest.approx(33.3, abs=0.1)

    async def test_spending_categories_have_percentages(
        self, service: DashboardService
    ) -> None:
        from app.utils.enums import TransactionCategory

        user_id = uuid4()
        raw = [
            {"category": TransactionCategory.FOOD,      "amount": 300_000},
            {"category": TransactionCategory.TRANSPORT, "amount": 100_000},
        ]

        with (
            patch.object(service._tx_repo, "sum_by_type",          return_value=0),
            patch.object(service._tx_repo, "get_recent",            return_value=[]),
            patch.object(service._tx_repo, "spending_by_category",  return_value=raw),
        ):
            result = await service.get_dashboard(user_id)

        assert len(result.spending_by_category) == 2
        food = next(c for c in result.spending_by_category if c.category == TransactionCategory.FOOD)
        assert food.percentage == pytest.approx(75.0, abs=0.1)
