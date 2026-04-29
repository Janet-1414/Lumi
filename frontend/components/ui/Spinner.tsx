'use client'

// components/ui/Spinner.tsx

interface SpinnerProps { size?: number; color?: string }

export function Spinner({ size = 20, color = 'var(--gold)' }: SpinnerProps) {
  return (
    <>
      <div style={{
        width: size, height: size,
        border: `2px solid rgba(255,255,255,0.1)`,
        borderTopColor: color, borderRadius: '50%',
        animation: 'spin 0.7s linear infinite', flexShrink: 0,
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
