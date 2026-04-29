'use client'

import { useState } from 'react'

interface ChallengeCardProps {
  id:           number | string
  emoji:        string
  title:        string
  desc:         string
  participants: number
  pct:          number
  duration:     string
}

/**
 * ChallengeCard — displays a single group savings challenge.
 * Shows collective progress — never individual amounts.
 */
export function ChallengeCard({ emoji, title, desc, participants, pct, duration }: ChallengeCardProps) {
  const [joined, setJoined] = useState(false)

  return (
    <div className="chal-card">
      <div className="chal-header">
        <span className="chal-emoji">{emoji}</span>
        <div className="chal-info">
          <div className="chal-title">{title}</div>
          <div className="chal-desc">{desc}</div>
        </div>
        <span className="chal-duration">{duration}</span>
      </div>

      {/* Collective progress bar */}
      <div className="chal-bar-bg">
        <div className="chal-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="chal-footer">
        <span className="chal-ppl">
          👥 {participants.toLocaleString()} participants · {pct}% complete
        </span>
        <button
          className={`chal-btn ${joined ? 'chal-btn--joined' : ''}`}
          onClick={() => setJoined((j) => !j)}
        >
          {joined ? '✓ Joined' : 'Join'}
        </button>
      </div>

      <style jsx>{`
        .chal-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1rem 1.1rem;
          transition: border-color 0.2s;
        }
        .chal-card:hover { border-color: rgba(250,199,117,0.25); }

        .chal-header {
          display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px;
        }
        .chal-emoji  { font-size: 22px; flex-shrink: 0; margin-top: 2px; }
        .chal-title  { font-size: 13.5px; font-weight: 600; color: var(--text-primary); }
        .chal-desc   { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
        .chal-duration {
          margin-left: auto; flex-shrink: 0;
          font-size: 11px; color: var(--teal);
          background: rgba(29,158,117,0.1);
          padding: 2px 8px; border-radius: 10px;
          height: fit-content;
        }

        .chal-bar-bg {
          height: 5px;
          background: rgba(255,255,255,0.06);
          border-radius: 3px; overflow: hidden; margin-bottom: 10px;
        }
        .chal-bar-fill {
          height: 100%; border-radius: 3px;
          background: linear-gradient(90deg, #1D9E75, #FAC775);
          transition: width 0.6s ease;
        }

        .chal-footer {
          display: flex; align-items: center; justify-content: space-between;
        }
        .chal-ppl { font-size: 11.5px; color: var(--text-muted); }
        .chal-btn {
          padding: 5px 14px; border-radius: 20px;
          background: rgba(250,199,117,0.1);
          border: 1px solid rgba(250,199,117,0.3);
          font-family: var(--font-body); font-size: 12px;
          color: var(--gold); cursor: pointer; transition: all 0.2s;
        }
        .chal-btn:hover { background: rgba(250,199,117,0.2); }
        .chal-btn--joined {
          background: rgba(29,158,117,0.15);
          border-color: rgba(29,158,117,0.3);
          color: var(--teal);
        }
      `}</style>
    </div>
  )
}
