'use client'

// components/ui/Badge.tsx

interface BadgeProps {
  children: React.ReactNode
  variant?: 'gold' | 'teal' | 'red' | 'purple' | 'blue' | 'muted'
  size?:    'sm' | 'md'
  dot?:     boolean
}

import React from 'react'

export function Badge({ children, variant = 'gold', size = 'sm', dot = false }: BadgeProps) {
  const styles: Record<string, { bg: string; color: string }> = {
    gold:   { bg: 'rgba(250,199,117,0.15)', color: '#FAC775' },
    teal:   { bg: 'rgba(29,158,117,0.15)',  color: '#1D9E75' },
    red:    { bg: 'rgba(216,90,48,0.15)',   color: '#D85A30' },
    purple: { bg: 'rgba(127,119,221,0.15)', color: '#AFA9EC' },
    blue:   { bg: 'rgba(133,183,235,0.15)', color: '#85B7EB' },
    muted:  { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' },
  }
  const { bg, color } = styles[variant]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: dot ? 5 : 0,
      padding: size === 'sm' ? '2px 7px' : '4px 10px',
      background: bg, color,
      fontSize: size === 'sm' ? 10 : 12, fontWeight: 600,
      borderRadius: 'var(--radius-full)', letterSpacing: '0.03em',
      whiteSpace: 'nowrap',
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />}
      {children}
    </span>
  )
}
