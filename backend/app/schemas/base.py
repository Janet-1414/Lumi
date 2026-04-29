"""
app/schemas/base.py

Base Pydantic schemas shared across all domains.
"""

from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class MessageResponse(BaseModel):
    message: str
    success: bool = True


class PaginatedResponse(BaseModel, Generic[T]):
    items:    list[T]
    total:    int
    page:     int
    per_page: int
    has_next: bool

    @classmethod
    def build(
        cls,
        items:    list[T],
        total:    int,
        page:     int,
        per_page: int,
    ) -> "PaginatedResponse[T]":
        return cls(
            items=items,
            total=total,
            page=page,
            per_page=per_page,
            has_next=(page * per_page) < total,
        )


class ErrorResponse(BaseModel):
    detail:  str
    success: bool = False
