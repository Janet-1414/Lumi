'use client'

import React from 'react'

interface Prompt {
  label: string
  text:  string
}

interface SuggestedChipsProps {
  prompts:  Prompt[]
  onSelect: (text: string) => void
}

/**
 * SuggestedChips — grid of suggested prompts shown in empty chat state.
 * Clicking a chip fills the input and sends the message.
 */
export function SuggestedChips({ prompts, onSelect }: SuggestedChipsProps) {
  return (
    <div className="chips-root">
      <p className="chips-label">Ask Lumi about your finances</p>
      <div className="chips-grid">
        {prompts.map((p) => (
          <button
            key={p.text}
            className="chip"
            onClick={() => onSelect(p.text)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <style jsx>{`
        .chips-root { text-align: center; padding: 1rem 0; }
        .chips-label {
          font-size: 13px; color: var(--text-muted); margin-bottom: 12px;
        }
        .chips-grid {
          display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;
        }
        .chip {
          padding: 8px 14px;
          background: rgba(250,199,117,0.06);
          border: 1px solid rgba(250,199,117,0.2);
          border-radius: var(--radius-full);
          font-family: var(--font-body); font-size: 12.5px;
          color: var(--text-secondary); cursor: pointer;
          transition: all 0.18s;
          text-align: left;
        }
        .chip:hover {
          background: rgba(250,199,117,0.14);
          border-color: rgba(250,199,117,0.45);
          color: var(--gold);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  )
}
