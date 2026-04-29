'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/formatters'

interface BarData {
  month:    string
  income:   number
  expenses: number
}

interface BarChartProps {
  data:      BarData[]
  currency?: string
}

/**
 * BarChart — SVG-free bar chart using CSS.
 * Shows income (teal) vs expenses (red) side by side per month.
 * Hover shows a tooltip with exact amounts.
 */
export function BarChart({ data, currency = 'UGX' }: BarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const maxVal = Math.max(...data.flatMap((d) => [d.income, d.expenses]), 1)

  return (
    <div className="bar-chart-root">
      {/* Y-axis labels */}
      <div className="bar-y-axis">
        {[100, 75, 50, 25, 0].map((pct) => (
          <span key={pct} className="bar-y-label">
            {formatCurrency((maxVal * pct) / 100, currency, true)}
          </span>
        ))}
      </div>

      {/* Bars */}
      <div className="bar-area">
        {data.map((d, i) => {
          const incH = (d.income   / maxVal) * 100
          const expH = (d.expenses / maxVal) * 100
          const isH  = hovered === i
          const net  = d.income - d.expenses

          return (
            <div
              key={d.month}
              className="bar-col"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Tooltip */}
              {isH && (
                <div className="bar-tooltip">
                  <div className="bar-tooltip-month">{d.month}</div>
                  <div style={{ color: '#1D9E75', fontSize: 11 }}>
                    +{formatCurrency(d.income, currency, true)}
                  </div>
                  <div style={{ color: '#D85A30', fontSize: 11 }}>
                    −{formatCurrency(d.expenses, currency, true)}
                  </div>
                  <div style={{ color: net >= 0 ? '#FAC775' : '#D85A30', fontSize: 11, fontWeight: 700, marginTop: 2 }}>
                    Net: {net >= 0 ? '+' : ''}{formatCurrency(net, currency, true)}
                  </div>
                </div>
              )}

              {/* Bar pair */}
              <div className="bar-pair">
                <div
                  className="bar bar--income"
                  style={{ height: `${incH}%`, opacity: isH ? 1 : 0.82 }}
                />
                <div
                  className="bar bar--expense"
                  style={{ height: `${expH}%`, opacity: isH ? 1 : 0.82 }}
                />
              </div>

              <div className="bar-label">{d.month}</div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="bar-legend">
        <span className="bar-legend-dot" style={{ background: '#1D9E75' }} />
        <span className="bar-legend-text">Income</span>
        <span className="bar-legend-dot" style={{ background: '#D85A30', marginLeft: 12 }} />
        <span className="bar-legend-text">Expenses</span>
      </div>

      <style jsx>{`
        .bar-chart-root {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .bar-y-axis {
          display: flex;
          justify-content: space-between;
          padding: 0 4px;
        }
        .bar-y-label {
          font-size: 10px;
          color: var(--text-muted);
        }

        .bar-area {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          height: 180px;
          padding: 0 4px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .bar-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          position: relative;
          cursor: pointer;
        }

        .bar-pair {
          display: flex;
          gap: 3px;
          align-items: flex-end;
          width: 100%;
          flex: 1;
          padding: 0 2px;
        }

        .bar {
          flex: 1;
          border-radius: 4px 4px 0 0;
          min-height: 4px;
          transition: height 0.4s ease, opacity 0.18s;
        }
        .bar--income  { background: #1D9E75; }
        .bar--expense { background: #D85A30; }

        .bar-label {
          font-size: 10.5px;
          color: var(--text-muted);
          margin-top: 5px;
          text-align: center;
        }

        .bar-tooltip {
          position: absolute;
          bottom: 110%;
          left: 50%;
          transform: translateX(-50%);
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px 10px;
          z-index: 20;
          white-space: nowrap;
          text-align: left;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          pointer-events: none;
        }
        .bar-tooltip-month {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .bar-legend {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: var(--text-secondary);
          padding: 0 4px;
        }
        .bar-legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 2px;
          display: inline-block;
          flex-shrink: 0;
        }
        .bar-legend-text { font-size: 12px; }
      `}</style>
    </div>
  )
}
