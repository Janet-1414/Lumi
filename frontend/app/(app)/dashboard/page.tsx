'use client'

import React from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { StatCard } from '@/components/dashboard/StatCard'
import { SpendingChart } from '@/components/dashboard/SpendingChart'
import { AIInsightBanner } from '@/components/dashboard/AIInsightBanner'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { useDashboard } from '@/hooks/useDashboard'

/**
 * Dashboard page — the main home screen of the Lumi app.
 *
 * Layout:
 *   ┌─ Stat cards row (balance, income, expenses, savings) ─┐
 *   ├─ AI Insight banner ───────────────────────────────────┤
 *   ├─ Spending chart │ Recent transactions ────────────────┤
 *   └───────────────────────────────────────────────────────┘
 */
export default function DashboardPage() {
  const { stats, transactions, spending, insight, loading } = useDashboard()

  return (
    <AppShell userName="Akosua">
      <div className="dash">

        {/* ── Stat cards ────────────────────────────────────────────────── */}
        <section className="stat-grid" aria-label="Financial summary">
          <StatCard
            label="Total Balance"
            value={stats.total_balance}
            currency={stats.currency}
            changePct={stats.balance_change_pct}
            icon="💰"
            accent="gold"
          />
          <StatCard
            label="Monthly Income"
            value={stats.monthly_income}
            currency={stats.currency}
            changePct={stats.income_change_pct}
            icon="📈"
            accent="teal"
          />
          <StatCard
            label="Monthly Expenses"
            value={stats.monthly_expenses}
            currency={stats.currency}
            changePct={stats.expense_change_pct}
            icon="📉"
            accent="red"
          />
          <StatCard
            label="Savings Rate"
            value={stats.savings_rate}
            changePct={undefined}
            icon="🎯"
            accent="purple"
            // Savings rate is a %, override formatCurrency
          />
        </section>

        {/* ── AI Insight ────────────────────────────────────────────────── */}
        <section aria-label="AI insight">
          <AIInsightBanner insight={insight} loading={loading} />
        </section>

        {/* ── Chart + Transactions row ───────────────────────────────────── */}
        <section className="main-row">

          {/* Spending breakdown */}
          <div className="card chart-card">
            <h2 className="card-title">Spending breakdown</h2>
            <p className="card-sub">This month</p>
            <SpendingChart data={spending} currency={stats.currency} />
          </div>

          {/* Recent transactions */}
          <div className="card tx-card">
            <h2 className="card-title">Recent transactions</h2>
            <p className="card-sub">Your latest activity</p>
            <RecentTransactions transactions={transactions} loading={loading} />
          </div>

        </section>

      </div>

      <style jsx>{`
        .dash {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding-top: 1.5rem;
        }

        /* ── Stat grid ── */
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        /* ── Card base ── */
        .card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
        }
        .card-title {
          font-family: var(--font-head);
          font-size: 16px; font-weight: 600;
          color: var(--text-primary); margin: 0 0 2px;
        }
        .card-sub {
          font-size: 12px; color: var(--text-muted);
          margin: 0 0 1.25rem;
        }

        /* ── Main two-column row ── */
        .main-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        /* ── Responsive ── */
        @media (max-width: 1100px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .stat-grid  { grid-template-columns: 1fr 1fr; }
          .main-row   { grid-template-columns: 1fr; }
        }

        @media (max-width: 480px) {
          .stat-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </AppShell>
  )
}
