'use client'

interface LeaderboardEntry {
  rank:         number
  alias:        string
  pct:          number
  tier:         string
  isYou:        boolean
}

interface LeaderBoardProps {
  entries: LeaderboardEntry[]
}

const RANK_EMOJIS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

/**
 * LeaderBoard — ranked by savings goal % ONLY.
 * No actual money amounts are ever shown.
 * This is enforced at the component level as a second layer of safety.
 */
export function LeaderBoard({ entries }: LeaderBoardProps) {
  return (
    <div className="lb-root">
      <div className="lb-notice">
        🔒 Ranked by savings goal % only — no actual amounts are ever shown
      </div>

      <div className="lb-list">
        {entries.map((e) => (
          <div
            key={e.rank}
            className={`lb-row ${e.isYou ? 'lb-row--you' : ''}`}
          >
            <div className="lb-rank">
              {RANK_EMOJIS[e.rank] ?? e.rank}
            </div>
            <div className="lb-alias">
              {e.alias}
              {e.isYou && <span className="lb-you-tag">You</span>}
            </div>
            <div className="lb-bar-wrap">
              <div className="lb-bar-bg">
                <div className="lb-bar-fill" style={{ width: `${e.pct}%` }} />
              </div>
            </div>
            <div className="lb-pct">{e.pct}%</div>
            <div className="lb-tier">{e.tier}</div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .lb-root { display: flex; flex-direction: column; gap: 6px; }

        .lb-notice {
          font-size: 12px; color: var(--text-muted);
          background: rgba(255,255,255,0.03);
          border-radius: 8px; padding: 8px 12px; margin-bottom: 4px;
        }

        .lb-list { display: flex; flex-direction: column; gap: 4px; }

        .lb-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          transition: background 0.15s;
        }
        .lb-row:hover { background: rgba(255,255,255,0.03); }
        .lb-row--you {
          background: rgba(250,199,117,0.07);
          border: 1px solid rgba(250,199,117,0.2);
        }

        .lb-rank {
          font-size: 15px; width: 28px; text-align: center; flex-shrink: 0;
        }
        .lb-alias {
          font-size: 13px; font-weight: 500; color: var(--text-primary);
          flex-shrink: 0; min-width: 140px;
          display: flex; align-items: center; gap: 6px;
        }
        .lb-you-tag {
          font-size: 10px;
          background: rgba(250,199,117,0.2);
          color: var(--gold);
          padding: 1px 6px; border-radius: 8px;
        }
        .lb-bar-wrap { flex: 1; }
        .lb-bar-bg {
          height: 5px;
          background: rgba(255,255,255,0.06);
          border-radius: 3px; overflow: hidden;
        }
        .lb-bar-fill {
          height: 100%; border-radius: 3px;
          background: linear-gradient(90deg, #1D9E75, #FAC775);
          transition: width 0.6s ease;
        }
        .lb-pct {
          font-size: 12px; font-weight: 600; color: var(--gold);
          width: 44px; text-align: right; flex-shrink: 0;
        }
        .lb-tier { font-size: 16px; flex-shrink: 0; }
      `}</style>
    </div>
  )
}
