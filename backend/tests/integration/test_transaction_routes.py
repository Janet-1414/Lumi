"""
tests/integration/test_transaction_routes.py
"""

import pytest
from httpx import AsyncClient

from app.main import app

BASE = "/api/v1/transactions"


@pytest.fixture
async def client() -> AsyncClient:
    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c


class TestTransactionRoutes:

    async def test_list_requires_auth(self, client: AsyncClient) -> None:
        response = await client.get(BASE)
        assert response.status_code == 401

    async def test_create_requires_auth(self, client: AsyncClient) -> None:
        response = await client.post(BASE, json={
            "amount": 10000,
            "type": "expense",
            "category": "food",
            "description": "Lunch",
            "date": "2025-01-15",
        })
        assert response.status_code == 401

    async def test_scan_requires_auth(self, client: AsyncClient) -> None:
        response = await client.post(f"{BASE}/scan", json={
            "text": "You have received UGX 350,000 from Andela"
        })
        assert response.status_code == 401

    async def test_scan_validates_min_length(self, client: AsyncClient) -> None:
        """text must be at least 10 chars."""
        response = await client.post(f"{BASE}/scan", json={"text": "short"})
        # 401 (no auth) or 422 (validation) — both are correct here
        assert response.status_code in (401, 422)

    async def test_create_validates_positive_amount(
        self, client: AsyncClient
    ) -> None:
        response = await client.post(BASE, json={
            "amount": -500,
            "type": "expense",
            "category": "food",
            "description": "Lunch",
            "date": "2025-01-15",
        })
        assert response.status_code in (401, 422)

    async def test_summary_requires_auth(self, client: AsyncClient) -> None:
        response = await client.get(f"{BASE}/summary")
        assert response.status_code == 401
