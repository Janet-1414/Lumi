'use client'

import React from 'react'
import { formatCurrency, formatChange } from '@/lib/formatters'

interface StatCardProps {
  label:      string
  value:      number
  currency?:  string
  changePct?: number      // +/- percentage vs last month
  icon:       string      // emoji
  accent?:    'gold' | 'teal' | 'red' | 'purple'
  compact?:   boolean
}

/**
 * StatCard — displays a single financial metric.
 * Used in the dashboard header row (balance, income, expenses, savings).
 */
export function StatCard({
  label,
  value,
  currency = 'UGX',
  changePct,
  icon,
  accent = 'gold',
  compact = false,
}: StatCardProps) {
  const accentColors = {
    gold:   { border: 'rgba(250,199,117,0.25)', glow: 'rgba(250,199,117,0.08)', text: '#FAC775' },
    teal:   { border: 'rgba(29,158,117,0.25)',  glow: 'rgba(29,158,117,0.06)',  text: '#1D9E75' },
    red:    { border: 'rgba(216,90,48,0.25)',   glow: 'rgba(216,90,48,0.06)',   text: '#D85A30' },
    purple: { border: 'rgba(127,119,221,0.25)', glow: 'rgba(127,119,221,0.06)', text: '#AFA9EC' },
  }

  const colors = accentColors[accent]
  const isPositive = (changePct ?? 0) >= 0
  const changeColor = accent === 'red'
    ? (isPositive ? '#D85A30' : '#1D9E75')
    : (isPositive ? '#1D9E75' : '#D85A30')

  return (
    <div
      className="stat-card"
      style={{
        borderColor: colors.border,
        background: `linear-gradient(135deg, var(--bg-card) 0%, ${colors.glow} 100%)`,
      }}
    >
      <div className="stat-top">
        <span className="stat-icon">{icon}</span>
        {changePct !== undefined && (
          <span className="stat-change" style={{ color: changeColor }}>
            {formatChange(changePct)}
          </span>
        )}
      </div>

      <div className="stat-value" style={{ color: colors.text }}>
        {formatCurrency(value, currency, compact)}
      </div>

      <div className="stat-label">{label}</div>

      <style jsx>{`
        .stat-card {
          border: 1px solid;
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: default;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        .stat-top {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 0.75rem;
        }
        .stat-icon { font-size: 22px; }
        .stat-change {
          font-size: 12px; font-weight: 500;
          background: rgba(255,255,255,0.06);
          padding: 2px 7px; border-radius: 20px;
        }
        .stat-value {
          font-family: var(--font-head);
          font-size: 22px; font-weight: 700;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
          line-height: 1.2;
        }
        .stat-label {
          font-size: 12px; color: var(--text-secondary);
          font-weight: 500; letter-spacing: 0.02em;
        }
      `}</style>
    </div>
  )
}
