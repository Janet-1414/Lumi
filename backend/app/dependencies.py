"""
app/dependencies.py

FastAPI dependency functions shared across all routers.
"""

from fastapi import Cookie, Depends
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.exceptions.base import TokenExpiredException, TokenInvalidException
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.utils.security import decode_token


async def get_current_user(
    lumi_access_token: str | None = Cookie(default=None),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    FastAPI dependency — extracts and validates the JWT from the HTTP-only cookie.
    Raises 401 if the token is missing, invalid, or expired.

    Usage in routes:
        @router.get("/me")
        async def me(user: User = Depends(get_current_user)):
            ...
    """
    if not lumi_access_token:
        raise TokenInvalidException()

    try:
        payload = decode_token(lumi_access_token)
        user_id: str = payload.get("sub", "")
        if not user_id:
            raise TokenInvalidException()
    except JWTError as exc:
        # Distinguish expired from invalid
        if "expired" in str(exc).lower():
            raise TokenExpiredException() from exc
        raise TokenInvalidException() from exc

    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)  # type: ignore[arg-type]
    if not user:
        raise TokenInvalidException()

    return user


async def get_verified_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Like get_current_user but also enforces email verification."""
    from app.exceptions.base import EmailNotVerifiedException
    if not current_user.is_verified:
        raise EmailNotVerifiedException()
    return current_user
