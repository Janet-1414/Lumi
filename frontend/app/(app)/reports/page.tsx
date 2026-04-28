'use client'

import React, { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import { PLACEHOLDER_SPENDING } from '@/lib/placeholder-data'

// ─── Placeholder data ─────────────────────────────────────────────────────────

const MONTHLY_DATA = [
  { month: 'Nov', income: 1_600_000, expenses: 1_350_000 },
  { month: 'Dec', income: 1_750_000, expenses: 1_480_000 },
  { month: 'Jan', income: 1_800_000, expenses: 1_240_000 },
  { month: 'Feb', income: 1_800_000, expenses: 1_380_000 },
  { month: 'Mar', income: 1_650_000, expenses: 1_290_000 },
  { month: 'Apr', income: 1_800_000, expenses: 1_240_000 },
]

const AI_SUMMARY = {
  headline:    "April was your best saving month in 6 months! 🎉",
  body:        "You earned UGX 1,800,000 and spent UGX 1,240,000, saving UGX 560,000 — a 31.1% savings rate. That's 11% above your 3-month average and your highest rate since October.",
  top_insight: "Food & dining took 25.8% of your spending this month. Cooking at home 2 more days per week could save you around UGX 48,000 monthly.",
  savings_tip: "Set up an automatic transfer of UGX 360,000 (20% of salary) to your Emergency Fund the moment your salary arrives. Pay yourself first.",
}

const PERIODS = [
  { value: 'this_month',    label: 'This Month' },
  { value: 'last_3_months', label: 'Last 3 Months' },
  { value: 'last_6_months', label: 'Last 6 Months' },
  { value: 'this_year',     label: 'This Year' },
]

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function BarChart({ data }: { data: typeof MONTHLY_DATA }) {
  const maxVal = Math.max(...data.flatMap(d => [d.income, d.expenses]))
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className="bar-chart">
      {data.map((d, i) => {
        const incH = (d.income   / maxVal) * 100
        const expH = (d.expenses / maxVal) * 100
        const isH  = hovered === i

        return (
          <div
            key={d.month}
            className="bar-col"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {isH && (
              <div className="bar-tooltip">
                <div className="tooltip-month">{d.month}</div>
                <div style={{ color: '#1D9E75', fontSize: 11 }}>
                  +{formatCurrency(d.income, 'UGX', true)}
                </div>
                <div style={{ color: '#D85A30', fontSize: 11 }}>
                  -{formatCurrency(d.expenses, 'UGX', true)}
                </div>
                <div style={{ color: '#FAC775', fontSize: 11, fontWeight: 600 }}>
                  Net: {formatCurrency(d.income - d.expenses, 'UGX', true)}
                </div>
              </div>
            )}
            <div className="bar-pair">
              <div
                className="bar bar--income"
                style={{ height: `${incH}%`, opacity: isH ? 1 : 0.85 }}
              />
              <div
                className="bar bar--expense"
                style={{ height: `${expH}%`, opacity: isH ? 1 : 0.85 }}
              />
            </div>
            <div className="bar-label">{d.month}</div>
          </div>
        )
      })}

      <style jsx>{`
        .bar-chart {
          display: flex; align-items: flex-end; gap: 10px;
          height: 180px; padding-bottom: 24px; position: relative;
        }
        .bar-col {
          display: flex; flex-direction: column; align-items: center;
          flex: 1; height: 100%; cursor: pointer; position: relative;
        }
        .bar-tooltip {
          position: absolute; bottom: 110%; left: 50%;
          transform: translateX(-50%);
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 8px; padding: 8px 10px; z-index: 10;
          white-space: nowrap; text-align: left;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .tooltip-month { font-size: 11px; font-weight: 600; color: var(--text-primary); margin-bottom: 3px; }
        .bar-pair {
          display: flex; gap: 3px; align-items: flex-end;
          flex: 1; width: 100%; padding: 0 2px;
        }
        .bar {
          flex: 1; border-radius: 4px 4px 0 0;
          transition: height 0.4s ease, opacity 0.2s;
          min-height: 4px;
        }
        .bar--income  { background: #1D9E75; }
        .bar--expense { background: #D85A30; }
        .bar-label {
          position: absolute; bottom: 0;
          font-size: 10px; color: var(--text-muted); text-align: center;
        }
      `}</style>
    </div>
  )
}

