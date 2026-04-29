'use client'

import { useState } from 'react'
import { CategoryIcon } from './CategoryIcon'
import { formatCurrency, formatTime } from '@/lib/formatters'
import { getCategoryMeta } from '@/lib/categories'
import type { Transaction } from '@/types/dashboard.types'

interface TransactionItemProps {
  transaction: Transaction
  onEdit?:     (tx: Transaction) => void
  onDelete?:   (id: string) => void
}

/**
 * TransactionItem — a single row in the transaction list.
 * Shows category icon, description, amount, AI badge if scanned.
 * Has an optional 3-dot menu for edit and delete.
 */
export function TransactionItem({ transaction: tx, onEdit, onDelete }: TransactionItemProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const meta     = getCategoryMeta(tx.category)
  const isIncome = tx.type === 'income'

  return (
    <div
      className="tx-item"
      onMouseLeave={() => setMenuOpen(false)}
    >
      {/* Category icon */}
      <CategoryIcon category={tx.category} size={40} />

      {/* Description + meta */}
      <div className="tx-body">
        <div className="tx-desc-row">
          <span className="tx-desc">{tx.description}</span>
          <div className="tx-badges">
            {tx.ai_scanned && (
              <span className="tx-badge tx-badge--ai" title="Auto-logged by Lumi AI">
                ✨ AI
              </span>
            )}
            {tx.source === 'sms_scan' && (
              <span className="tx-badge tx-badge--sms" title="Scanned from SMS">
                📱 MTN
              </span>
            )}
          </div>
        </div>
        <div className="tx-meta">
          <span>{meta.label}</span>
          <span className="tx-dot">·</span>
          <span>{formatTime(tx.created_at)}</span>
        </div>
      </div>

      {/* Amount + actions */}
      <div className="tx-right">
        <div
          className="tx-amount"
          style={{ color: isIncome ? 'var(--teal)' : 'var(--text-primary)' }}
        >
          {isIncome ? '+' : '−'}
          {formatCurrency(tx.amount, tx.currency, true)}
        </div>

        {(onEdit || onDelete) && (
          <div className="tx-menu-wrap">
            <button
              className="tx-menu-btn"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Transaction options"
            >
              ···
            </button>

            {menuOpen && (
              <div className="tx-menu" role="menu">
                {onEdit && (
                  <button
                    className="tx-menu-item"
                    role="menuitem"
                    onClick={() => { onEdit(tx); setMenuOpen(false) }}
                  >
                    ✏️ Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    className="tx-menu-item tx-menu-item--danger"
                    role="menuitem"
                    onClick={() => { onDelete(tx.id); setMenuOpen(false) }}
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .tx-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 8px;
          border-radius: 10px;
          transition: background 0.15s;
          position: relative;
        }
        .tx-item:hover { background: rgba(255,255,255,0.03); }

        .tx-body { flex: 1; min-width: 0; }

        .tx-desc-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 3px;
        }
        .tx-desc {
          font-size: 13.5px;
          font-weight: 500;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 220px;
        }

        .tx-badges { display: flex; gap: 4px; flex-shrink: 0; }
        .tx-badge {
          font-size: 9.5px;
          font-weight: 700;
          padding: 1.5px 6px;
          border-radius: 4px;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }
        .tx-badge--ai  { background: rgba(250,199,117,0.15); color: var(--gold); }
        .tx-badge--sms { background: rgba(93,202,165,0.15);  color: var(--teal); }

        .tx-meta {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          color: var(--text-muted);
        }
        .tx-dot { opacity: 0.4; }

        .tx-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          flex-shrink: 0;
        }
        .tx-amount {
          font-family: var(--font-head);
          font-size: 14px;
          font-weight: 600;
        }

        .tx-menu-wrap { position: relative; }
        .tx-menu-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          font-size: 14px;
          padding: 2px 5px;
          border-radius: 4px;
          letter-spacing: 2px;
          line-height: 1;
          transition: color 0.15s, background 0.15s;
        }
        .tx-menu-btn:hover {
          color: var(--gold);
          background: rgba(250,199,117,0.08);
        }

        .tx-menu {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 4px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          min-width: 130px;
          z-index: 20;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          overflow: hidden;
        }
        .tx-menu-item {
          display: flex;
          align-items: center;
          gap: 7px;
          width: 100%;
          padding: 10px 14px;
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--text-secondary);
          text-align: left;
          transition: background 0.15s, color 0.15s;
        }
        .tx-menu-item:hover {
          background: rgba(255,255,255,0.04);
          color: var(--text-primary);
        }
        .tx-menu-item--danger { color: var(--red); }
        .tx-menu-item--danger:hover {
          background: rgba(216,90,48,0.08);
          color: var(--red);
        }
      `}</style>
    </div>
  )
}
