'use client'

interface WeeklyPulseProps {
  headline:      string
  activeSavers:  number
  topCategory:   string
}

/**
 * WeeklyPulse — shows the anonymous weekly community stats banner.
 * Aggregate data only — never individual amounts.
 */
export function WeeklyPulse({ headline, activeSavers, topCategory }: WeeklyPulseProps) {
  return (
    <div className="pulse-card">
      <div className="pulse-icon">🌍</div>
      <div>
        <div className="pulse-headline">{headline}</div>
        <div className="pulse-sub">
          {activeSavers.toLocaleString('en-UG')} active savers this week
          &nbsp;·&nbsp;Top: {topCategory}
        </div>
      </div>

      <style jsx>{`
        .pulse-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: linear-gradient(135deg, rgba(250,199,117,0.08), rgba(29,158,117,0.05));
          border: 1px solid rgba(250,199,117,0.2);
          border-radius: var(--radius-lg);
          padding: 1rem 1.25rem;
        }
        .pulse-icon  { font-size: 28px; flex-shrink: 0; }
        .pulse-headline {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .pulse-sub {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 2px;
        }
      `}</style>
    </div>
  )
}
