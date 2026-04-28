'use client'

import React from 'react'

interface StreakBannerProps {
  streakDays:  number
  badgeTier:   'bronze' | 'silver' | 'gold' | 'diamond'
  totalSaved:  number
  currency?:   string
}

const BADGE_META = {
  bronze:  { emoji: '🥉', label: 'Bronze Saver',   color: '#CD7F32', min: 0   },
  silver:  { emoji: '🥈', label: 'Silver Saver',   color: '#C0C0C0', min: 7   },
  gold:    { emoji: '🥇', label: 'Gold Saver',     color: '#FAC775', min: 30  },
  diamond: { emoji: '💎', label: 'Diamond Saver',  color: '#85B7EB', min: 100 },
}

/**
 * StreakBanner — shows the user's saving streak with fire animation
 * and their current badge tier.
 */
export function StreakBanner({
  streakDays,
  badgeTier,
  totalSaved,
  currency = 'UGX',
}: StreakBannerProps) {
  const badge = BADGE_META[badgeTier]

  return (
    <div className="streak-banner">
      {/* Streak counter */}
      <div className="streak-left">
        <div className="streak-fire-wrap">
          <span className="streak-fire">🔥</span>
          <div className="streak-count">{streakDays}</div>
        </div>
        <div className="streak-info">
          <div className="streak-label">day saving streak</div>
          <div className="streak-sub">Keep it up! Don't break the chain.</div>
        </div>
      </div>

      {/* Divider */}
      <div className="streak-divider" />

      {/* Badge */}
      <div className="streak-badge">
        <div
          className="badge-icon"
          style={{ background: `${badge.color}20`, border: `1px solid ${badge.color}40` }}
        >
          <span style={{ fontSize: 22 }}>{badge.emoji}</span>
        </div>
        <div>
          <div className="badge-name" style={{ color: badge.color }}>{badge.label}</div>
          <div className="badge-sub">
            UGX {totalSaved.toLocaleString('en-UG')} saved total
          </div>
        </div>
      </div>

      <style jsx>{`
        .streak-banner {
          background: linear-gradient(135deg, rgba(250,199,117,0.08), rgba(29,158,117,0.05));
          border: 1px solid rgba(250,199,117,0.2);
          border-radius: var(--radius-lg);
          padding: 1.1rem 1.5rem;
          display: flex; align-items: center; gap: 1.5rem;
          flex-wrap: wrap;
        }

        .streak-left { display: flex; align-items: center; gap: 12px; }

        .streak-fire-wrap {
          position: relative;
          width: 52px; height: 52px;
          display: flex; align-items: center; justify-content: center;
        }
        .streak-fire {
          font-size: 36px;
          animation: flicker 1.5s ease-in-out infinite alternate;
          display: block;
          filter: drop-shadow(0 0 8px rgba(250,199,117,0.6));
        }
        @keyframes flicker {
          0%   { transform: scale(1)    rotate(-2deg); filter: drop-shadow(0 0 6px rgba(250,199,117,0.5)); }
          50%  { transform: scale(1.05) rotate(1deg);  filter: drop-shadow(0 0 12px rgba(250,199,117,0.8)); }
          100% { transform: scale(0.98) rotate(-1deg); filter: drop-shadow(0 0 8px rgba(250,199,117,0.6)); }
        }
        .streak-count {
          position: absolute; bottom: 0; right: 0;
          background: var(--gold); color: #1a0f00;
          font-family: var(--font-head); font-size: 11px; font-weight: 700;
          width: 20px; height: 20px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid var(--bg-deep);
        }

        .streak-label { font-size: 14px; font-weight: 600; color: var(--text-primary); }
        .streak-sub   { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }

        .streak-divider {
          width: 1px; height: 40px;
          background: rgba(250,199,117,0.15);
          flex-shrink: 0;
        }

        .streak-badge {
          display: flex; align-items: center; gap: 12px;
        }
        .badge-icon {
          width: 46px; height: 46px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .badge-name { font-size: 13px; font-weight: 700; }
        .badge-sub  { font-size: 11.5px; color: var(--text-muted); margin-top: 2px; }

        @media (max-width: 500px) {
          .streak-divider { display: none; }
          .streak-banner  { gap: 1rem; }
        }
      `}</style>
    </div>
  )
}
