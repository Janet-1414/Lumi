"""
tests/integration/test_chat_routes.py
"""

import pytest
from httpx import AsyncClient
from app.main import app

BASE = "/api/v1/chat"


@pytest.fixture
async def client() -> AsyncClient:
    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c


class TestChatRoutes:
    async def test_session_requires_auth(self, client: AsyncClient) -> None:
        res = await client.get(f"{BASE}/session")
        assert res.status_code == 401

    async def test_message_requires_auth(self, client: AsyncClient) -> None:
        res = await client.post(f"{BASE}/message", json={"message": "Hello Lumi"})
        assert res.status_code == 401

    async def test_stream_requires_auth(self, client: AsyncClient) -> None:
        res = await client.post(f"{BASE}/stream", json={"message": "What is my balance?"})
        assert res.status_code == 401

    async def test_prompts_requires_auth(self, client: AsyncClient) -> None:
        res = await client.get(f"{BASE}/prompts")
        assert res.status_code == 401

    async def test_message_rejects_empty_string(self, client: AsyncClient) -> None:
        res = await client.post(f"{BASE}/message", json={"message": ""})
        assert res.status_code in (401, 422)

    async def test_message_rejects_missing_field(self, client: AsyncClient) -> None:
        res = await client.post(f"{BASE}/message", json={})
        assert res.status_code in (401, 422)
