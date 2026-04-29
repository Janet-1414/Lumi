'use client'

// components/profile/BadgeGrid.tsx

import { useState } from 'react'

interface BadgeItem {
  name:     string
  emoji:    string
  tier:     string
  unlocked: boolean
  desc:     string
}

const TIER_COLORS: Record<string, string> = {
  bronze:  '#CD7F32',
  silver:  '#C0C0C0',
  gold:    '#FAC775',
  diamond: '#85B7EB',
}

interface BadgeGridProps { badges: BadgeItem[] }

export function BadgeGrid({ badges }: BadgeGridProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const unlocked = badges.filter(b => b.unlocked).length

  return (
    <div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: '1rem' }}>
        {unlocked} of {badges.length} unlocked
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
        gap: 10,
      }}>
        {badges.map((b, i) => (
          <div
            key={b.name}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              border: `1px solid ${b.unlocked ? `${TIER_COLORS[b.tier]}40` : 'var(--border)'}`,
              borderRadius: 12, padding: '12px 8px', textAlign: 'center',
              cursor: 'pointer', position: 'relative',
              transition: 'transform 0.15s',
              transform: hovered === i ? 'translateY(-2px)' : 'none',
              background: b.unlocked ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)',
            }}
          >
            <span style={{ fontSize: 24, display: 'block', marginBottom: 5, filter: b.unlocked ? 'none' : 'grayscale(1) opacity(0.3)' }}>
              {b.emoji}
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 600, color: b.unlocked ? TIER_COLORS[b.tier] : 'var(--text-muted)' }}>
              {b.name}
            </span>

            {/* Tooltip */}
            {hovered === i && (
              <div style={{
                position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '8px 10px', zIndex: 10,
                whiteSpace: 'nowrap', textAlign: 'left',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: TIER_COLORS[b.tier], letterSpacing: '0.05em' }}>
                  {b.tier.toUpperCase()}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>{b.desc}</div>
                {!b.unlocked && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>🔒 Not yet unlocked</div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
