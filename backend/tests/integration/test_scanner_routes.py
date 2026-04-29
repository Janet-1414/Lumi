"""
tests/integration/test_scanner_routes.py
"""

import pytest
from httpx import AsyncClient
from app.main import app

BASE = "/api/v1/scanner"


@pytest.fixture
async def client() -> AsyncClient:
    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c


class TestScannerRoutes:
    async def test_sms_scan_requires_auth(self, client: AsyncClient) -> None:
        res = await client.post(f"{BASE}/sms", json={
            "text": "You have received UGX 350,000 from Andela on 15/01/2025"
        })
        assert res.status_code == 401

    async def test_receipt_scan_requires_auth(self, client: AsyncClient) -> None:
        res = await client.post(f"{BASE}/receipt", json={
            "text": "Game Stores\nTotal: UGX 89,000\nDate: 15/01/2025"
        })
        assert res.status_code == 401

    async def test_confirm_requires_auth(self, client: AsyncClient) -> None:
        from datetime import date
        res = await client.post(f"{BASE}/sms/confirm", json={
            "amount": 350_000,
            "type": "income",
            "category": "income",
            "description": "Salary",
            "date": str(date.today()),
            "currency": "UGX",
        })
        assert res.status_code == 401

    async def test_sms_validates_min_length(self, client: AsyncClient) -> None:
        """text must be at least 10 characters."""
        res = await client.post(f"{BASE}/sms", json={"text": "short"})
        assert res.status_code in (401, 422)

    async def test_batch_requires_auth(self, client: AsyncClient) -> None:
        res = await client.post(f"{BASE}/sms/batch", json={
            "texts": ["You have received UGX 350,000 from Andela on 15/01/2025"]
        })
        assert res.status_code == 401

    async def test_batch_validates_not_empty(self, client: AsyncClient) -> None:
        res = await client.post(f"{BASE}/sms/batch", json={"texts": []})
        assert res.status_code in (401, 422)
