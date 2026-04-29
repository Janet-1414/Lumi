"""
app/exceptions/ai.py

AI feature exceptions — scanner, chat, report writer etc.
"""

from fastapi import status
from app.exceptions.base import LumiBaseException


class ScannerException(LumiBaseException):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    detail      = "Could not parse the provided message or receipt"


class ReceiptScannerException(ScannerException):
    detail = "Could not parse the provided receipt"


class ChatException(LumiBaseException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    detail      = "AI chat is temporarily unavailable. Please try again."


class PersonalityAIException(LumiBaseException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    detail      = "Could not analyse personality quiz. Please try again."


class InsightGenerationException(LumiBaseException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    detail      = "Could not generate AI insight at this time."


class ReportGenerationException(LumiBaseException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    detail      = "Could not generate AI report summary at this time."
