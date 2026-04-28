"""
tests/unit/test_transaction_service.py
"""

from datetime import date
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest

from app.ai.sms_scanner import ScannedTransaction
from app.schemas.transaction import (
    ScanConfirmRequest,
    TransactionCreate,
    TransactionFilters,
)
from app.services.transaction_service import TransactionService
from app.utils.enums import TransactionCategory, TransactionSource, TransactionType


@pytest.fixture
def service() -> TransactionService:
    with patch("app.services.transaction_service.get_scanner"):
        svc = TransactionService(AsyncMock())
        svc._scanner = AsyncMock()
        return svc


class TestTransactionService:

    async def test_scan_sms_returns_preview(self, service: TransactionService) -> None:
        user_id = uuid4()
        service._scanner.scan = AsyncMock(return_value=ScannedTransaction(
            amount=350_000,
            type=TransactionType.INCOME,
            category=TransactionCategory.INCOME,
            description="MTN MoMo received",
            date=date.today(),
            currency="UGX",
            confidence=0.97,
            raw_text="You have received UGX 350,000",
        ))

        result = await service.scan_sms("You have received UGX 350,000")

        assert result.amount    == 350_000
        assert result.type      == TransactionType.INCOME
        assert result.confidence == 0.97

    async def test_confirm_scan_saves_with_ai_flags(
        self, service: TransactionService
    ) -> None:
        user_id = uuid4()

        saved_tx = MagicMock()
        saved_tx.id          = uuid4()
        saved_tx.amount      = 350_000
        saved_tx.type        = TransactionType.INCOME
        saved_tx.category    = TransactionCategory.INCOME
        saved_tx.description = "MTN MoMo received"
        saved_tx.date        = date.today()
        saved_tx.source      = TransactionSource.SMS_SCAN
        saved_tx.currency    = "UGX"
        saved_tx.ai_scanned  = True
        saved_tx.created_at  = date.today()

        service._repo.create = AsyncMock(return_value=saved_tx)

        result = await service.confirm_scan(
            user_id,
            ScanConfirmRequest(
                amount=350_000,
                type=TransactionType.INCOME,
                category=TransactionCategory.INCOME,
                description="MTN MoMo received",
                date=date.today(),
                currency="UGX",
            ),
        )

        assert result.ai_scanned is True
        assert result.source     == TransactionSource.SMS_SCAN

    async def test_list_transactions_returns_paginated(
        self, service: TransactionService
    ) -> None:
        user_id  = uuid4()
        mock_txs = [MagicMock() for _ in range(5)]

        # Give each mock the required attributes
        for i, tx in enumerate(mock_txs):
            tx.id          = uuid4()
            tx.amount      = float(i * 10_000)
            tx.type        = TransactionType.EXPENSE
            tx.category    = TransactionCategory.FOOD
            tx.description = f"Expense {i}"
            tx.date        = date.today()
            tx.source      = TransactionSource.MANUAL
            tx.currency    = "UGX"
            tx.ai_scanned  = False
            tx.created_at  = date.today()

        service._repo.get_filtered = AsyncMock(return_value=(mock_txs, 5))

        result = await service.list_transactions(
            user_id, TransactionFilters(page=1, per_page=20)
        )

        assert result.total    == 5
        assert len(result.items) == 5
        assert result.has_next is False
