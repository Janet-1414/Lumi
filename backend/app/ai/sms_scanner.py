"""
app/ai/sms_scanner.py

SMSScanner — AI-powered MTN Mobile Money SMS parser.

This is one of Lumi's three REAL AI features.

How it works:
  1. User pastes an MTN MoMo SMS (or any mobile money message)
  2. LangChain sends it to GPT with a strict extraction prompt
  3. The model returns structured JSON: amount, type, description, category, date
  4. We validate the JSON with Pydantic and auto-log the transaction

Supported formats:
  - MTN Mobile Money Uganda
  - Airtel Money Uganda
  - M-Pesa Kenya (extensible)
  - Plain text receipts

Observability: every call is traced in LangSmith under the "lumi" project.
"""

import json
import re
from datetime import date as DateType
from typing import Any

from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field, field_validator

from app.config import get_settings
from app.exceptions.base import ScannerException
from app.utils.enums import TransactionCategory, TransactionType

settings = get_settings()


# ─── Output schema ────────────────────────────────────────────────────────────

class ScannedTransaction(BaseModel):
    """
    Structured output from the SMS/receipt scanner.
    Validated by Pydantic before being saved to the DB.
    """
    amount:           float                = Field(..., gt=0, description="Transaction amount")
    type:             TransactionType      = Field(..., description="income or expense")
    category:         TransactionCategory  = Field(..., description="Best matching category")
    description:      str                  = Field(..., min_length=2, max_length=500)
    transaction_date: DateType             = Field(..., description="Transaction date")
    currency:         str                  = Field(default="UGX")
    confidence:       float                = Field(default=1.0, ge=0.0, le=1.0)
    raw_text:         str                  = Field(default="", description="Original SMS text")

    @field_validator("currency")
    @classmethod
    def normalise_currency(cls, v: str) -> str:
        return v.upper().strip()

    @field_validator("description")
    @classmethod
    def clean_description(cls, v: str) -> str:
        return v.strip()

    @property
    def date(self) -> DateType:
        """Convenience alias so callers can still use .date"""
        return self.transaction_date


# ─── Extraction prompt ────────────────────────────────────────────────────────

EXTRACTION_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        """You are a financial data extraction assistant for Lumi, an African financial wellness app.

Your job is to extract transaction details from SMS messages or receipt text, especially:
- MTN Mobile Money (Uganda): "You have received UGX 350,000 from..."
- Airtel Money Uganda: "Airtel Money: You received UGX..."
- M-Pesa Kenya: "Confirmed. UGX/KES X received from..."
- General receipts and payment confirmations

Extract and return ONLY valid JSON with these exact fields:
{{
  "amount": <number, no commas>,
  "type": <"income" or "expense">,
  "category": <one of: food, transport, shopping, utilities, health, education, savings, income, mobile_money, other>,
  "description": <short human-readable description, max 100 chars>,
  "transaction_date": <YYYY-MM-DD, use today if not found: {today}>,
  "currency": <"UGX" default, or detected currency code>,
  "confidence": <0.0 to 1.0, how confident you are in the extraction>
}}

Category rules:
- "income" → money received, salary, payments to you
- "mobile_money" → MTN/Airtel transfers, airtime purchases
- "food" → restaurants, supermarkets, food purchases
- "transport" → boda boda, taxi, fuel, bus
- "savings" → transfers to savings, deposits
- Use "other" when unsure

IMPORTANT:
- Return ONLY the JSON object, no explanation, no markdown
- amount must be a plain number (e.g. 350000 not "350,000")
- If you cannot extract a valid transaction, return {{"error": "Cannot parse transaction"}}
""",
    ),
    (
        "human",
        "Extract the transaction from this text:\n\n{text}",
    ),
])


# ─── Scanner class ────────────────────────────────────────────────────────────

class SMSScanner:
    """
    AI-powered SMS and receipt scanner.

    Uses LangChain + GPT-4o-mini for fast, cheap, accurate extraction.
    Every call is traced in LangSmith for observability.

    Usage:
        scanner = SMSScanner()
        result = await scanner.scan("You have received UGX 350,000 from Andela")
    """

    def __init__(self) -> None:
        self._llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0,
            api_key=settings.OPENAI_API_KEY,
        )
        self._chain = EXTRACTION_PROMPT | self._llm

    async def scan(self, text: str) -> ScannedTransaction:
        """
        Parse a raw SMS or receipt text into a structured ScannedTransaction.

        Args:
            text: Raw SMS message or receipt text from the user.

        Returns:
            ScannedTransaction with extracted fields.

        Raises:
            ScannerException: If the text cannot be parsed or the AI returns an error.
        """
        cleaned = self._clean_input(text)

        if not cleaned:
            raise ScannerException("Please provide a non-empty SMS or receipt text.")

        try:
            response = await self._chain.ainvoke({
                "text":  cleaned,
                "today": DateType.today().isoformat(),
            })

            raw_content = response.content
            parsed      = self._parse_json(str(raw_content))

            if "error" in parsed:
                raise ScannerException(
                    f"Could not extract a transaction: {parsed['error']}"
                )

            return ScannedTransaction(
                **parsed,
                raw_text=cleaned,
            )

        except ScannerException:
            raise
        except json.JSONDecodeError as e:
            raise ScannerException("AI returned unexpected format. Please try again.") from e
        except Exception as e:
            raise ScannerException(f"Scanner error: {str(e)}") from e

    async def scan_batch(self, texts: list[str]) -> list[ScannedTransaction]:
        """
        Scan multiple SMS messages in sequence.
        Skips individual failures and continues with the rest.

        Returns a list of successfully scanned transactions.
        """
        results: list[ScannedTransaction] = []

        for text in texts:
            try:
                result = await self.scan(text)
                results.append(result)
            except ScannerException:
                continue

        return results

    # ── Private helpers ───────────────────────────────────────────────────────

    @staticmethod
    def _clean_input(text: str) -> str:
        """Normalise whitespace and remove zero-width characters."""
        text = re.sub(r"[\u200b\u200c\u200d\ufeff]", "", text)
        return " ".join(text.split()).strip()

    @staticmethod
    def _parse_json(content: str) -> dict[str, Any]:
        """
        Extract JSON from the model response.
        Handles cases where the model wraps output in markdown code fences.
        """
        content = re.sub(r"^```(?:json)?\s*", "", content.strip())
        content = re.sub(r"\s*```$",           "", content.strip())
        return json.loads(content)


# ─── Singleton ────────────────────────────────────────────────────────────────

_scanner_instance: SMSScanner | None = None


def get_scanner() -> SMSScanner:
    """Dependency-injection compatible factory for the SMS scanner."""
    global _scanner_instance
    if _scanner_instance is None:
        _scanner_instance = SMSScanner()
    return _scanner_instance