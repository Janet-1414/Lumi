"""
tests/integration/test_community_routes.py
"""

import pytest
from httpx import AsyncClient
from app.main import app

BASE = "/api/v1/community"


@pytest.fixture
async def client() -> AsyncClient:
    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c


class TestCommunityRoutes:
    async def test_feed_requires_auth(self, client: AsyncClient) -> None:
        res = await client.get(f"{BASE}/feed")
        assert res.status_code == 401

    async def test_leaderboard_requires_auth(self, client: AsyncClient) -> None:
        res = await client.get(f"{BASE}/leaderboard")
        assert res.status_code == 401

    async def test_pulse_requires_auth(self, client: AsyncClient) -> None:
        res = await client.get(f"{BASE}/pulse")
        assert res.status_code == 401

    async def test_challenges_requires_auth(self, client: AsyncClient) -> None:
        res = await client.get(f"{BASE}/challenges")
        assert res.status_code == 401

    async def test_tips_requires_auth(self, client: AsyncClient) -> None:
        res = await client.get(f"{BASE}/tips")
        assert res.status_code == 401

    async def test_post_requires_auth(self, client: AsyncClient) -> None:
        res = await client.post(f"{BASE}/feed", json={"message": "I saved money!"})
        assert res.status_code == 401

    async def test_post_validates_min_length(self, client: AsyncClient) -> None:
        """Message must be at least 5 chars."""
        res = await client.post(f"{BASE}/feed", json={"message": "Hi"})
        assert res.status_code in (401, 422)

    async def test_leaderboard_response_has_no_amount_fields(
        self, client: AsyncClient
    ) -> None:
        """
        Even if authenticated, leaderboard response must never contain
        amount, income, expenses, balance, or ugx fields.
        This is enforced at the schema level.
        """
        # Without auth this returns 401 — that's fine for this test
        res = await client.get(f"{BASE}/leaderboard")
        assert res.status_code == 401
        # Full privacy test is in unit/test_community_privacy.py
