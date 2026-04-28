'use client'

import React from 'react'
import Link from 'next/link'
import type { Transaction } from '@/types/dashboard.types'
import { getCategoryMeta } from '@/lib/categories'
import { formatCurrency, formatRelativeDate, groupByDate } from '@/lib/formatters'

interface RecentTransactionsProps {
  transactions: Transaction[]
  loading?:     boolean
}

/**
 * RecentTransactions — displays the last N transactions grouped by date.
 * AI-scanned transactions show a gold "AI" badge.
 */
export function RecentTransactions({
  transactions,
  loading = false,
}: RecentTransactionsProps) {
  const grouped = groupByDate(transactions)

  if (loading) {
    return (
      <div className="tx-skeleton">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="tx-skel-row">
            <div className="tx-skel-icon" />
            <div style={{ flex: 1 }}>
              <div className="tx-skel-line" style={{ width: '55%' }} />
              <div className="tx-skel-line" style={{ width: '30%', marginTop: 5 }} />
            </div>
            <div className="tx-skel-line" style={{ width: 70 }} />
          </div>
        ))}
        <style jsx>{`
          .tx-skeleton { display: flex; flex-direction: column; gap: 12px; }
          .tx-skel-row { display: flex; align-items: center; gap: 12px; }
          .tx-skel-icon { width: 38px; height: 38px; border-radius: 10px; background: rgba(255,255,255,0.06); flex-shrink:0; animation: pulse 1.4s infinite; }
          .tx-skel-line { height: 11px; background: rgba(255,255,255,0.06); border-radius: 6px; animation: pulse 1.4s infinite; }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        `}</style>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="tx-empty">
        <span>🧾</span>
        <p>No transactions yet. Add your first one!</p>
      </div>
    )
  }

  return (
    <div className="tx-root">
      {Object.entries(grouped).map(([dateLabel, items]) => (
        <div key={dateLabel} className="tx-group">
          <div className="tx-date-label">{dateLabel}</div>

          {items.map((tx) => {
            const meta      = getCategoryMeta(tx.category)
            const isIncome  = tx.type === 'income'

            return (
              <div key={tx.id} className="tx-row">
                {/* Icon */}
                <div
                  className="tx-icon"
                  style={{ background: meta.bgColor }}
                >
                  <span style={{ fontSize: 16 }}>{meta.emoji}</span>
                </div>

                {/* Description + category */}
                <div className="tx-info">
                  <div className="tx-desc">
                    {tx.description}
                    {tx.ai_scanned && (
                      <span className="tx-ai-badge">AI</span>
                    )}
                  </div>
                  <div className="tx-cat">{meta.label}</div>
                </div>

                {/* Amount */}
                <div
                  className="tx-amount"
                  style={{ color: isIncome ? 'var(--teal)' : 'var(--text-primary)' }}
                >
                  {isIncome ? '+' : '-'}
                  {formatCurrency(tx.amount, tx.currency, true)}
                </div>
              </div>
            )
          })}
        </div>
      ))}

      <Link href="/transactions" className="tx-see-all">
        See all transactions →
      </Link>

      <style jsx>{`
        .tx-root { display: flex; flex-direction: column; }

        .tx-empty {
          display: flex; flex-direction: column;
          align-items: center; gap: 8px;
          padding: 2rem;
          color: var(--text-muted);
          font-size: 13px; text-align: center;
        }
        .tx-empty span { font-size: 28px; }

        .tx-group { margin-bottom: 1rem; }

        .tx-date-label {
          font-size: 11px; font-weight: 600;
          color: var(--text-muted);
          letter-spacing: 0.06em; text-transform: uppercase;
          margin-bottom: 8px; padding: 0 4px;
        }

        .tx-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 8px; border-radius: 10px;
          transition: background 0.15s;
          cursor: pointer;
        }
        .tx-row:hover { background: rgba(255,255,255,0.03); }

        .tx-icon {
          width: 38px; height: 38px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .tx-info { flex: 1; min-width: 0; }
        .tx-desc {
          display: flex; align-items: center; gap: 6px;
          font-size: 13.5px; font-weight: 500;
          color: var(--text-primary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .tx-ai-badge {
          font-size: 9px; font-weight: 700;
          background: rgba(250,199,117,0.15);
          color: var(--gold);
          padding: 1px 5px; border-radius: 4px;
          letter-spacing: 0.05em; flex-shrink: 0;
        }
        .tx-cat {
          font-size: 11.5px; color: var(--text-muted); margin-top: 2px;
        }

        .tx-amount {
          font-family: var(--font-head);
          font-size: 13.5px; font-weight: 600;
          white-space: nowrap;
        }

        .tx-see-all {
          display: block; text-align: center;
          font-size: 13px; color: var(--gold);
          text-decoration: none; font-weight: 500;
          padding: 10px;
          border-top: 1px solid var(--border);
          margin-top: 0.5rem;
          transition: color 0.2s;
        }
        .tx-see-all:hover { color: var(--gold-dark); }
      `}</style>
    </div>
  )
}
