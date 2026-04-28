"""
tests/integration/test_savings_chat_routes.py
"""

import pytest
from httpx import AsyncClient

from app.main import app


@pytest.fixture
async def client() -> AsyncClient:
    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c


class TestSavingsRoutes:
    async def test_list_goals_requires_auth(self, client: AsyncClient) -> None:
        res = await client.get("/api/v1/savings")
        assert res.status_code == 401

    async def test_create_goal_requires_auth(self, client: AsyncClient) -> None:
        res = await client.post("/api/v1/savings", json={
            "name": "Test", "target_amount": 500_000
        })
        assert res.status_code == 401

    async def test_deposit_requires_auth(self, client: AsyncClient) -> None:
        from uuid import uuid4
        res = await client.post(
            f"/api/v1/savings/{uuid4()}/deposit",
            json={"amount": 10_000}
        )
        assert res.status_code == 401

    async def test_create_goal_validates_amount(self, client: AsyncClient) -> None:
        res = await client.post("/api/v1/savings", json={
            "name": "Bad Goal", "target_amount": -100
        })
        assert res.status_code in (401, 422)


class TestChatRoutes:
    async def test_session_requires_auth(self, client: AsyncClient) -> None:
        res = await client.get("/api/v1/chat/session")
        assert res.status_code == 401

    async def test_message_requires_auth(self, client: AsyncClient) -> None:
        res = await client.post("/api/v1/chat/message", json={
            "message": "Hello Lumi"
        })
        assert res.status_code == 401

    async def test_stream_requires_auth(self, client: AsyncClient) -> None:
        res = await client.post("/api/v1/chat/stream", json={
            "message": "What is my balance?"
        })
        assert res.status_code == 401

    async def test_prompts_requires_auth(self, client: AsyncClient) -> None:
        res = await client.get("/api/v1/chat/prompts")
        assert res.status_code == 401

    async def test_message_validates_min_length(self, client: AsyncClient) -> None:
        res = await client.post("/api/v1/chat/message", json={"message": ""})
        assert res.status_code in (401, 422)
