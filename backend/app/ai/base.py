"""
app/ai/base.py

BaseAIService — abstract base class for all Lumi AI services.

All AI feature classes inherit from this to ensure:
  - Consistent interface
  - Shared LLM configuration
  - Type safety enforced by mypy
"""

from abc import ABC, abstractmethod

from langchain_openai import ChatOpenAI

from app.config import get_settings

settings = get_settings()


class BaseAIService(ABC):
    """
    Abstract base for all Lumi AI services.

    Subclasses must implement the primary action method.
    Provides a shared ChatOpenAI instance and common config.
    """

    #: Override in subclass to change the model
    model: str = "gpt-4o-mini"

    #: Override in subclass to change temperature
    temperature: float = 0.0

    def __init__(self) -> None:
        self._llm = ChatOpenAI(
            model=self.model,
            temperature=self.temperature,
            api_key=settings.OPENAI_API_KEY,
        )

    @property
    def llm(self) -> ChatOpenAI:
        return self._llm
