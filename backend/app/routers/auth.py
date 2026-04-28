"""
app/routers/auth.py

Auth router — thin layer between HTTP and AuthService.
Routers only: validate input, call service, return response.
No business logic here.
"""

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    ResendVerificationRequest,
    ResetPasswordRequest,
    UserResponse,
    VerifyEmailRequest,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _service(db: AsyncSession = Depends(get_db)) -> AuthService:
    """Dependency that provides a fresh AuthService per request."""
    return AuthService(db)


# ── Register ──────────────────────────────────────────────────────────────────

@router.post(
    "/register",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new Lumi account",
)
async def register(
    payload: RegisterRequest,
    service: AuthService = Depends(_service),
) -> MessageResponse:
    """
    Register a new user. Sends a 6-digit OTP to their email.
    The account is inactive until the email is verified.
    """
    return await service.register(payload)


# ── Verify Email ──────────────────────────────────────────────────────────────

@router.post(
    "/verify-email",
    response_model=MessageResponse,
    summary="Verify email with OTP code",
)
async def verify_email(
    payload: VerifyEmailRequest,
    service: AuthService = Depends(_service),
) -> MessageResponse:
    return await service.verify_email(payload)


# ── Resend Verification ───────────────────────────────────────────────────────

@router.post(
    "/resend-verification",
    response_model=MessageResponse,
    summary="Resend email verification OTP",
)
async def resend_verification(
    payload: ResendVerificationRequest,
    service: AuthService = Depends(_service),
) -> MessageResponse:
    return await service.resend_verification(payload.email)


# ── Login ─────────────────────────────────────────────────────────────────────

@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Sign in and receive JWT cookie",
)
async def login(
    payload: LoginRequest,
    response: Response,
    service: AuthService = Depends(_service),
) -> AuthResponse:
    """
    Authenticate user. On success, sets an HTTP-only JWT cookie.
    The token is NEVER returned in the response body.
    """
    return await service.login(payload, response)


# ── Forgot Password ───────────────────────────────────────────────────────────

@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    summary="Request password reset OTP",
)
async def forgot_password(
    payload: ForgotPasswordRequest,
    service: AuthService = Depends(_service),
) -> MessageResponse:
    """
    Send a password reset code to the user's email.
    Always returns the same message to prevent email enumeration.
    """
    return await service.forgot_password(payload)


# ── Reset Password ────────────────────────────────────────────────────────────

@router.post(
    "/reset-password",
    response_model=MessageResponse,
    summary="Reset password using OTP code",
)
async def reset_password(
    payload: ResetPasswordRequest,
    service: AuthService = Depends(_service),
) -> MessageResponse:
    return await service.reset_password(payload)


# ── Logout ────────────────────────────────────────────────────────────────────

@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Sign out and clear cookie",
)
async def logout(
    response: Response,
    service: AuthService = Depends(_service),
) -> MessageResponse:
    return service.logout(response)


# ── Get current user ──────────────────────────────────────────────────────────

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get authenticated user profile",
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    return UserResponse.model_validate(current_user)
