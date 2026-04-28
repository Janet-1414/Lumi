"""
app/services/base.py — Abstract base service class.
"""
from abc import ABC
from sqlalchemy.ext.asyncio import AsyncSession


class BaseService(ABC):
    """
    All Lumi services inherit from this.
    Provides a typed db session and enforces the pattern
    of never calling the DB directly from routers.
    """
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
