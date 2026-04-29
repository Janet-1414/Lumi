"""
app/exceptions/auth.py

Authentication-specific exceptions.
Kept separate from base.py for clarity.
Import these in routers and services instead of base.py directly.
"""

from fastapi import status
from app.exceptions.base import LumiBaseException


class AuthException(LumiBaseException):
    status_code = status.HTTP_401_UNAUTHORIZED
    detail      = "Authentication failed"


class InvalidCredentialsException(AuthException):
    detail = "Invalid email or password"


class TokenExpiredException(AuthException):
    detail = "Your session has expired. Please sign in again."


class TokenInvalidException(AuthException):
    detail = "Invalid or missing token"


class EmailNotVerifiedException(AuthException):
    status_code = status.HTTP_403_FORBIDDEN
    detail      = "Please verify your email before signing in"


class AccountDisabledException(AuthException):
    status_code = status.HTTP_403_FORBIDDEN
    detail      = "This account has been disabled"


class EmailAlreadyExistsException(LumiBaseException):
    status_code = status.HTTP_409_CONFLICT
    detail      = "An account with this email already exists"


class UserNotFoundException(LumiBaseException):
    status_code = status.HTTP_404_NOT_FOUND
    detail      = "User not found"


class InvalidOtpException(LumiBaseException):
    status_code = status.HTTP_400_BAD_REQUEST
    detail      = "Invalid or expired code. Please request a new one."


class OtpExpiredException(LumiBaseException):
    status_code = status.HTTP_400_BAD_REQUEST
    detail      = "This code has expired. Please request a new one."
