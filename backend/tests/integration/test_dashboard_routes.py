"""
tests/integration/test_dashboard_routes.py
"""

import pytest
from httpx import AsyncClient

from app.main import app


@pytest.fixture
async def client() -> AsyncClient:
    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c


class TestDashboardRoute:
    async def test_dashboard_requires_auth(self, client: AsyncClient) -> None:
        """Unauthenticated request must return 401."""
        response = await client.get("/api/v1/dashboard")
        assert response.status_code == 401

    async def test_dashboard_returns_correct_shape(
        self, client: AsyncClient
    ) -> None:
        """
        With a valid auth cookie the response must include
        stats, recent_transactions, spending_by_category and ai_insight.
        """
        # This test needs a real auth cookie from a test user.
        # Skipped here — covered in e2e tests with Playwright.
        pytest.skip("Requires authenticated session — covered in e2e/dashboard.spec.ts")
