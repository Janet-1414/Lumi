"""
app/services/transaction_service.py

TransactionService — all business logic for transactions.

Responsibilities:
  - CRUD operations via TransactionRepository
  - SMS / receipt scanning via SMSScanner
  - Scan → preview → confirm flow
  - Summary stats
"""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.sms_scanner import SMSScanner, get_scanner
from app.exceptions.base import LumiBaseException, ScannerException
from app.models.transaction import Transaction
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.transaction import (
    ScanConfirmRequest,
    ScanResponse,
    TransactionCreate,
    TransactionFilters,
    TransactionListResponse,
    TransactionResponse,
    TransactionSummary,
    TransactionUpdate,
)
from app.utils.enums import TransactionSource


class TransactionService:
    """
    Stateless service instantiated per request.

    Usage:
        service = TransactionService(db)
        await service.list_transactions(user_id, filters)
    """

    def __init__(self, db: AsyncSession) -> None:
        self._repo    = TransactionRepository(db)
        self._scanner = get_scanner()

    # ── CRUD ──────────────────────────────────────────────────────────────────

    async def list_transactions(
        self,
        user_id: uuid.UUID,
        filters: TransactionFilters,
    ) -> TransactionListResponse:
        items, total = await self._repo.get_filtered(user_id, filters)

        return TransactionListResponse(
            items=[TransactionResponse.model_validate(tx) for tx in items],
            total=total,
            page=filters.page,
            per_page=filters.per_page,
            has_next=(filters.page * filters.per_page) < total,
        )

    async def create_transaction(
        self,
        user_id: uuid.UUID,
        payload: TransactionCreate,
    ) -> TransactionResponse:
        tx = Transaction(
            user_id=user_id,
            **payload.model_dump(),
        )
        saved = await self._repo.create(tx)
        return TransactionResponse.model_validate(saved)

    async def update_transaction(
        self,
        transaction_id: uuid.UUID,
        user_id:        uuid.UUID,
        payload:        TransactionUpdate,
    ) -> TransactionResponse:
        tx = await self._get_or_404(transaction_id, user_id)

        for field, value in payload.model_dump(exclude_none=True).items():
            setattr(tx, field, value)

        saved = await self._repo.update(tx)
        return TransactionResponse.model_validate(saved)

    async def delete_transaction(
        self,
        transaction_id: uuid.UUID,
        user_id:        uuid.UUID,
    ) -> None:
        tx = await self._get_or_404(transaction_id, user_id)
        await self._repo.delete(tx)

    # ── SMS Scanner flow ──────────────────────────────────────────────────────

    async def scan_sms(self, text: str) -> ScanResponse:
        """
        Step 1 of the scan-confirm flow.

        Sends the raw SMS to the AI, returns a preview
        for the user to review and optionally edit before saving.
        """
        result = await self._scanner.scan(text)

        return ScanResponse(
            amount=result.amount,
            type=result.type,
            category=result.category,
            description=result.description,
            date=result.date,
            currency=result.currency,
            confidence=result.confidence,
            raw_text=result.raw_text,
        )

    async def confirm_scan(
        self,
        user_id: uuid.UUID,
        payload: ScanConfirmRequest,
    ) -> TransactionResponse:
        """
        Step 2 of the scan-confirm flow.

        User reviews/edits the preview and confirms.
        Saves to DB with ai_scanned=True and source=sms_scan.
        """
        create_payload = TransactionCreate(
            amount=payload.amount,
            type=payload.type,
            category=payload.category,
            description=payload.description,
            date=payload.date,
            currency=payload.currency,
            source=TransactionSource.SMS_SCAN,
            ai_scanned=True,
        )
        return await self.create_transaction(user_id, create_payload)

    # ── Summary ───────────────────────────────────────────────────────────────

    async def get_summary(self, user_id: uuid.UUID) -> TransactionSummary:
        totals = await self._repo.summary(user_id)
        return TransactionSummary(
            total_income=totals["income"],
            total_expenses=totals["expenses"],
            net=totals["net"],
            count=0,   # TODO: add count query
        )

    # ── Helpers ───────────────────────────────────────────────────────────────

    async def _get_or_404(
        self, transaction_id: uuid.UUID, user_id: uuid.UUID
    ) -> Transaction:
        tx = await self._repo.get_by_id_for_user(transaction_id, user_id)
        if not tx:
            raise LumiBaseException("Transaction not found")
        return tx
