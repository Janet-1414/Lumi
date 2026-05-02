"""
app/schemas/auth.py

Pydantic v2 schemas for all auth request/response shapes.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.utils.enums import MoneyPersonality


# ── Shared validators ─────────────────────────────────────────────────────────

def _validate_password(v: str) -> str:
    """Enforce Lumi password rules: 8+ chars, upper, lower, digit, symbol."""
    errors = []
    if len(v) < 8:
        errors.append("at least 8 characters")
    if not any(c.isupper() for c in v):
        errors.append("an uppercase letter")
    if not any(c.isdigit() for c in v):
        errors.append("a number")
    if not any(not c.isalnum() for c in v):
        errors.append("a symbol")
    if errors:
        raise ValueError(f"Password must contain: {', '.join(errors)}")
    return v


# ── Register ──────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    first_name: str         = Field(..., min_length=2, max_length=100)
    last_name:  str         = Field(..., min_length=2, max_length=100)
    email:      EmailStr
    phone:      str | None  = Field(None, max_length=30)
    password:   str         = Field(..., min_length=8)

    @field_validator("password")
    @classmethod
    def strong_password(cls, v: str) -> str:
        return _validate_password(v)

    @field_validator("email")
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("first_name", "last_name")
    @classmethod
    def strip_name(cls, v: str) -> str:
        return v.strip()


# ── Login ─────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email:       EmailStr
    password:    str
    remember_me: bool = False

    @field_validator("email")
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.strip().lower()


# ── OTP ───────────────────────────────────────────────────────────────────────

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code:  str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.strip().lower()


class ResetPasswordRequest(BaseModel):
    email:        EmailStr
    code:         str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")
    new_password: str

    @field_validator("new_password")
    @classmethod
    def strong_password(cls, v: str) -> str:
        return _validate_password(v)


# ── User response ─────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    id:                uuid.UUID
    first_name:        str
    last_name:         str
    email:             str
    phone:             str | None
    is_verified:       bool
    money_personality: MoneyPersonality | None
    created_at:        datetime

    model_config = {"from_attributes": True}


# ── Auth response ─────────────────────────────────────────────────────────────

class AuthResponse(BaseModel):
    user:    UserResponse
    message:      str
    access_token: str | None = None


class MessageResponse(BaseModel):
    message: str
    success: bool = True
