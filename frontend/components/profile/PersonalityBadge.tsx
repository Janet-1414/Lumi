'use client'

// components/profile/PersonalityBadge.tsx

interface PersonalityBadgeProps {
  type:        string
  emoji:       string
  description: string
  color:       string
}

export function PersonalityBadge({ type, emoji, description, color }: PersonalityBadgeProps) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${color}40`,
      borderRadius: 'var(--radius-lg)', padding: '1.25rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${color}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>
          {emoji}
        </div>
        <div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 2 }}>
            Money Personality
          </div>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, color }}>
            The {type}
          </div>
        </div>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
        {description}
      </p>
    </div>
  )
}
