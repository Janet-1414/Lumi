"""
app/routers/users.py

Users router — profile management endpoints.
Separate from auth.py (login/register) and profile.py (display).
Handles updates to user account data.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_verified_user
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserRead, summary="Get current user profile")
async def get_me(
    current_user: User = Depends(get_verified_user),
) -> UserRead:
    return UserRead.model_validate(current_user)


@router.patch("/me", response_model=UserRead, summary="Update current user profile")
async def update_me(
    payload:      UserUpdate,
    current_user: User            = Depends(get_verified_user),
    db:           AsyncSession    = Depends(get_db),
) -> UserRead:
    repo = UserRepository(db)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    updated = await repo.update(current_user)
    return UserRead.model_validate(updated)
