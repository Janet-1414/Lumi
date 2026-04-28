"""
tests/unit/test_auth_service.py

Unit tests for AuthService.
All DB calls are mocked — tests run without a real database.
"""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest

from app.exceptions.base import (
    EmailAlreadyExistsException,
    EmailNotVerifiedException,
    InvalidCredentialsException,
    InvalidOtpException,
)
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
)
from app.services.auth_service import AuthService
from app.utils.security import hash_password, otp_expiry


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def mock_db() -> AsyncMock:
    return AsyncMock()


@pytest.fixture
def service(mock_db: AsyncMock) -> AuthService:
    return AuthService(mock_db)


@pytest.fixture
def verified_user() -> User:
    return User(
        id=uuid4(),
        first_name="Akosua",
        last_name="Mensah",
        email="akosua@example.com",
        hashed_password=hash_password("Str0ng@Pass!"),
        is_verified=True,
        is_active=True,
    )


@pytest.fixture
def unverified_user() -> User:
    return User(
        id=uuid4(),
        first_name="Tunde",
        last_name="Bello",
        email="tunde@example.com",
        hashed_password=hash_password("Str0ng@Pass!"),
        is_verified=False,
        is_active=True,
        otp_code="123456",
        otp_expires_at=otp_expiry(),
        otp_purpose="verify",
    )


# ── Register ──────────────────────────────────────────────────────────────────

class TestRegister:
    async def test_register_new_user_succeeds(
        self, service: AuthService
    ) -> None:
        with (
            patch.object(service._repo, "email_exists", return_value=False),
            patch.object(service._repo, "create", return_value=AsyncMock()),
        ):
            result = await service.register(
                RegisterRequest(
                    first_name="Akosua",
                    last_name="Mensah",
                    email="akosua@example.com",
                    password="Str0ng@Pass!",
                )
            )
        assert result.success is True
        assert "verification code" in result.message.lower()

    async def test_register_duplicate_email_raises(
        self, service: AuthService
    ) -> None:
        with patch.object(service._repo, "email_exists", return_value=True):
            with pytest.raises(EmailAlreadyExistsException):
                await service.register(
                    RegisterRequest(
                        first_name="Zara",
                        last_name="Ali",
                        email="akosua@example.com",
                        password="Str0ng@Pass!",
                    )
                )


# ── Verify Email ──────────────────────────────────────────────────────────────

class TestVerifyEmail:
    async def test_valid_otp_verifies_user(
        self, service: AuthService, unverified_user: User
    ) -> None:
        with (
            patch.object(service._repo, "get_by_email", return_value=unverified_user),
            patch.object(service._repo, "save", return_value=unverified_user),
        ):
            result = await service.verify_email(
                VerifyEmailRequest(email="tunde@example.com", code="123456")
            )
        assert result.success is True
        assert unverified_user.is_verified is True
        assert unverified_user.otp_code is None

    async def test_wrong_otp_raises(
        self, service: AuthService, unverified_user: User
    ) -> None:
        with patch.object(service._repo, "get_by_email", return_value=unverified_user):
            with pytest.raises(InvalidOtpException):
                await service.verify_email(
                    VerifyEmailRequest(email="tunde@example.com", code="000000")
                )

    async def test_expired_otp_raises(
        self, service: AuthService, unverified_user: User
    ) -> None:
        unverified_user.otp_expires_at = datetime.now(UTC) - timedelta(minutes=1)
        with patch.object(service._repo, "get_by_email", return_value=unverified_user):
            with pytest.raises(InvalidOtpException):
                await service.verify_email(
                    VerifyEmailRequest(email="tunde@example.com", code="123456")
                )


# ── Login ─────────────────────────────────────────────────────────────────────

class TestLogin:
    async def test_valid_credentials_returns_auth_response(
        self, service: AuthService, verified_user: User
    ) -> None:
        mock_response = MagicMock()
        with patch.object(
            service._repo, "get_active_by_email", return_value=verified_user
        ):
            result = await service.login(
                LoginRequest(email="akosua@example.com", password="Str0ng@Pass!"),
                mock_response,
            )
        assert result.user.email == "akosua@example.com"
        mock_response.set_cookie.assert_called_once()

    async def test_wrong_password_raises(
        self, service: AuthService, verified_user: User
    ) -> None:
        mock_response = MagicMock()
        with patch.object(
            service._repo, "get_active_by_email", return_value=verified_user
        ):
            with pytest.raises(InvalidCredentialsException):
                await service.login(
                    LoginRequest(email="akosua@example.com", password="wrongpassword"),
                    mock_response,
                )

    async def test_unverified_user_raises(
        self, service: AuthService, unverified_user: User
    ) -> None:
        mock_response = MagicMock()
        with patch.object(
            service._repo, "get_active_by_email", return_value=unverified_user
        ):
            with pytest.raises(EmailNotVerifiedException):
                await service.login(
                    LoginRequest(email="tunde@example.com", password="Str0ng@Pass!"),
                    mock_response,
                )

    async def test_nonexistent_user_raises(self, service: AuthService) -> None:
        mock_response = MagicMock()
        with patch.object(service._repo, "get_active_by_email", return_value=None):
            with pytest.raises(InvalidCredentialsException):
                await service.login(
                    LoginRequest(email="ghost@example.com", password="Str0ng@Pass!"),
                    mock_response,
                )


# ── Forgot / Reset Password ───────────────────────────────────────────────────

class TestPasswordReset:
    async def test_forgot_password_always_returns_same_message(
        self, service: AuthService
    ) -> None:
        """Prevent email enumeration — same response whether user exists or not."""
        with patch.object(service._repo, "get_by_email", return_value=None):
            result = await service.forgot_password(
                ForgotPasswordRequest(email="ghost@example.com")
            )
        assert result.success is True

    async def test_reset_with_valid_otp_updates_password(
        self, service: AuthService, verified_user: User
    ) -> None:
        verified_user.otp_code = "654321"
        verified_user.otp_expires_at = otp_expiry()
        verified_user.otp_purpose = "reset"

        with (
            patch.object(service._repo, "get_by_email", return_value=verified_user),
            patch.object(service._repo, "save", return_value=verified_user),
        ):
            result = await service.reset_password(
                ResetPasswordRequest(
                    email="akosua@example.com",
                    code="654321",
                    new_password="NewStr0ng@Pass!",
                )
            )
        assert result.success is True
        assert verified_user.otp_code is None
