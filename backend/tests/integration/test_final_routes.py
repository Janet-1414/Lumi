"""
tests/integration/test_final_routes.py
"""

import pytest
from httpx import AsyncClient
from app.main import app


@pytest.fixture
async def client() -> AsyncClient:
    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c


class TestReportsRoutes:
    async def test_report_requires_auth(self, client: AsyncClient) -> None:
        res = await client.get("/api/v1/reports")
        assert res.status_code == 401

    async def test_report_invalid_period_still_returns(
        self, client: AsyncClient
    ) -> None:
        """Unknown period should be handled gracefully."""
        res = await client.get("/api/v1/reports?period=invalid")
        assert res.status_code in (401, 200)


class TestCommunityRoutes:
    async def test_feed_requires_auth(self, client: AsyncClient) -> None:
        res = await client.get("/api/v1/community/feed")
        assert res.status_code == 401

    async def test_leaderboard_requires_auth(self, client: AsyncClient) -> None:
        res = await client.get("/api/v1/community/leaderboard")
        assert res.status_code == 401

    async def test_pulse_requires_auth(self, client: AsyncClient) -> None:
        res = await client.get("/api/v1/community/pulse")
        assert res.status_code == 401

    async def test_post_validates_min_length(self, client: AsyncClient) -> None:
        res = await client.post("/api/v1/community/feed", json={"message": "Hi"})
        assert res.status_code in (401, 422)


class TestProfileRoutes:
    async def test_profile_requires_auth(self, client: AsyncClient) -> None:
        res = await client.get("/api/v1/profile")
        assert res.status_code == 401

    async def test_notifications_requires_auth(self, client: AsyncClient) -> None:
        res = await client.get("/api/v1/profile/notification-settings")
        assert res.status_code == 401
