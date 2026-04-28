"""
app/exceptions/handlers.py

Global FastAPI exception handlers.
Register all of these in app/main.py using add_exception_handler().
"""

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from app.exceptions.base import LumiBaseException


async def lumi_exception_handler(
    request: Request, exc: LumiBaseException
) -> JSONResponse:
    """Handle all Lumi custom exceptions with consistent JSON shape."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "success": False},
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Return clean validation errors instead of FastAPI's default verbose format."""
    errors = []
    for error in exc.errors():
        field = " → ".join(str(loc) for loc in error["loc"] if loc != "body")
        errors.append({"field": field, "message": error["msg"]})

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation failed", "errors": errors, "success": False},
    )


async def integrity_error_handler(
    request: Request, exc: IntegrityError
) -> JSONResponse:
    """Handle DB unique constraint violations cleanly."""
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": "This record already exists.", "success": False},
    )


async def generic_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """Catch-all for unexpected errors — never expose internals."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred.", "success": False},
    )
