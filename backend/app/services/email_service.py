"""
app/services/email_service.py

EmailService — handles all transactional emails via FastAPI-Mail.

Emails sent:
  - Email verification OTP (on signup)
  - Password reset OTP (on forgot password)
  - Spending alert (when budget is exceeded)
  - Weekly report (AI-generated summary)
"""

from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from pydantic import EmailStr

from app.config import get_settings

settings = get_settings()

# ── Mail connection config ─────────────────────────────────────────────────────

_mail_config = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)

_mailer = FastMail(_mail_config)


class EmailService:
    """Sends all transactional emails for Lumi."""

    # ── OTP: Email verification ───────────────────────────────────────────────

    async def send_verification(
        self, to: EmailStr, first_name: str, otp: str
    ) -> None:
        html = f"""
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #FAC775;">💡 Verify your Lumi account</h2>
          <p>Hi {first_name},</p>
          <p>Your verification code is:</p>
          <div style="font-size: 36px; font-weight: 700; letter-spacing: 12px;
                      color: #FAC775; padding: 16px; text-align: center;
                      background: #111827; border-radius: 8px; margin: 16px 0;">
            {otp}
          </div>
          <p style="color: #8899AA; font-size: 13px;">
            This code expires in 10 minutes. If you didn't sign up for Lumi, ignore this email.
          </p>
        </div>
        """
        await self._send(to, "Verify your Lumi account", html)

    # ── OTP: Password reset ───────────────────────────────────────────────────

    async def send_password_reset(
        self, to: EmailStr, first_name: str, otp: str
    ) -> None:
        html = f"""
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #FAC775;">💡 Reset your Lumi password</h2>
          <p>Hi {first_name},</p>
          <p>Your password reset code is:</p>
          <div style="font-size: 36px; font-weight: 700; letter-spacing: 12px;
                      color: #FAC775; padding: 16px; text-align: center;
                      background: #111827; border-radius: 8px; margin: 16px 0;">
            {otp}
          </div>
          <p style="color: #8899AA; font-size: 13px;">
            This code expires in 10 minutes. If you didn't request this, your account is safe.
          </p>
        </div>
        """
        await self._send(to, "Reset your Lumi password", html)

    # ── Spending alert ────────────────────────────────────────────────────────

    async def send_spending_alert(
        self, to: EmailStr, first_name: str, category: str, amount: float, budget: float
    ) -> None:
        pct = round(amount / budget * 100)
        html = f"""
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #D85A30;">⚠️ Budget alert from Lumi</h2>
          <p>Hi {first_name},</p>
          <p>You've used <strong>{pct}%</strong> of your {category} budget this month.</p>
          <p style="color: #8899AA; font-size: 13px;">
            UGX {amount:,.0f} spent of UGX {budget:,.0f} budget.
            Open Lumi to see your full breakdown.
          </p>
        </div>
        """
        await self._send(to, f"⚠️ {category} budget at {pct}% — Lumi", html)

    # ── Private helper ────────────────────────────────────────────────────────

    async def _send(self, to: EmailStr, subject: str, html: str) -> None:
        message = MessageSchema(
            subject=subject,
            recipients=[to],
            body=html,
            subtype=MessageType.html,
        )
        await _mailer.send_message(message)


# ── Singleton ─────────────────────────────────────────────────────────────────
_email_service: EmailService | None = None

def get_email_service() -> EmailService:
    global _email_service
    if _email_service is None:
        _email_service = EmailService()
    return _email_service
