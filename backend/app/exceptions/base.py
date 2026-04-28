"""
app/exceptions/base.py

Custom exception hierarchy for Lumi.
All exceptions inherit from LumiBaseException so they can be caught globally
and returned as consistent JSON responses.
"""

from fastapi import HTTPException, status


class LumiBaseException(HTTPException):
    """Root exception for all Lumi-specific errors."""
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    detail: str = "An unexpected error occurred"

    def __init__(self, detail: str | None = None) -> None:
        super().__init__(
            status_code=self.__class__.status_code,
            detail=detail or self.__class__.detail,
        )


# ── Auth Exceptions ───────────────────────────────────────────────────────────

class AuthException(LumiBaseException):
    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Authentication failed"


class InvalidCredentialsException(AuthException):
    detail = "Invalid email or password"


class TokenExpiredException(AuthException):
    detail = "Your session has expired. Please sign in again."


class TokenInvalidException(AuthException):
    detail = "Invalid token"


class EmailNotVerifiedException(AuthException):
    status_code = status.HTTP_403_FORBIDDEN
    detail = "Please verify your email before signing in"


class AccountDisabledException(AuthException):
    status_code = status.HTTP_403_FORBIDDEN
    detail = "This account has been disabled"


# ── OTP Exceptions ────────────────────────────────────────────────────────────

class InvalidOtpException(LumiBaseException):
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Invalid or expired code. Please request a new one."


class OtpExpiredException(LumiBaseException):
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "This code has expired. Please request a new one."


# ── User Exceptions ───────────────────────────────────────────────────────────

class UserNotFoundException(LumiBaseException):
    status_code = status.HTTP_404_NOT_FOUND
    detail = "User not found"


class EmailAlreadyExistsException(LumiBaseException):
    status_code = status.HTTP_409_CONFLICT
    detail = "An account with this email already exists"


# ── AI Exceptions ─────────────────────────────────────────────────────────────

class ScannerException(LumiBaseException):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    detail = "Could not parse the provided message or receipt"


class ChatException(LumiBaseException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    detail = "AI chat is temporarily unavailable"
