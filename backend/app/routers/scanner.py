"""
app/routers/scanner.py

Scanner router — SMS and receipt scanning endpoints.
Kept separate from transactions.py for clarity.

Endpoints:
  POST /scanner/sms              — scan SMS → preview
  POST /scanner/sms/confirm      — confirm scanned SMS → save
  POST /scanner/receipt          — scan receipt text → preview
  POST /scanner/receipt/confirm  — confirm scanned receipt → save
  POST /scanner/sms/batch        — scan multiple SMS messages
"""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_verified_user
from app.models.user import User
from app.schemas.scanner import (
    ScanBatchRequest,
    ScanConfirmRequest,
    ScanRequest,
    ScanResponse,
)
from app.schemas.transaction import TransactionResponse
from app.services.transaction_service import TransactionService

router = APIRouter(prefix="/scanner", tags=["AI Scanner"])


def _svc(db: AsyncSession = Depends(get_db)) -> TransactionService:
    return TransactionService(db)


# ── SMS ───────────────────────────────────────────────────────────────────────

@router.post(
    "/sms",
    response_model=ScanResponse,
    summary="AI-scan an MTN MoMo SMS → preview extracted transaction",
)
async def scan_sms(
    payload:      ScanRequest,
    current_user: User               = Depends(get_verified_user),
    service:      TransactionService = Depends(_svc),
) -> ScanResponse:
    """
    Step 1: Send raw SMS text to AI, get extracted transaction preview.
    The user reviews and optionally edits before confirming.
    """
    return await service.scan_sms(payload.text)


@router.post(
    "/sms/confirm",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Confirm and save a scanned SMS transaction",
)
async def confirm_sms(
    payload:      ScanConfirmRequest,
    current_user: User               = Depends(get_verified_user),
    service:      TransactionService = Depends(_svc),
) -> TransactionResponse:
    """Step 2: User confirmed the preview. Save with ai_scanned=True."""
    return await service.confirm_scan(current_user.id, payload)


# ── Receipt ───────────────────────────────────────────────────────────────────

@router.post(
    "/receipt",
    response_model=ScanResponse,
    summary="AI-scan a receipt text → preview extracted transaction",
)
async def scan_receipt(
    payload:      ScanRequest,
    current_user: User               = Depends(get_verified_user),
    service:      TransactionService = Depends(_svc),
) -> ScanResponse:
    """Scan a plain-text receipt (shop receipt, invoice, etc)."""
    from app.ai.receipt_scanner import get_receipt_scanner
    from app.schemas.scanner import ScanResponse as SR

    scanner = get_receipt_scanner()
    result  = await scanner.scan(payload.text)

    return SR(
        amount=result.amount,
        type=result.type,
        category=result.category,
        description=result.description,
        date=result.date,
        currency=result.currency,
        confidence=result.confidence,
        raw_text=result.raw_text,
    )


@router.post(
    "/receipt/confirm",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Confirm and save a scanned receipt transaction",
)
async def confirm_receipt(
    payload:      ScanConfirmRequest,
    current_user: User               = Depends(get_verified_user),
    service:      TransactionService = Depends(_svc),
) -> TransactionResponse:
    from app.utils.enums import TransactionSource
    from app.schemas.transaction import TransactionCreate

    create_payload = TransactionCreate(
        amount=payload.amount,
        type=payload.type,
        category=payload.category,
        description=payload.description,
        date=payload.date,
        currency=payload.currency,
        source=TransactionSource.RECEIPT_SCAN,
        ai_scanned=True,
    )
    return await service.create_transaction(current_user.id, create_payload)


# ── Batch SMS ─────────────────────────────────────────────────────────────────

@router.post(
    "/sms/batch",
    response_model=list[ScanResponse],
    summary="Batch scan multiple SMS messages at once",
)
async def scan_sms_batch(
    payload:      ScanBatchRequest,
    current_user: User               = Depends(get_verified_user),
    service:      TransactionService = Depends(_svc),
) -> list[ScanResponse]:
    """
    Scan up to 20 SMS messages in one call.
    Skips individual failures — returns only successfully parsed ones.
    """
    from app.ai.sms_scanner import get_scanner
    from app.schemas.scanner import ScanResponse as SR

    scanner = get_scanner()
    results = await scanner.scan_batch(payload.texts)

    return [
        SR(
            amount=r.amount, type=r.type, category=r.category,
            description=r.description, date=r.date,
            currency=r.currency, confidence=r.confidence, raw_text=r.raw_text,
        )
        for r in results
    ]
