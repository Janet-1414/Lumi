'use client'

// components/savings/InvestmentHint.tsx

interface InvestmentHintProps {
  streakDays:      number
  requiredDays?:   number
}

export function InvestmentHint({ streakDays, requiredDays = 30 }: InvestmentHintProps) {
  const unlocked = streakDays >= requiredDays
  const pct      = Math.min((streakDays / requiredDays) * 100, 100)

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '1.25rem',
      display: 'flex', alignItems: 'flex-start', gap: 14,
      opacity: unlocked ? 1 : 0.7,
    }}>
      <span style={{ fontSize: 24, marginTop: 2 }}>{unlocked ? '📈' : '🔒'}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
          Investment Hints
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
          {unlocked
            ? 'You\'ve unlocked personalised Africa-relevant investment suggestions!'
            : `Save consistently for ${requiredDays} days to unlock personalised investment suggestions from Lumi AI.`
          }
        </div>
        {!unlocked && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gold)', borderRadius: 3, transition: 'width 0.6s ease' }} />
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {streakDays} / {requiredDays} days
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
