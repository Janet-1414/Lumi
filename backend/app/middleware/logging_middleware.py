"""
app/middleware/logging_middleware.py

Structured request/response logging using structlog.
Logs: method, path, status, duration, user_id (from cookie if present).
"""

import time
import structlog
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = structlog.get_logger()


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start  = time.perf_counter()
        method = request.method
        path   = request.url.path

        response = await call_next(request)

        duration_ms = round((time.perf_counter() - start) * 1000, 1)
        status      = response.status_code

        log = logger.bind(method=method, path=path, status=status, duration_ms=duration_ms)

        if status >= 500:
            log.error("Request error")
        elif status >= 400:
            log.warning("Client error")
        else:
            log.info("Request OK")

        return response