// ─── Mini donut ───────────────────────────────────────────────────────────────

function MiniDonut({ data }: { data: typeof PLACEHOLDER_SPENDING }) {
  const SIZE = 140, RADIUS = 54, STROKE = 18, CENTER = SIZE / 2
  const CIRC = 2 * Math.PI * RADIUS
  let offset = 0
  const segments = data.map(d => {
    const dash = (d.percentage / 100) * CIRC
    const seg  = { ...d, dash, gap: CIRC - dash, offset }
    offset += dash
    return seg
  })

  return (
    <div className="mini-donut">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none"
          stroke="rgba(255,255,255,0.05)" strokeWidth={STROKE} />
        {segments.map(seg => (
          <circle key={seg.category} cx={CENTER} cy={CENTER} r={RADIUS}
            fill="none" stroke={seg.color} strokeWidth={STROKE}
            strokeDasharray={`${seg.dash} ${seg.gap}`}
            strokeDashoffset={-seg.offset} />
        ))}
      </svg>
      <style jsx>{`
        .mini-donut { flex-shrink: 0; }
      `}</style>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [period, setPeriod] = useState('this_month')

  const currentData = MONTHLY_DATA[MONTHLY_DATA.length - 1]
  const totalIncome   = currentData.income
  const totalExpenses = currentData.expenses
  const netSavings    = totalIncome - totalExpenses
  const savingsRate   = (netSavings / totalIncome * 100)

  return (
    <AppShell userName="Akosua">
      <div className="rep-page">

        {/* Period selector */}
        <div className="period-row">
          {PERIODS.map(p => (
            <button
              key={p.value}
              className={`period-btn ${period === p.value ? 'period-btn--active' : ''}`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Summary cards */}
        <div className="sum-grid">
          {[
            { label: 'Total Income',   val: totalIncome,   color: '#1D9E75', icon: '📈' },
            { label: 'Total Expenses', val: totalExpenses, color: '#D85A30', icon: '📉' },
            { label: 'Net Savings',    val: netSavings,    color: '#FAC775', icon: '💰' },
            { label: 'Savings Rate',   val: null,          color: '#AFA9EC', icon: '🎯', pct: savingsRate },
          ].map((s) => (
            <div key={s.label} className="sum-card">
              <div className="sum-icon">{s.icon}</div>
              <div className="sum-val" style={{ color: s.color }}>
                {s.pct !== undefined
                  ? formatPercent(s.pct)
                  : formatCurrency(s.val!, 'UGX', true)}
              </div>
              <div className="sum-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bar chart card */}
        <div className="card">
          <div className="card-head">
            <h2 className="card-title">Income vs Expenses</h2>
            <div className="legend-row">
              <span className="legend-dot" style={{ background: '#1D9E75' }} />Income
              <span className="legend-dot" style={{ background: '#D85A30', marginLeft: 10 }} />Expenses
            </div>
          </div>
          <BarChart data={MONTHLY_DATA} />
        </div>

        {/* Category breakdown */}
        <div className="card">
          <h2 className="card-title">Spending by category</h2>
          <p className="card-sub">This month · hover bars to see amounts</p>
          <div className="cat-layout">
            <MiniDonut data={PLACEHOLDER_SPENDING} />
            <div className="cat-list">
              {PLACEHOLDER_SPENDING.map(s => (
                <div key={s.category} className="cat-row">
                  <div className="cat-bar-bg">
                    <div className="cat-bar-fill"
                      style={{ width: `${s.percentage}%`, background: s.color }} />
                  </div>
                  <span className="cat-pct" style={{ color: s.color }}>
                    {formatPercent(s.percentage, 0)}
                  </span>
                  <span className="cat-name">
                    {s.category.charAt(0).toUpperCase() + s.category.slice(1).replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Summary */}
        <div className="ai-card">
          <div className="ai-header">
            <div className="ai-avatar">💡</div>
            <div>
              <div className="ai-from">Lumi AI Report</div>
              <div className="ai-period">{PERIODS.find(p => p.value === period)?.label}</div>
            </div>
          </div>
          <h3 className="ai-headline">{AI_SUMMARY.headline}</h3>
          <p className="ai-body">{AI_SUMMARY.body}</p>

          <div className="ai-insight-row">
            <div className="ai-insight-card">
              <div className="ai-insight-label">📊 Top category insight</div>
              <p className="ai-insight-text">{AI_SUMMARY.top_insight}</p>
            </div>
            <div className="ai-insight-card">
              <div className="ai-insight-label">💡 Savings tip</div>
              <p className="ai-insight-text">{AI_SUMMARY.savings_tip}</p>
            </div>
          </div>
        </div>

      </div>

      <style jsx>{`
        .rep-page { display: flex; flex-direction: column; gap: 1.25rem; padding-top: 1.5rem; }

        /* Period */
        .period-row { display: flex; gap: 6px; flex-wrap: wrap; }
        .period-btn {
          padding: 7px 14px; border-radius: 20px;
          background: var(--bg-card); border: 1px solid var(--border);
          font-family: var(--font-body); font-size: 13px;
          color: var(--text-secondary); cursor: pointer; transition: all 0.18s;
        }
        .period-btn:hover { border-color: var(--border-focus); color: var(--text-primary); }
        .period-btn--active {
          background: linear-gradient(135deg, #FAC775, #EF9F27);
          border-color: transparent; color: #1a0f00; font-weight: 600;
        }

        /* Summary grid */
        .sum-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
        .sum-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-md); padding: 1rem 1.1rem;
        }
        .sum-icon { font-size: 20px; margin-bottom: 6px; }
        .sum-val { font-family: var(--font-head); font-size: 17px; font-weight: 700; }
        .sum-lbl { font-size: 11.5px; color: var(--text-muted); margin-top: 2px; }

        /* Card */
        .card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 1.25rem;
        }
        .card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
        .card-title { font-family: var(--font-head); font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 2px; }
        .card-sub { font-size: 12px; color: var(--text-muted); margin: 0 0 1rem; }
        .legend-row { display: flex; align-items: center; font-size: 12px; color: var(--text-secondary); }
        .legend-dot { width: 8px; height: 8px; border-radius: 2px; display: inline-block; margin-right: 4px; }

        /* Category layout */
        .cat-layout { display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap; }
        .cat-list { flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 180px; }
        .cat-row { display: flex; align-items: center; gap: 8px; }
        .cat-bar-bg { flex: 1; height: 5px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
        .cat-bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
        .cat-pct { font-size: 11px; font-weight: 700; width: 32px; text-align: right; flex-shrink: 0; }
        .cat-name { font-size: 11.5px; color: var(--text-secondary); width: 100px; flex-shrink: 0; }

        /* AI card */
        .ai-card {
          background: linear-gradient(135deg, rgba(250,199,117,0.07), rgba(29,158,117,0.04));
          border: 1px solid rgba(250,199,117,0.2);
          border-radius: var(--radius-lg); padding: 1.25rem;
        }
        .ai-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .ai-avatar {
          width: 32px; height: 32px; border-radius: 8px;
          background: linear-gradient(135deg, #FAC775, #EF9F27);
          display: flex; align-items: center; justify-content: center; font-size: 16px;
        }
        .ai-from   { font-size: 12px; font-weight: 600; color: var(--gold); }
        .ai-period { font-size: 11px; color: var(--text-muted); }
        .ai-headline {
          font-family: var(--font-head); font-size: 16px; font-weight: 700;
          color: var(--text-primary); margin-bottom: 8px;
        }
        .ai-body { font-size: 13.5px; color: var(--text-secondary); line-height: 1.65; margin-bottom: 14px; }
        .ai-insight-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .ai-insight-card {
          background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle);
          border-radius: 10px; padding: 12px;
        }
        .ai-insight-label { font-size: 11.5px; font-weight: 600; color: var(--text-secondary); margin-bottom: 5px; }
        .ai-insight-text  { font-size: 12.5px; color: var(--text-secondary); line-height: 1.6; }

        @media (max-width: 900px) { .sum-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 600px) {
          .sum-grid { grid-template-columns: 1fr 1fr; }
          .ai-insight-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </AppShell>
  )
}
