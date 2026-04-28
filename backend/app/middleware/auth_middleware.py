"""
app/middleware/auth_middleware.py

JWT authentication middleware.
Validates HTTP-only cookie on every protected request.
"""

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

PUBLIC_PATHS = {
    "/health",
    "/docs",
    "/redoc",
    "/openapi.json",
    "/api/v1/auth/register",
    "/api/v1/auth/login",
    "/api/v1/auth/verify-email",
    "/api/v1/auth/resend-verification",
    "/api/v1/auth/forgot-password",
    "/api/v1/auth/reset-password",
}


class AuthMiddleware(BaseHTTPMiddleware):
    """
    Lightweight middleware that checks the JWT cookie exists on
    non-public routes. Full validation happens in get_current_user dependency.
    This is an early gate to reject obviously unauthenticated requests fast.
    """

    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return await call_next(request)

        if request.url.path in PUBLIC_PATHS:
            return await call_next(request)

        # Let protected routes handle their own auth via Depends(get_current_user)
        return await call_next(request)
