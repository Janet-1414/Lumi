"""
app/routers/transactions.py

Transactions router — thin HTTP layer, all logic in TransactionService.

Endpoints:
  GET    /transactions          — paginated + filtered list
  POST   /transactions          — create manually
  GET    /transactions/summary  — totals
  PATCH  /transactions/{id}     — edit
  DELETE /transactions/{id}     — delete
  POST   /transactions/scan     — AI scan SMS → preview
  POST   /transactions/scan/confirm — confirm scanned transaction → save
"""

import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_verified_user
from app.models.user import User
from app.schemas.transaction import (
    ScanConfirmRequest,
    ScanRequest,
    ScanResponse,
    TransactionCreate,
    TransactionFilters,
    TransactionListResponse,
    TransactionResponse,
    TransactionSummary,
    TransactionUpdate,
)
from app.services.transaction_service import TransactionService
from app.utils.enums import TransactionCategory, TransactionType

router = APIRouter(prefix="/transactions", tags=["Transactions"])


def _service(db: AsyncSession = Depends(get_db)) -> TransactionService:
    return TransactionService(db)


# ── List ──────────────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=TransactionListResponse,
    summary="List transactions with filters and pagination",
)
async def list_transactions(
    type:      TransactionType     | None = Query(None),
    category:  TransactionCategory | None = Query(None),
    date_from: str | None                 = Query(None, description="YYYY-MM-DD"),
    date_to:   str | None                 = Query(None, description="YYYY-MM-DD"),
    search:    str | None                 = Query(None),
    page:      int                        = Query(1,  ge=1),
    per_page:  int                        = Query(20, ge=1, le=100),
    current_user: User             = Depends(get_verified_user),
    service:   TransactionService  = Depends(_service),
) -> TransactionListResponse:
    filters = TransactionFilters(
        type=type,
        category=category,
        date_from=date_from,   # type: ignore[arg-type]
        date_to=date_to,       # type: ignore[arg-type]
        search=search,
        page=page,
        per_page=per_page,
    )
    return await service.list_transactions(current_user.id, filters)


# ── Create (manual) ───────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Manually create a transaction",
)
async def create_transaction(
    payload:      TransactionCreate,
    current_user: User            = Depends(get_verified_user),
    service:      TransactionService = Depends(_service),
) -> TransactionResponse:
    return await service.create_transaction(current_user.id, payload)


# ── Summary ───────────────────────────────────────────────────────────────────

@router.get(
    "/summary",
    response_model=TransactionSummary,
    summary="Get total income, expenses and net",
)
async def get_summary(
    current_user: User            = Depends(get_verified_user),
    service:      TransactionService = Depends(_service),
) -> TransactionSummary:
    return await service.get_summary(current_user.id)


# ── SMS Scan — Step 1: preview ────────────────────────────────────────────────

@router.post(
    "/scan",
    response_model=ScanResponse,
    summary="AI-scan an SMS or receipt and preview the extracted transaction",
)
async def scan_sms(
    payload:      ScanRequest,
    current_user: User            = Depends(get_verified_user),
    service:      TransactionService = Depends(_service),
) -> ScanResponse:
    """
    Send a raw MTN Mobile Money SMS (or any receipt text) to the AI.
    Returns extracted transaction details for the user to review.

    This is step 1 of the scan → confirm flow.
    Call POST /transactions/scan/confirm to save after reviewing.
    """
    return await service.scan_sms(payload.text)


# ── SMS Scan — Step 2: confirm + save ─────────────────────────────────────────

@router.post(
    "/scan/confirm",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Confirm and save a scanned transaction",
)
async def confirm_scan(
    payload:      ScanConfirmRequest,
    current_user: User            = Depends(get_verified_user),
    service:      TransactionService = Depends(_service),
) -> TransactionResponse:
    """
    User has reviewed the scanned preview and confirmed (with optional edits).
    Saves the transaction with ai_scanned=True and source=sms_scan.

    This is step 2 of the scan → confirm flow.
    """
    return await service.confirm_scan(current_user.id, payload)


# ── Update ────────────────────────────────────────────────────────────────────

@router.patch(
    "/{transaction_id}",
    response_model=TransactionResponse,
    summary="Update a transaction",
)
async def update_transaction(
    transaction_id: uuid.UUID,
    payload:        TransactionUpdate,
    current_user:   User            = Depends(get_verified_user),
    service:        TransactionService = Depends(_service),
) -> TransactionResponse:
    return await service.update_transaction(transaction_id, current_user.id, payload)


# ── Delete ────────────────────────────────────────────────────────────────────

@router.delete(
    "/{transaction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a transaction",
)
async def delete_transaction(
    transaction_id: uuid.UUID,
    current_user:   User            = Depends(get_verified_user),
    service:        TransactionService = Depends(_service),
) -> None:
    await service.delete_transaction(transaction_id, current_user.id)
