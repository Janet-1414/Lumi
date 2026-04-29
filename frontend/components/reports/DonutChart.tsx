'use client'

import { useState } from 'react'
import { formatCurrency, formatPercent } from '@/lib/formatters'

interface DonutSegment {
  category:   string
  amount:     number
  percentage: number
  color:      string
}

interface DonutChartProps {
  data:      DonutSegment[]
  size?:     number
  currency?: string
}

/**
 * DonutChart — SVG donut chart for spending category breakdown.
 * Hover a segment to highlight and see exact amount.
 */
export function DonutChart({ data, size = 160, currency = 'UGX' }: DonutChartProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  const RADIUS      = size * 0.4
  const STROKE      = size * 0.13
  const CENTER      = size / 2
  const CIRCUMF     = 2 * Math.PI * RADIUS

  // Build segments with stroke-dasharray offsets
  let offset = 0
  const segments = data.map((d, i) => {
    const dash = (d.percentage / 100) * CIRCUMF
    const seg  = { ...d, dash, gap: CIRCUMF - dash, offset, index: i }
    offset += dash
    return seg
  })

  const hoveredSeg = hovered !== null ? data[hovered] : null

  return (
    <div className="donut-root">
      {/* SVG */}
      <div className="donut-svg-wrap">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}
        >
          {/* Track */}
          <circle
            cx={CENTER} cy={CENTER} r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={STROKE}
          />

          {/* Segments */}
          {segments.map((seg) => (
            <circle
              key={seg.category}
              cx={CENTER} cy={CENTER} r={RADIUS}
              fill="none"
              stroke={seg.color}
              strokeWidth={hovered === seg.index ? STROKE + 3 : STROKE}
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={-seg.offset}
              style={{ cursor: 'pointer', transition: 'stroke-width 0.2s' }}
              onMouseEnter={() => setHovered(seg.index)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>

        {/* Centre label */}
        <div className="donut-centre">
          {hoveredSeg ? (
            <>
              <div className="donut-centre-pct" style={{ color: hoveredSeg.color }}>
                {formatPercent(hoveredSeg.percentage, 0)}
              </div>
              <div className="donut-centre-label">
                {hoveredSeg.category.replace('_', ' ')}
              </div>
            </>
          ) : (
            <>
              <div className="donut-centre-pct">100%</div>
              <div className="donut-centre-label">spending</div>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="donut-legend">
        {data.map((d, i) => (
          <div
            key={d.category}
            className="donut-legend-row"
            style={{ opacity: hovered === null || hovered === i ? 1 : 0.4 }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="donut-dot" style={{ background: d.color }} />
            <span className="donut-cat">
              {d.category.charAt(0).toUpperCase() + d.category.slice(1).replace('_', ' ')}
            </span>
            <span className="donut-pct" style={{ color: d.color }}>
              {formatPercent(d.percentage, 0)}
            </span>
            <span className="donut-amt">
              {formatCurrency(d.amount, currency, true)}
            </span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .donut-root {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .donut-svg-wrap {
          position: relative;
          flex-shrink: 0;
        }

        .donut-centre {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .donut-centre-pct {
          font-family: var(--font-head);
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }
        .donut-centre-label {
          font-size: 10px;
          color: var(--text-muted);
          margin-top: 2px;
          text-transform: capitalize;
        }

        .donut-legend {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 160px;
        }

        .donut-legend-row {
          display: flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          transition: opacity 0.18s;
        }

        .donut-dot {
          width: 8px;
          height: 8px;
          border-radius: 2px;
          flex-shrink: 0;
        }

        .donut-cat {
          flex: 1;
          font-size: 12px;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .donut-pct {
          font-size: 11px;
          font-weight: 700;
          min-width: 32px;
          text-align: right;
        }

        .donut-amt {
          font-size: 11px;
          color: var(--text-muted);
          min-width: 70px;
          text-align: right;
        }
      `}</style>
    </div>
  )
}
