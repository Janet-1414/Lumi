'use client'

import React, { forwardRef, useEffect } from 'react'

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?:    boolean
  variant?: 'default' | 'gold' | 'teal' | 'red'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, glow = false, variant = 'default', className = '', style, ...props }, ref) => {
    const borderColors: Record<string, string> = {
      default: 'var(--border)',
      gold:    'rgba(250,199,117,0.3)',
      teal:    'rgba(29,158,117,0.3)',
      red:     'rgba(216,90,48,0.3)',
    }
    const glowColors: Record<string, string> = {
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
          border:       `1px solid ${borderColors[variant]}`,
          borderRadius: 'var(--radius-lg)',
          padding:      '1.25rem',
          boxShadow:    glow ? `0 0 40px ${glowColors[variant]}` : undefined,
          ...style,
        }}
        className={className}
        {...props}
      >
        {children}
      </div>
    )
  },
)
Card.displayName = 'Card'

// ─── Badge ────────────────────────────────────────────────────────────────────

interface BadgeProps {
  children:  React.ReactNode
  variant?:  'gold' | 'teal' | 'red' | 'purple' | 'blue' | 'muted'
  size?:     'sm' | 'md'
  dot?:      boolean
}

export function Badge({
  children, variant = 'gold', size = 'sm', dot = false,
}: BadgeProps) {
  const styles: Record<string, { bg: string; color: string }> = {
    gold:   { bg: 'rgba(250,199,117,0.15)', color: '#FAC775' },
    teal:   { bg: 'rgba(29,158,117,0.15)',  color: '#1D9E75' },
    red:    { bg: 'rgba(216,90,48,0.15)',   color: '#D85A30' },
    purple: { bg: 'rgba(127,119,221,0.15)', color: '#AFA9EC' },
    blue:   { bg: 'rgba(133,183,235,0.15)', color: '#85B7EB' },
    muted:  { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' },
  }
  const { bg, color } = styles[variant]
  const padding = size === 'sm' ? '2px 7px' : '4px 10px'
  const fontSize = size === 'sm' ? 10 : 12

  return (
    <span style={{
      display:      'inline-flex',
      alignItems:   'center',
      gap:           dot ? 5 : 0,
      padding,
      background:   bg,
      color,
      fontSize,
      fontWeight:   600,
      borderRadius: 'var(--radius-full)',
      letterSpacing: '0.03em',
      whiteSpace:   'nowrap',
    }}>
      {dot && (
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: color, flexShrink: 0,
        }} />
      )}
      {children}
    </span>
  )
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────

interface ProgressBarProps {
  value:     number      // 0–100
  height?:   number
  color?:    string
  animated?: boolean
  label?:    string
}

export function ProgressBar({
  value, height = 6, color, animated = false, label,
}: ProgressBarProps) {
  const pct    = Math.min(Math.max(value, 0), 100)
  const barColor = color ??
    (pct >= 75 ? '#1D9E75' : pct >= 40 ? '#FAC775' : '#EF9F27')

  return (
    <div>
      {label && (
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 11, color: 'var(--text-muted)', marginBottom: 4,
        }}>
          <span>{label}</span>
          <span style={{ color: barColor, fontWeight: 600 }}>{pct.toFixed(0)}%</span>
        </div>
      )}
      <div style={{
        height, background: 'rgba(255,255,255,0.07)',
        borderRadius: height / 2, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: barColor,
          borderRadius: height / 2,
          transition: animated ? 'width 0.6s cubic-bezier(0.4,0,0.2,1)' : 'none',
        }} />
      </div>
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

interface SpinnerProps {
  size?:  number
  color?: string
}

export function Spinner({ size = 20, color = 'var(--gold)' }: SpinnerProps) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid rgba(255,255,255,0.1)`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  open:        boolean
  onClose:     () => void
  title?:      string
  children:    React.ReactNode
  maxWidth?:   number
}

export function Modal({ open, onClose, title, children, maxWidth = 440 }: ModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 'var(--z-modal)' as any,
        padding: '1rem',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          width: '100%', maxWidth,
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          animation: 'fadeUp 0.25s ease',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 700,
              color: 'var(--text-primary)', margin: 0,
            }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close modal"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: 18,
                width: 28, height: 28, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
