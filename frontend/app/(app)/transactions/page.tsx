'use client'

import React, { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { FilterPills } from '@/components/transactions/FilterPills'
import { SMSScanner } from '@/components/transactions/SMSScanner'
import { TransactionList } from '@/components/transactions/TransactionList'
import { useTransactions } from '@/hooks/useTransactions'
import { formatCurrency } from '@/lib/formatters'

/**
 * Transactions page — full list with filters, search, SMS scanner, and AI insight.
 *
 * Layout:
 *  ┌─ Summary cards (income / expenses / net) ─────────────────────┐
 *  ├─ SMS Scanner (expandable) ────────────────────────────────────┤
 *  ├─ Search + Filter pills ────────────────────────────────────────┤
 *  ├─ Transaction list grouped by date ────────────────────────────┤
 *  └─ Pagination ───────────────────────────────────────────────────┘
 */
export default function TransactionsPage() {
  const {
    transactions, loading, filter, setFilter,
    search, setSearch, page, hasNext, total,
    nextPage, prevPage, refetch,
  } = useTransactions()

  // Quick summary totals from visible transactions
  const income   = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const net      = income - expenses

  return (
    <AppShell userName="Akosua">
      <div className="tx-page">

        {/* ── Summary cards ─────────────────────────────────────────── */}
        <section className="summary-grid" aria-label="Transaction summary">
          <div className="summary-card">
            <span className="summary-emoji">📈</span>
            <div>
              <div className="summary-val summary-val--teal">
                +{formatCurrency(income, 'UGX', true)}
              </div>
              <div className="summary-label">Income</div>
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-emoji">📉</span>
            <div>
              <div className="summary-val summary-val--red">
                -{formatCurrency(expenses, 'UGX', true)}
              </div>
              <div className="summary-label">Expenses</div>
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-emoji">{net >= 0 ? '✅' : '⚠️'}</span>
            <div>
              <div className={`summary-val ${net >= 0 ? 'summary-val--teal' : 'summary-val--red'}`}>
                {net >= 0 ? '+' : ''}{formatCurrency(net, 'UGX', true)}
              </div>
              <div className="summary-label">Net</div>
            </div>
          </div>
        </section>

        {/* ── SMS Scanner ────────────────────────────────────────────── */}
        <section aria-label="SMS Scanner">
          <SMSScanner onTransactionSaved={refetch} />
        </section>

        {/* ── Search ────────────────────────────────────────────────── */}
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="search"
            placeholder="Search transactions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search transactions"
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>

        {/* ── Filters ───────────────────────────────────────────────── */}
        <section aria-label="Transaction filters">
          <FilterPills active={filter} onChange={setFilter} />
        </section>

        {/* ── Transaction list ───────────────────────────────────────── */}
        <section className="list-card" aria-label="Transaction list">
          <div className="list-header">
            <h2 className="list-title">
              {filter === 'all' ? 'All transactions' : `Filtered transactions`}
            </h2>
            <span className="list-count">{total} total</span>
          </div>

          <TransactionList
            transactions={transactions}
            loading={loading}
            onDelete={async (id) => {
              try {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/${id}`, {
                  method: 'DELETE', credentials: 'include',
                })
                refetch()
              } catch { /* handled silently */ }
            }}
          />

          {/* ── Pagination ── */}
          {(page > 1 || hasNext) && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={prevPage}
                disabled={page === 1}
                aria-label="Previous page"
              >
                ← Prev
              </button>
              <span className="page-indicator">Page {page}</span>
              <button
                className="page-btn"
                onClick={nextPage}
                disabled={!hasNext}
                aria-label="Next page"
              >
                Next →
              </button>
            </div>
          )}
        </section>

      </div>

      <style jsx>{`
        .tx-page {
          display: flex; flex-direction: column; gap: 1.25rem;
          padding-top: 1.5rem;
        }

        /* ── Summary ── */
        .summary-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
        }
        .summary-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-md); padding: 1rem 1.1rem;
          display: flex; align-items: center; gap: 12px;
          transition: transform 0.15s;
        }
        .summary-card:hover { transform: translateY(-1px); }
        .summary-emoji { font-size: 20px; }
        .summary-val {
          font-family: var(--font-head); font-size: 17px; font-weight: 700;
        }
        .summary-val--teal { color: var(--teal); }
        .summary-val--red  { color: var(--red);  }
        .summary-label { font-size: 11.5px; color: var(--text-muted); margin-top: 2px; }

        /* ── Search ── */
        .search-wrap {
          position: relative; display: flex; align-items: center;
        }
        .search-icon {
          position: absolute; left: 13px; font-size: 14px; pointer-events: none;
        }
        .search-input {
          width: 100%;
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 10px 38px 10px 38px;
          font-family: var(--font-body); font-size: 13.5px;
          color: var(--text-primary); outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .search-input:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px var(--gold-glow-sm);
        }
        .search-input::placeholder { color: var(--text-muted); }
        .search-clear {
          position: absolute; right: 12px;
          background: none; border: none; cursor: pointer;
          color: var(--text-muted); font-size: 13px;
          transition: color 0.15s;
        }
        .search-clear:hover { color: var(--text-primary); }

        /* ── List card ── */
        .list-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 1.25rem;
        }
        .list-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1rem;
        }
        .list-title {
          font-family: var(--font-head); font-size: 15px; font-weight: 600;
          color: var(--text-primary); margin: 0;
        }
        .list-count {
          font-size: 12px; color: var(--text-muted);
          background: rgba(255,255,255,0.04);
          padding: 2px 8px; border-radius: 20px;
        }

        /* ── Pagination ── */
        .pagination {
          display: flex; align-items: center; justify-content: center; gap: 12px;
          margin-top: 1.25rem; padding-top: 1rem;
          border-top: 1px solid var(--border);
        }
        .page-btn {
          background: var(--bg-input); border: 1px solid var(--border);
          border-radius: var(--radius-sm); padding: 7px 16px;
          font-family: var(--font-body); font-size: 13px;
          color: var(--text-secondary); cursor: pointer;
          transition: all 0.2s;
        }
        .page-btn:hover:not(:disabled) {
          border-color: var(--gold); color: var(--gold);
        }
        .page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .page-indicator { font-size: 13px; color: var(--text-muted); }

        /* ── Responsive ── */
        @media (max-width: 600px) {
          .summary-grid { grid-template-columns: 1fr; gap: 8px; }
        }
      `}</style>
    </AppShell>
  )
}
