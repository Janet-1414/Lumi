"""
tests/unit/test_security.py

Unit tests for app/utils/security.py
"""

from datetime import UTC, datetime, timedelta

import pytest
from jose import jwt

from app.config import get_settings
from app.utils.security import (
    create_access_token,
    decode_token,
    generate_otp,
    hash_password,
    is_otp_valid,
    otp_expiry,
    verify_password,
)

settings = get_settings()


class TestPasswordHashing:
    def test_hash_is_not_plaintext(self) -> None:
        hashed = hash_password("MySecret@123")
        assert hashed != "MySecret@123"

    def test_verify_correct_password(self) -> None:
        hashed = hash_password("MySecret@123")
        assert verify_password("MySecret@123", hashed) is True

    def test_verify_wrong_password(self) -> None:
        hashed = hash_password("MySecret@123")
        assert verify_password("WrongPass", hashed) is False


class TestJwt:
    def test_token_contains_subject(self) -> None:
        token = create_access_token("user-uuid-123")
        payload = decode_token(token)
        assert payload["sub"] == "user-uuid-123"

    def test_token_has_expiry(self) -> None:
        token = create_access_token("user-uuid-123")
        payload = decode_token(token)
        assert "exp" in payload

    def test_custom_expiry_applied(self) -> None:
        delta = timedelta(hours=2)
        token = create_access_token("user-uuid-123", expires_delta=delta)
        payload = decode_token(token)
        exp = datetime.fromtimestamp(payload["exp"], tz=UTC)
        now = datetime.now(UTC)
        assert (exp - now).seconds > 7000  # ~2 hours

    def test_expired_token_raises(self) -> None:
        from jose import JWTError
        token = create_access_token("user", expires_delta=timedelta(seconds=-1))
        with pytest.raises(JWTError):
            decode_token(token)


class TestOtp:
    def test_otp_is_6_digits(self) -> None:
        otp = generate_otp()
        assert len(otp) == 6
        assert otp.isdigit()

    def test_valid_otp_passes(self) -> None:
        otp = "123456"
        expires = otp_expiry()
        assert is_otp_valid(otp, "123456", expires) is True

    def test_wrong_otp_fails(self) -> None:
        expires = otp_expiry()
        assert is_otp_valid("123456", "000000", expires) is False

    def test_expired_otp_fails(self) -> None:
        expired = datetime.now(UTC) - timedelta(minutes=1)
        assert is_otp_valid("123456", "123456", expired) is False
