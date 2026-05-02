"""
app/utils/security.py

All cryptographic helpers live here.
No business logic — pure functions only.
"""

import random
import string
from datetime import UTC, datetime, timedelta

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import get_settings

settings = get_settings()

# ── Password hashing ──────────────────────────────────────────────────────────

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    """Hash a plaintext password with bcrypt."""
    return _pwd_context.hash(plain[:72])


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    return _pwd_context.verify(plain, hashed)


# ── JWT ───────────────────────────────────────────────────────────────────────

def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    """
    Create a signed JWT access token.

    Args:
        subject:      Typically the user's UUID as a string.
        expires_delta: Override the default expiry from settings.
    """
    expire = datetime.now(UTC) + (
        expires_delta
        or timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {"sub": subject, "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(subject: str) -> str:
    """Create a longer-lived refresh token."""
    expire = datetime.now(UTC) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"sub": subject, "exp": expire, "type": "refresh"}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """
    Decode and verify a JWT token.

    Raises:
        JWTError: If the token is invalid or expired.
    """
    return jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )


# ── OTP ───────────────────────────────────────────────────────────────────────

def generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP of the specified length."""
    return "".join(random.choices(string.digits, k=length))


def otp_expiry() -> datetime:
    """Return the OTP expiry datetime (now + OTP_EXPIRE_MINUTES)."""
    return datetime.now(UTC) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)


def is_otp_valid(stored_otp: str, input_otp: str, expires_at: datetime) -> bool:
    """
    Check that:
    1. The OTP matches (constant-time comparison via hmac would be ideal in production).
    2. The OTP has not expired.
    """
    not_expired = datetime.now(UTC) < expires_at.replace(tzinfo=UTC)
    matches = stored_otp == input_otp.strip()
    return matches and not_expired
