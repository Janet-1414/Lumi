'use client'

// components/profile/StatsPanel.tsx

interface Stat { label: string; value: string; icon: string }

interface StatsPanelProps { stats: Stat[] }

export function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
      {stats.map((s) => (
        <div key={s.label} style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, color: 'var(--gold)' }}>
            {s.value}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}
