'use client'

import React, { useState } from 'react'
import type { Transaction } from '@/types/dashboard.types'
import { getCategoryMeta } from '@/lib/categories'
import { formatCurrency, formatRelativeDate, formatTime, groupByDate } from '@/lib/formatters'

// ─── TransactionItem ─────────────────────────────────────────────────────────

interface TransactionItemProps {
  transaction: Transaction
  onEdit?:     (tx: Transaction) => void
  onDelete?:   (id: string) => void
}

export function TransactionItem({
  transaction: tx,
  onEdit,
  onDelete,
}: TransactionItemProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const meta     = getCategoryMeta(tx.category)
  const isIncome = tx.type === 'income'

  return (
    <div
      className="tx-item"
      onMouseLeave={() => setMenuOpen(false)}
    >
      {/* Category icon */}
      <div
        className="tx-icon"
        style={{ background: meta.bgColor }}
        aria-hidden="true"
      >
        <span style={{ fontSize: 17 }}>{meta.emoji}</span>
      </div>

      {/* Description + meta */}
      <div className="tx-body">
        <div className="tx-desc-row">
          <span className="tx-desc">{tx.description}</span>
          <div className="tx-badges">
            {tx.ai_scanned && (
              <span className="badge badge--ai" title="Auto-logged by Lumi AI">
                ✨ AI
              </span>
            )}
            {tx.source === 'sms_scan' && (
              <span className="badge badge--sms" title="Scanned from SMS">
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
          {isIncome ? '+' : '-'}
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
              <div className="tx-menu">
                {onEdit && (
                  <button className="tx-menu-item" onClick={() => { onEdit(tx); setMenuOpen(false) }}>
                    ✏️ Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    className="tx-menu-item tx-menu-item--danger"
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
          display: flex; align-items: center; gap: 12px;
          padding: 11px 8px; border-radius: 10px;
          transition: background 0.15s;
          position: relative;
        }
        .tx-item:hover { background: rgba(255,255,255,0.03); }

        .tx-icon {
          width: 40px; height: 40px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .tx-body { flex: 1; min-width: 0; }
        .tx-desc-row {
          display: flex; align-items: center; gap: 6px;
          margin-bottom: 3px;
        }
        .tx-desc {
          font-size: 13.5px; font-weight: 500; color: var(--text-primary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 240px;
        }
        .tx-badges { display: flex; gap: 4px; flex-shrink: 0; }
        .badge {
          font-size: 9.5px; font-weight: 700;
          padding: 1.5px 6px; border-radius: 4px;
          letter-spacing: 0.04em;
        }
        .badge--ai  { background: rgba(250,199,117,0.15); color: var(--gold); }
        .badge--sms { background: rgba(93,202,165,0.15);  color: var(--teal); }
        .tx-meta {
          display: flex; align-items: center; gap: 5px;
          font-size: 11.5px; color: var(--text-muted);
        }
        .tx-dot { opacity: 0.4; }

        .tx-right {
          display: flex; flex-direction: column;
          align-items: flex-end; gap: 4px; flex-shrink: 0;
        }
        .tx-amount {
          font-family: var(--font-head);
          font-size: 14px; font-weight: 600;
        }

        .tx-menu-wrap { position: relative; }
        .tx-menu-btn {
          background: none; border: none; cursor: pointer;
          color: var(--text-muted); font-size: 15px;
          padding: 2px 5px; border-radius: 4px;
          transition: color 0.15s, background 0.15s;
          letter-spacing: 2px; line-height: 1;
        }
        .tx-menu-btn:hover { color: var(--gold); background: rgba(250,199,117,0.08); }
        .tx-menu {
          position: absolute; right: 0; top: 100%; margin-top: 4px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          min-width: 130px; z-index: 20;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          overflow: hidden;
        }
        .tx-menu-item {
          display: flex; align-items: center; gap: 7px;
          width: 100%; padding: 10px 14px;
          background: none; border: none; cursor: pointer;
          font-family: var(--font-body); font-size: 13px;
          color: var(--text-secondary); text-align: left;
          transition: background 0.15s, color 0.15s;
        }
        .tx-menu-item:hover { background: rgba(255,255,255,0.04); color: var(--text-primary); }
        .tx-menu-item--danger { color: var(--red); }
        .tx-menu-item--danger:hover { background: rgba(216,90,48,0.08); color: var(--red); }
      `}</style>
    </div>
  )
}

// ─── TransactionList ─────────────────────────────────────────────────────────

interface TransactionListProps {
  transactions: Transaction[]
  loading?:     boolean
  onEdit?:      (tx: Transaction) => void
  onDelete?:    (id: string) => void
}

export function TransactionList({
  transactions,
  loading = false,
  onEdit,
  onDelete,
}: TransactionListProps) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 4px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(255,255,255,0.05)', flexShrink: 0, animation: 'pulse 1.4s infinite' }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 12, width: '55%', background: 'rgba(255,255,255,0.05)', borderRadius: 6, marginBottom: 6, animation: 'pulse 1.4s infinite' }} />
              <div style={{ height: 10, width: '30%', background: 'rgba(255,255,255,0.04)', borderRadius: 6, animation: 'pulse 1.4s infinite' }} />
            </div>
            <div style={{ height: 14, width: 70, background: 'rgba(255,255,255,0.05)', borderRadius: 6, animation: 'pulse 1.4s infinite' }} />
          </div>
        ))}
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🧾</div>
        <p style={{ fontSize: 14 }}>No transactions found</p>
        <p style={{ fontSize: 12, marginTop: 4 }}>Try adjusting your filters or add your first transaction</p>
      </div>
    )
  }

  const grouped = groupByDate(transactions)

  return (
    <div>
      {Object.entries(grouped).map(([label, items]) => (
        <div key={label} style={{ marginBottom: '1.25rem' }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            marginBottom: 6, padding: '0 8px',
          }}>
            {label}
          </div>
          {items.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx as Transaction}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
