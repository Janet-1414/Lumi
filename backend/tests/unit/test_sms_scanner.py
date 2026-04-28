"""
tests/unit/test_sms_scanner.py

Unit tests for SMSScanner AI service.
LLM calls are fully mocked — tests run without an OpenAI API key.
"""

from datetime import date
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.ai.sms_scanner import SMSScanner, ScannedTransaction
from app.exceptions.base import ScannerException
from app.utils.enums import TransactionCategory, TransactionType


@pytest.fixture
def scanner() -> SMSScanner:
    with patch("app.ai.sms_scanner.ChatOpenAI"):
        s = SMSScanner()
        s._chain = AsyncMock()
        return s


def _mock_response(json_str: str) -> MagicMock:
    mock = MagicMock()
    mock.content = json_str
    return mock


class TestSMSScanner:

    async def test_parses_mtn_received_sms(self, scanner: SMSScanner) -> None:
        scanner._chain.ainvoke = AsyncMock(return_value=_mock_response(
            '{"amount": 350000, "type": "income", "category": "income", '
            '"description": "MTN MoMo received from Andela", '
            f'"date": "{date.today()}", "currency": "UGX", "confidence": 0.97}}'
        ))

        result = await scanner.scan(
            "You have received UGX 350,000 from ANDELA KENYA LTD on 15/01/2025."
        )

        assert result.amount      == 350_000
        assert result.type        == TransactionType.INCOME
        assert result.category    == TransactionCategory.INCOME
        assert result.currency    == "UGX"
        assert result.confidence  == pytest.approx(0.97)

    async def test_parses_mtn_sent_sms(self, scanner: SMSScanner) -> None:
        scanner._chain.ainvoke = AsyncMock(return_value=_mock_response(
            '{"amount": 30000, "type": "expense", "category": "mobile_money", '
            '"description": "MTN MoMo sent to Nakato Sarah", '
            f'"date": "{date.today()}", "currency": "UGX", "confidence": 0.95}}'
        ))

        result = await scanner.scan(
            "MTN MoMo: You sent UGX 30,000 to NAKATO SARAH on 15/01/2025."
        )

        assert result.amount   == 30_000
        assert result.type     == TransactionType.EXPENSE
        assert result.category == TransactionCategory.MOBILE_MONEY

    async def test_raises_on_unparseable_text(self, scanner: SMSScanner) -> None:
        scanner._chain.ainvoke = AsyncMock(return_value=_mock_response(
            '{"error": "Cannot parse transaction"}'
        ))

        with pytest.raises(ScannerException) as exc:
            await scanner.scan("Hello this is not a financial message")

        assert "Cannot parse" in str(exc.value.detail)

    async def test_raises_on_empty_input(self, scanner: SMSScanner) -> None:
        with pytest.raises(ScannerException):
            await scanner.scan("")

    async def test_raises_on_invalid_json(self, scanner: SMSScanner) -> None:
        scanner._chain.ainvoke = AsyncMock(return_value=_mock_response("not json at all"))

        with pytest.raises(ScannerException):
            await scanner.scan("MTN MoMo: received UGX 100,000")

    async def test_strips_markdown_fences(self, scanner: SMSScanner) -> None:
        """Model sometimes wraps JSON in ```json ... ``` — we handle this."""
        scanner._chain.ainvoke = AsyncMock(return_value=_mock_response(
            '```json\n{"amount": 50000, "type": "expense", "category": "food", '
            '"description": "Supermarket", '
            f'"date": "{date.today()}", "currency": "UGX", "confidence": 0.9}}\n```'
        ))

        result = await scanner.scan("Receipt: Game supermarket UGX 50,000")
        assert result.amount == 50_000

    async def test_batch_skips_failures(self, scanner: SMSScanner) -> None:
        """scan_batch should continue past individual failures."""
        good = _mock_response(
            '{"amount": 100000, "type": "income", "category": "income", '
            '"description": "Payment", '
            f'"date": "{date.today()}", "currency": "UGX", "confidence": 0.9}}'
        )
        bad = _mock_response('{"error": "Cannot parse"}')

        scanner._chain.ainvoke = AsyncMock(side_effect=[good, bad])

        results = await scanner.scan_batch([
            "You have received UGX 100,000",
            "This is not a transaction",
        ])

        assert len(results) == 1
        assert results[0].amount == 100_000

    async def test_cleans_zero_width_chars(self, scanner: SMSScanner) -> None:
        """Zero-width characters from copy-paste should be stripped."""
        scanner._chain.ainvoke = AsyncMock(return_value=_mock_response(
            '{"amount": 25000, "type": "expense", "category": "transport", '
            '"description": "Boda boda", '
            f'"date": "{date.today()}", "currency": "UGX", "confidence": 0.88}}'
        ))

        # Include zero-width space in the text
        result = await scanner.scan("MTN\u200bMoMo: sent UGX 25,000 for transport")
        assert result.amount == 25_000


class TestScannedTransaction:
    def test_validates_positive_amount(self) -> None:
        with pytest.raises(Exception):
            ScannedTransaction(
                amount=-100,
                type=TransactionType.EXPENSE,
                category=TransactionCategory.FOOD,
                description="Test",
                date=date.today(),
            )

    def test_normalises_currency_to_uppercase(self) -> None:
        tx = ScannedTransaction(
            amount=1000,
            type=TransactionType.EXPENSE,
            category=TransactionCategory.FOOD,
            description="Test",
            date=date.today(),
            currency="ugx",
        )
        assert tx.currency == "UGX"

    def test_strips_description_whitespace(self) -> None:
        tx = ScannedTransaction(
            amount=1000,
            type=TransactionType.EXPENSE,
            category=TransactionCategory.FOOD,
            description="  Supermarket  ",
            date=date.today(),
        )
        assert tx.description == "Supermarket"
