'use client'

import React from 'react'
import { CATEGORY_META } from '@/lib/categories'
import type { TransactionCategory, TransactionType } from '@/types/dashboard.types'

type FilterValue = 'all' | TransactionType | TransactionCategory

interface FilterPillsProps {
  active:   FilterValue
  onChange: (value: FilterValue) => void
}

const TYPE_PILLS: Array<{ value: FilterValue; label: string; emoji: string }> = [
  { value: 'all',     label: 'All',      emoji: '✨' },
  { value: 'income',  label: 'Income',   emoji: '📈' },
  { value: 'expense', label: 'Expenses', emoji: '📉' },
]

const CATEGORY_PILLS = (
  Object.entries(CATEGORY_META) as Array<[TransactionCategory, typeof CATEGORY_META[TransactionCategory]]>
).map(([value, meta]) => ({
  value: value as FilterValue,
  label: meta.label,
  emoji: meta.emoji,
  color: meta.color,
}))

/**
 * FilterPills — horizontal scrollable pill row for filtering transactions.
 * First row: All / Income / Expenses
 * Second row: category pills
 */
export function FilterPills({ active, onChange }: FilterPillsProps) {
  return (
    <div className="pills-root">
      {/* Type pills */}
      <div className="pills-row">
        {TYPE_PILLS.map((pill) => (
          <button
            key={pill.value}
            className={['pill', active === pill.value ? 'pill--active' : ''].join(' ')}
            onClick={() => onChange(pill.value)}
            aria-pressed={active === pill.value}
          >
            <span>{pill.emoji}</span>
            {pill.label}
          </button>
        ))}
      </div>

      {/* Category pills */}
      <div className="pills-row pills-row--scroll">
        {CATEGORY_PILLS.map((pill) => (
          <button
            key={pill.value}
            className={['pill pill--cat', active === pill.value ? 'pill--cat-active' : ''].join(' ')}
            onClick={() => onChange(active === pill.value ? 'all' : pill.value)}
            aria-pressed={active === pill.value}
            style={
              active === pill.value
                ? { borderColor: pill.color, background: `${pill.color}18`, color: pill.color }
                : {}
            }
          >
            <span>{pill.emoji}</span>
            {pill.label}
          </button>
        ))}
      </div>

      <style jsx>{`
        .pills-root { display: flex; flex-direction: column; gap: 8px; }

        .pills-row {
          display: flex; gap: 6px; flex-wrap: wrap;
        }
        .pills-row--scroll {
          flex-wrap: nowrap;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .pills-row--scroll::-webkit-scrollbar { display: none; }

        .pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 6px 13px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          font-family: var(--font-body);
          font-size: 12.5px; font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer; white-space: nowrap;
          transition: all 0.18s;
        }
        .pill:hover {
          border-color: var(--border-focus);
          color: var(--text-primary);
        }
        .pill--active {
          background: linear-gradient(135deg, #FAC775, #EF9F27);
          border-color: transparent;
          color: #1a0f00;
        }
        .pill--active:hover { color: #1a0f00; }

        .pill--cat { font-size: 11.5px; padding: 5px 11px; }
        .pill--cat-active { font-weight: 600; }
      `}</style>
    </div>
  )
}
