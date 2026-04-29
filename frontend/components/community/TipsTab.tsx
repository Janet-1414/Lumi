'use client'

import { useState } from 'react'

interface Tip {
  id:    number | string
  alias: string
  tip:   string
  likes: number
}

interface TipsTabProps {
  tips: Tip[]
}

/**
 * TipsTab — community savings tips shared anonymously.
 */
export function TipsTab({ tips }: TipsTabProps) {
  const [liked, setLiked] = useState<Set<number | string>>(new Set())

  const handleLike = (id: number | string) => {
    setLiked((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {tips.map((t) => {
        const isLiked = liked.has(t.id)
        return (
          <div key={t.id} className="tip-card">
            <div className="tip-header">
              <span className="tip-alias">{t.alias}</span>
              <button
                className={`tip-like ${isLiked ? 'tip-like--liked' : ''}`}
                onClick={() => handleLike(t.id)}
                disabled={isLiked}
              >
                {isLiked ? '❤️' : '🤍'} {t.likes + (isLiked ? 1 : 0)}
              </button>
            </div>
            <p className="tip-text">"{t.tip}"</p>

            <style jsx>{`
              .tip-card {
                background: var(--bg-card);
                border: 1px solid var(--border);
                border-radius: var(--radius-lg);
                padding: 1rem 1.1rem;
                transition: border-color 0.2s;
              }
              .tip-card:hover { border-color: rgba(250,199,117,0.25); }
              .tip-header {
                display: flex; align-items: center;
                justify-content: space-between; margin-bottom: 8px;
              }
              .tip-alias {
                font-size: 12.5px; font-weight: 600; color: var(--gold);
              }
              .tip-like {
                background: none;
                border: 1px solid var(--border);
                border-radius: 20px; padding: 3px 10px;
                font-family: var(--font-body); font-size: 12px;
                color: var(--text-secondary); cursor: pointer;
                transition: all 0.2s;
              }
              .tip-like:hover { border-color: rgba(237,147,177,0.5); color: #ED93B1; }
              .tip-like--liked { color: #ED93B1; border-color: rgba(237,147,177,0.5); cursor: default; }
              .tip-text {
                font-size: 13.5px; color: var(--text-secondary);
                line-height: 1.65; font-style: italic; margin: 0;
              }
            `}</style>
          </div>
        )
      })}
    </div>
  )
}
