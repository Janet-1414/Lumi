"""
app/main.py

FastAPI application factory.
Uses the factory pattern so the app can be created fresh in tests.
"""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.exceptions.base import LumiBaseException
from app.routers import auth

settings = get_settings()
logger = structlog.get_logger()


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("Lumi backend starting", env=settings.APP_ENV)
    yield
    logger.info("Lumi backend shutting down")


# ── App factory ───────────────────────────────────────────────────────────────

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        description="AI-powered financial wellness for African youth",
        version="0.1.0",
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
        lifespan=lifespan,
    )

    # ── CORS — all values from env, nothing hardcoded ─────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=settings.CORS_ALLOW_METHODS,
        allow_headers=settings.CORS_ALLOW_HEADERS,
    )

    # ── Global exception handler ──────────────────────────────────────────────
    @app.exception_handler(LumiBaseException)
    async def lumi_exception_handler(
        request: Request, exc: LumiBaseException
    ) -> JSONResponse:
        logger.warning(
            "LumiException",
            path=request.url.path,
            status=exc.status_code,
            detail=exc.detail,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail, "success": False},
        )

    # ── Routers ───────────────────────────────────────────────────────────────
    app.include_router(auth.router, prefix=settings.API_PREFIX)
    # Future routers:
    # app.include_router(transactions.router, prefix=settings.API_PREFIX)
    # app.include_router(savings.router, prefix=settings.API_PREFIX)
    # app.include_router(chat.router, prefix=settings.API_PREFIX)
    # app.include_router(scanner.router, prefix=settings.API_PREFIX)

    # ── Health check ──────────────────────────────────────────────────────────
    @app.get("/health", tags=["System"])
    async def health() -> dict:
        return {"status": "ok", "app": settings.APP_NAME, "env": settings.APP_ENV}

    return app


app = create_app()
