'use client'

import React, { forwardRef } from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?:    boolean
  variant?: 'default' | 'gold' | 'teal' | 'red'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, glow = false, variant = 'default', style, ...props }, ref) => {
    const borders: Record<string, string> = {
      default: 'var(--border)',
      gold:    'rgba(250,199,117,0.3)',
      teal:    'rgba(29,158,117,0.3)',
      red:     'rgba(216,90,48,0.3)',
    }
    const glows: Record<string, string> = {
      default: 'rgba(250,199,117,0.04)',
      gold:    'rgba(250,199,117,0.08)',
      teal:    'rgba(29,158,117,0.06)',
      red:     'rgba(216,90,48,0.05)',
    }
    return (
      <div
        ref={ref}
        style={{
          background:   'var(--bg-card)',
          border:       `1px solid ${borders[variant]}`,
          borderRadius: 'var(--radius-lg)',
          padding:      '1.25rem',
          boxShadow:    glow ? `0 0 40px ${glows[variant]}` : undefined,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    )
  },
)
Card.displayName = 'Card'
