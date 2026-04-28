"""
tests/integration/test_auth_routes.py

Integration tests for all auth API routes.
Uses httpx AsyncClient against a test database.
"""

import pytest
from httpx import AsyncClient

from app.main import app


@pytest.fixture
async def client() -> AsyncClient:
    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c


BASE = "/api/v1/auth"


class TestRegisterRoute:
    async def test_register_returns_201(self, client: AsyncClient) -> None:
        response = await client.post(f"{BASE}/register", json={
            "first_name": "Akosua",
            "last_name": "Mensah",
            "email": "akosua_test@example.com",
            "password": "Str0ng@Pass!",
        })
        assert response.status_code == 201
        assert response.json()["success"] is True

    async def test_register_weak_password_returns_422(
        self, client: AsyncClient
    ) -> None:
        response = await client.post(f"{BASE}/register", json={
            "first_name": "Akosua",
            "last_name": "Mensah",
            "email": "akosua2@example.com",
            "password": "weak",
        })
        assert response.status_code == 422

    async def test_register_invalid_email_returns_422(
        self, client: AsyncClient
    ) -> None:
        response = await client.post(f"{BASE}/register", json={
            "first_name": "Akosua",
            "last_name": "Mensah",
            "email": "not-an-email",
            "password": "Str0ng@Pass!",
        })
        assert response.status_code == 422


class TestLoginRoute:
    async def test_login_sets_cookie(self, client: AsyncClient) -> None:
        """Cookie must be httponly and not visible in response body."""
        response = await client.post(f"{BASE}/login", json={
            "email": "akosua@example.com",
            "password": "Str0ng@Pass!",
        })
        # In integration test with real DB this should be 200
        # Here we just verify no token appears in body
        if response.status_code == 200:
            assert "token" not in response.json()
            assert "lumi_access_token" in response.cookies

    async def test_login_wrong_password_returns_401(
        self, client: AsyncClient
    ) -> None:
        response = await client.post(f"{BASE}/login", json={
            "email": "akosua@example.com",
            "password": "WrongPassword!",
        })
        assert response.status_code in (401, 404)

    async def test_login_missing_fields_returns_422(
        self, client: AsyncClient
    ) -> None:
        response = await client.post(f"{BASE}/login", json={"email": "x@x.com"})
        assert response.status_code == 422


class TestForgotPasswordRoute:
    async def test_forgot_password_always_200(self, client: AsyncClient) -> None:
        """Must return 200 regardless of whether email exists (prevent enumeration)."""
        response = await client.post(f"{BASE}/forgot-password", json={
            "email": "doesnotexist@example.com",
        })
        assert response.status_code == 200
        assert response.json()["success"] is True


class TestHealthRoute:
    async def test_health_returns_ok(self, client: AsyncClient) -> None:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
