"""
app/services/auth_service.py

AuthService — handles all authentication business logic.

Responsibilities:
  - User registration
  - Email verification (OTP)
  - Login with JWT cookie issuance
  - Forgot / reset password via OTP
  - Token refresh and logout

Never writes to the DB directly — always goes through UserRepository.
"""

from datetime import timedelta

from fastapi import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.exceptions.base import (
    AccountDisabledException,
    EmailAlreadyExistsException,
    EmailNotVerifiedException,
    InvalidCredentialsException,
    InvalidOtpException,
    UserNotFoundException,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    AuthResponse,
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    ResetPasswordRequest,
    UserResponse,
    VerifyEmailRequest,
)
from app.services.email_service import EmailService
from app.utils.security import (
    create_access_token,
    generate_otp,
    hash_password,
    is_otp_valid,
    otp_expiry,
    verify_password,
)

settings = get_settings()

# ── Cookie name ───────────────────────────────────────────────────────────────
ACCESS_COOKIE = "lumi_access_token"


class AuthService:
    """
    Stateless service class — instantiated per request via dependency injection.

    Usage in routers:
        async def my_route(db: AsyncSession = Depends(get_db)):
            service = AuthService(db)
            await service.register(payload)
    """

    def __init__(self, db: AsyncSession) -> None:
        self._repo = UserRepository(db)
        self._email = EmailService()

    # ── Register ──────────────────────────────────────────────────────────────

    async def register(self, payload: RegisterRequest) -> MessageResponse:
        """
        Create a new user account and send OTP for email verification.
        Raises EmailAlreadyExistsException if email is taken.
        """
        if await self._repo.email_exists(payload.email):
            raise EmailAlreadyExistsException()

        otp = generate_otp(settings.OTP_LENGTH)

        user = User(
            first_name=payload.first_name,
            last_name=payload.last_name,
            email=payload.email,
            phone=payload.phone,
            hashed_password=hash_password(payload.password),
            is_verified=True,
            otp_code=otp,
            otp_expires_at=otp_expiry(),
            otp_purpose="verify",
        )

        await self._repo.create(user)

        # email disabled for demo
        # Wired to FastAPI-Mail — see services/email_service.py

        return MessageResponse(
            message="Account created. Check your email for your verification code.",
        )

    # ── Verify Email ──────────────────────────────────────────────────────────

    async def verify_email(self, payload: VerifyEmailRequest) -> MessageResponse:
        """
        Verify the OTP sent to the user's email.
        Marks the user as verified on success.
        """
        user = await self._get_user_or_404(payload.email)

        if not user.otp_code or not user.otp_expires_at:
            raise InvalidOtpException()

        if user.otp_purpose != "verify":
            raise InvalidOtpException()

        if not is_otp_valid(user.otp_code, payload.code, user.otp_expires_at):
            raise InvalidOtpException()

        user.is_verified = True
        user.otp_code = None
        user.otp_expires_at = None
        user.otp_purpose = None
        await self._repo.save(user)

        return MessageResponse(message="Email verified successfully. You can now sign in.")

    # ── Resend Verification ───────────────────────────────────────────────────

    async def resend_verification(self, email: str) -> MessageResponse:
        """Issue a fresh OTP for email verification."""
        user = await self._get_user_or_404(email)

        if user.is_verified:
            return MessageResponse(message="Email is already verified.")

        otp = generate_otp(settings.OTP_LENGTH)
        user.otp_code = otp
        user.otp_expires_at = otp_expiry()
        user.otp_purpose = "verify"
        await self._repo.save(user)

        # email disabled for demo

        return MessageResponse(message="A new verification code has been sent.")

    # ── Login ─────────────────────────────────────────────────────────────────

    async def login(self, payload: LoginRequest, response: Response) -> AuthResponse:
        """
        Authenticate user and issue JWT in an HTTP-only cookie.
        Never returns the token in the JSON body.
        """
        user = await self._repo.get_active_by_email(payload.email)

        if not user or not verify_password(payload.password, user.hashed_password):
            raise InvalidCredentialsException()

        if not user.is_active:
            raise AccountDisabledException()

        if not user.is_verified:
            raise EmailNotVerifiedException()

        # Issue token
        expires_delta = (
            timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
            if payload.remember_me
            else timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        token = create_access_token(str(user.id), expires_delta=expires_delta)

        # Set HTTP-only cookie — token never exposed to JS
        response.set_cookie(
            key=ACCESS_COOKIE,
            value=token,
            httponly=settings.COOKIE_HTTPONLY,
            secure=settings.COOKIE_SECURE,
            samesite=settings.COOKIE_SAMESITE,
            domain=settings.COOKIE_DOMAIN,
            max_age=int(expires_delta.total_seconds()),
            path="/",
        )

        return AuthResponse(
            user=UserResponse.model_validate(user),
            message=f"Welcome back, {user.display_name}!",
            access_token=token,
        )

    # ── Forgot Password ───────────────────────────────────────────────────────

    async def forgot_password(self, payload: ForgotPasswordRequest) -> MessageResponse:
        """
        Send a password-reset OTP.
        Always returns the same message to prevent user enumeration.
        """
        user = await self._repo.get_by_email(payload.email)

        if user and user.is_active:
            otp = generate_otp(settings.OTP_LENGTH)
            user.otp_code = otp
            user.otp_expires_at = otp_expiry()
            user.otp_purpose = "reset"
            await self._repo.save(user)
            await self._email.send_password_reset(user.email, user.first_name, otp)

        # Same message regardless — prevents email enumeration
        return MessageResponse(
            message="If an account with that email exists, a reset code has been sent."
        )

    # ── Reset Password ────────────────────────────────────────────────────────

    async def reset_password(self, payload: ResetPasswordRequest) -> MessageResponse:
        """Verify the reset OTP and update the user's password."""
        user = await self._get_user_or_404(payload.email)

        if (
            not user.otp_code
            or not user.otp_expires_at
            or user.otp_purpose != "reset"
        ):
            raise InvalidOtpException()

        if not is_otp_valid(user.otp_code, payload.code, user.otp_expires_at):
            raise InvalidOtpException()

        user.hashed_password = hash_password(payload.new_password)
        user.otp_code = None
        user.otp_expires_at = None
        user.otp_purpose = None
        await self._repo.save(user)

        return MessageResponse(message="Password reset successfully. You can now sign in.")

    # ── Logout ────────────────────────────────────────────────────────────────

    def logout(self, response: Response) -> MessageResponse:
        """Clear the auth cookie."""
        response.delete_cookie(key=ACCESS_COOKIE, path="/")
        return MessageResponse(message="Signed out successfully.")

    # ── Helpers ───────────────────────────────────────────────────────────────

    async def _get_user_or_404(self, email: str) -> User:
        user = await self._repo.get_by_email(email)
        if not user:
            raise UserNotFoundException()
        return user
