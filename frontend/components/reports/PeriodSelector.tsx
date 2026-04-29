'use client'

// components/reports/PeriodSelector.tsx

interface Period { value: string; label: string }

interface PeriodSelectorProps {
  periods: Period[]
  active:  string
  onChange:(value: string) => void
}

export function PeriodSelector({ periods, active, onChange }: PeriodSelectorProps) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {periods.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          style={{
            padding: '7px 14px', borderRadius: 20,
            background: active === p.value ? 'linear-gradient(135deg, #FAC775, #EF9F27)' : 'var(--bg-card)',
            border: `1px solid ${active === p.value ? 'transparent' : 'var(--border)'}`,
            fontFamily: 'var(--font-body)', fontSize: 13,
            color: active === p.value ? '#1a0f00' : 'var(--text-secondary)',
            fontWeight: active === p.value ? 600 : 400,
            cursor: 'pointer', transition: 'all 0.18s',
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
