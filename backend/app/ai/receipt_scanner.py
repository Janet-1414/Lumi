"""
app/ai/receipt_scanner.py

ReceiptScanner — AI-powered receipt parser.

Handles:
  - Plain text receipts (copy-pasted)
  - Structured receipt formats (POS receipts, invoice text)

For image receipts, the frontend should extract text via
the browser's clipboard or a future OCR integration before
sending to this endpoint.
"""

import json
import re
from datetime import date as Date

from langchain_core.prompts import ChatPromptTemplate

from app.ai.base import BaseAIService
from app.ai.sms_scanner import ScannedTransaction
from app.exceptions.base import ScannerException

RECEIPT_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        """You are a financial receipt parser for Lumi, an African finance app.
Extract transaction details from receipt text.

Return ONLY valid JSON:
{{
  "amount": <total amount as number>,
  "type": "expense",
  "category": <one of: food, transport, shopping, utilities, health, education, savings, income, mobile_money, other>,
  "description": <merchant name + short description, max 80 chars>,
  "date": <YYYY-MM-DD, use today if not found: {today}>,
  "currency": "UGX",
  "confidence": <0.0 to 1.0>
}}

If you cannot parse a valid receipt, return: {{"error": "Cannot parse receipt"}}
Return ONLY JSON, no explanation.""",
    ),
    ("human", "Parse this receipt:\n\n{text}"),
])


class ReceiptScanner(BaseAIService):
    """
    Parses text receipts into structured transaction data.
    Works alongside SMSScanner — SMS for mobile money,
    ReceiptScanner for shop receipts and invoices.
    """

    temperature = 0.0

    def __init__(self) -> None:
        super().__init__()
        self._chain = RECEIPT_PROMPT | self._llm

    async def scan(self, text: str) -> ScannedTransaction:
        """
        Parse receipt text into a ScannedTransaction.

        Args:
            text: Raw receipt text

        Returns:
            ScannedTransaction with extracted fields

        Raises:
            ScannerException: If receipt cannot be parsed
        """
        cleaned = " ".join(text.split()).strip()
        if not cleaned or len(cleaned) < 5:
            raise ScannerException("Receipt text is too short to parse.")

        try:
            response = await self._chain.ainvoke({
                "text":  cleaned,
                "today": Date.today().isoformat(),
            })

            raw = str(response.content)
            raw = re.sub(r"^```(?:json)?\s*", "", raw.strip())
            raw = re.sub(r"\s*```$",           "", raw.strip())

            parsed = json.loads(raw)

            if "error" in parsed:
                raise ScannerException(f"Could not parse receipt: {parsed['error']}")

            return ScannedTransaction(**parsed, raw_text=cleaned)

        except ScannerException:
            raise
        except json.JSONDecodeError as e:
            raise ScannerException("Receipt returned unexpected format.") from e
        except Exception as e:
            raise ScannerException(f"Receipt scanner error: {str(e)}") from e


_receipt_scanner: ReceiptScanner | None = None


def get_receipt_scanner() -> ReceiptScanner:
    global _receipt_scanner
    if _receipt_scanner is None:
        _receipt_scanner = ReceiptScanner()
    return _receipt_scanner
