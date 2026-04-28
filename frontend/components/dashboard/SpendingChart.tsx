'use client'

import React, { useState } from 'react'
import type { CategorySpend } from '@/types/dashboard.types'
import { getCategoryMeta } from '@/lib/categories'
import { formatCurrency, formatPercent } from '@/lib/formatters'

interface SpendingChartProps {
  data:     CategorySpend[]
  currency?: string
}

const SIZE     = 180
const RADIUS   = 72
const STROKE   = 22
const CENTER   = SIZE / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * SpendingChart — SVG donut chart showing spending by category.
 * Hover a segment to highlight it and show the amount.
 */
export function SpendingChart({ data, currency = 'UGX' }: SpendingChartProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  // Build donut segments
  let offset = 0
  const segments = data.map((item) => {
    const dash = (item.percentage / 100) * CIRCUMFERENCE
    const gap  = CIRCUMFERENCE - dash
    const seg  = { ...item, dash, gap, offset }
    offset += dash
    return seg
  })

  const hoveredItem = data.find((d) => d.category === hovered)
  const total = data.reduce((s, d) => s + d.amount, 0)

  return (
    <div className="chart-wrap">
      {/* Donut */}
      <div className="donut-wrap">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background ring */}
          <circle
            cx={CENTER} cy={CENTER} r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={STROKE}
          />

          {segments.map((seg) => (
            <circle
              key={seg.category}
              cx={CENTER} cy={CENTER} r={RADIUS}
              fill="none"
              stroke={seg.color}
              strokeWidth={hovered === seg.category ? STROKE + 4 : STROKE}
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="butt"
              style={{
                opacity: hovered && hovered !== seg.category ? 0.35 : 1,
                transition: 'opacity 0.2s, stroke-width 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHovered(seg.category)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="donut-center">
          {hoveredItem ? (
            <>
              <div className="donut-center-emoji">
                {getCategoryMeta(hoveredItem.category).emoji}
              </div>
              <div className="donut-center-pct" style={{ color: hoveredItem.color }}>
                {formatPercent(hoveredItem.percentage, 0)}
              </div>
            </>
          ) : (
            <>
              <div className="donut-center-sub">Total</div>
              <div className="donut-center-val">
                {formatCurrency(total, currency, true)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="legend">
        {data.map((item) => {
          const meta = getCategoryMeta(item.category)
          return (
            <div
              key={item.category}
              className={['legend-item', hovered === item.category ? 'legend-item--active' : ''].join(' ')}
              onMouseEnter={() => setHovered(item.category)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="legend-dot" style={{ background: item.color }} />
              <span className="legend-label">{meta.label}</span>
              <span className="legend-pct" style={{ color: item.color }}>
                {formatPercent(item.percentage, 0)}
              </span>
            </div>
          )
        })}
      </div>

      <style jsx>{`
        .chart-wrap {
          display: flex;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
        }
        .donut-wrap {
          position: relative;
          width: ${SIZE}px;
          height: ${SIZE}px;
          flex-shrink: 0;
        }
        .donut-center {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .donut-center-emoji { font-size: 22px; }
        .donut-center-pct {
          font-family: var(--font-head);
          font-size: 20px; font-weight: 700;
        }
        .donut-center-sub {
          font-size: 11px; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .donut-center-val {
          font-family: var(--font-head);
          font-size: 14px; font-weight: 700;
          color: var(--text-primary); text-align: center;
          padding: 0 8px;
        }
        .legend {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 160px;
        }
        .legend-item {
          display: flex; align-items: center; gap: 8px;
          padding: 4px 6px; border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .legend-item:hover, .legend-item--active {
          background: rgba(255,255,255,0.04);
        }
        .legend-dot {
          width: 8px; height: 8px;
          border-radius: 50%; flex-shrink: 0;
        }
        .legend-label {
          font-size: 12px; color: var(--text-secondary); flex: 1;
        }
        .legend-pct {
          font-size: 12px; font-weight: 600;
        }
      `}</style>
    </div>
  )
}
