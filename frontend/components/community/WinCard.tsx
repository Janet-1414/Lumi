'use client'

import { useState } from 'react'

interface WinCardProps {
  id:      number | string
  alias:   string
  emoji:   string
  message: string
  likes:   number
  time:    string
  onLike?: (id: number | string) => void
}

/**
 * WinCard — displays a single anonymous community win.
 * No real names. No money amounts ever shown.
 */
export function WinCard({ id, alias, emoji, message, likes, time, onLike }: WinCardProps) {
  const [liked, setLiked] = useState(false)

  const handleLike = () => {
    if (liked) return
    setLiked(true)
    onLike?.(id)
  }

  return (
    <div className="win-card">
      {/* Header */}
      <div className="win-header">
        <div className="win-avatar">{emoji}</div>
        <div className="win-meta">
          <div className="win-alias">{alias}</div>
          <div className="win-time">{time} ago</div>
        </div>
        <span className="win-badge">🏆 Win</span>
      </div>

      <p className="win-message">{message}</p>

      <button
        className={`win-like ${liked ? 'win-like--liked' : ''}`}
        onClick={handleLike}
        aria-label="Like this win"
      >
        {liked ? '❤️' : '🤍'} {likes + (liked ? 1 : 0)}
      </button>

      <style jsx>{`
        .win-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1rem 1.1rem;
          transition: border-color 0.2s;
        }
        .win-card:hover { border-color: rgba(250,199,117,0.3); }

        .win-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .win-avatar {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: rgba(250,199,117,0.1);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
        }
        .win-alias {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .win-time {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 1px;
        }
        .win-badge {
          margin-left: auto;
          font-size: 11px;
          font-weight: 600;
          background: rgba(250,199,117,0.1);
          color: var(--gold);
          padding: 2px 8px;
          border-radius: 10px;
          white-space: nowrap;
        }

        .win-message {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.65;
          margin-bottom: 10px;
        }

        .win-like {
          background: none;
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 4px 12px;
          font-family: var(--font-body);
          font-size: 12px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }
        .win-like:hover { border-color: rgba(237,147,177,0.5); color: #ED93B1; }
        .win-like--liked {
          border-color: rgba(237,147,177,0.5);
          color: #ED93B1;
          cursor: default;
        }
      `}</style>
    </div>
  )
}
