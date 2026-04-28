"""app/utils/pagination.py — Pagination helper."""
from typing import TypeVar, Generic
from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items:    list[T]
    total:    int
    page:     int
    per_page: int
    has_next: bool

    @classmethod
    def build(cls, items: list[T], total: int, page: int, per_page: int) -> "PaginatedResponse[T]":
        return cls(
            items=items,
            total=total,
            page=page,
            per_page=per_page,
            has_next=(page * per_page) < total,
        )
