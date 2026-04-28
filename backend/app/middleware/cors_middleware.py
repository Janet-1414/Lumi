"""
app/middleware/cors_middleware.py

CORS configuration loaded entirely from environment variables.
Never hardcoded.
"""

from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings


def get_cors_middleware_config() -> dict:
    """Return CORS kwargs ready to pass to app.add_middleware()."""
    settings = get_settings()
    return {
        "allow_origins":     settings.CORS_ORIGINS,
        "allow_credentials": True,
        "allow_methods":     settings.CORS_ALLOW_METHODS,
        "allow_headers":     settings.CORS_ALLOW_HEADERS,
    }
