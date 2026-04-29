'use client'

// components/savings/SavingsChallenge.tsx

import { formatCurrency } from '@/lib/formatters'

interface Challenge {
  title:       string
  description: string
  target_save: number
  duration:    string
  currency?:   string
}

interface SavingsChallengeProps {
  challenge:   Challenge
  onAccept?:   () => void
  onSkip?:     () => void
}

export function SavingsChallenge({ challenge, onAccept, onSkip }: SavingsChallengeProps) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(250,199,117,0.07), rgba(29,158,117,0.04))',
      border: '1px solid rgba(250,199,117,0.2)',
      borderRadius: 'var(--radius-lg)', padding: '1.25rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, #FAC775, #EF9F27)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>🤖</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold)' }}>Lumi AI Challenge</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Personalised for you</div>
        </div>
        <span style={{
          marginLeft: 'auto', fontSize: 11.5, color: 'var(--teal)',
          background: 'rgba(29,158,117,0.1)', padding: '2px 8px', borderRadius: 10,
        }}>
          {challenge.duration}
        </span>
      </div>

      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 5 }}>
        {challenge.title}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>
        {challenge.description}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal)', marginBottom: 12 }}>
        Save up to {formatCurrency(challenge.target_save, challenge.currency ?? 'UGX', true)}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onAccept}
          style={{
            flex: 1, padding: 9,
            background: 'linear-gradient(135deg, #FAC775, #EF9F27)',
            border: 'none', borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
            color: '#1a0f00', cursor: 'pointer', transition: 'opacity 0.2s',
          }}
        >
          Accept challenge 💪
        </button>
        <button
          onClick={onSkip}
          style={{
            padding: '9px 16px',
            background: 'transparent', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          Skip
        </button>
      </div>
    </div>
  )
}
