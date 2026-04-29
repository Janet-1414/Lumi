'use client'

// components/ui/ProgressBar.tsx

interface ProgressBarProps {
  value:     number     // 0–100
  height?:   number
  color?:    string
  animated?: boolean
  label?:    string
}

export function ProgressBar({ value, height = 6, color, animated = false, label }: ProgressBarProps) {
  const pct      = Math.min(Math.max(value, 0), 100)
  const barColor = color ?? (pct >= 75 ? '#1D9E75' : pct >= 40 ? '#FAC775' : '#EF9F27')
  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
          <span>{label}</span>
          <span style={{ color: barColor, fontWeight: 600 }}>{pct.toFixed(0)}%</span>
        </div>
      )}
      <div style={{ height, background: 'rgba(255,255,255,0.07)', borderRadius: height / 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: barColor,
          borderRadius: height / 2,
          transition: animated ? 'width 0.6s cubic-bezier(0.4,0,0.2,1)' : 'none',
        }} />
      </div>
    </div>
  )
}
