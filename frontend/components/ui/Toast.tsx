'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id:      string
  message: string
  type:    ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
  success: (message: string) => void
  error:   (message: string) => void
  warning: (message: string) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue>({
  toast:   () => {},
  success: () => {},
  error:   () => {},
  warning: () => {},
})

// ─── Provider ─────────────────────────────────────────────────────────────────

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const ctx: ToastContextValue = {
    toast:   addToast,
    success: (m) => addToast(m, 'success'),
    error:   (m) => addToast(m, 'error'),
    warning: (m) => addToast(m, 'warning'),
  }

  const ICONS: Record<ToastType, string>   = { success: '✅', error: '❌', warning: '⚠️', info: '💡' }
  const COLORS: Record<ToastType, string>  = {
    success: 'rgba(29,158,117,0.15)',
    error:   'rgba(216,90,48,0.15)',
    warning: 'rgba(250,199,117,0.15)',
    info:    'rgba(133,183,235,0.15)',
  }
  const BORDERS: Record<ToastType, string> = {
    success: 'rgba(29,158,117,0.35)',
    error:   'rgba(216,90,48,0.35)',
    warning: 'rgba(250,199,117,0.35)',
    info:    'rgba(133,183,235,0.35)',
  }

  return (
    <ToastContext.Provider value={ctx}>
      <div style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem',
        display: 'flex', flexDirection: 'column', gap: 8,
        zIndex: 'var(--z-toast)' as any,
        maxWidth: 360,
      }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '12px 14px',
              background: COLORS[t.type],
              border: `1px solid ${BORDERS[t.type]}`,
              borderRadius: 'var(--radius-md)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              animation: 'fadeUp 0.25s ease',
              fontFamily: 'var(--font-body)',
              fontSize: 13.5,
              color: 'var(--text-primary)',
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{ICONS[t.type]}</span>
            <span style={{ lineHeight: 1.5 }}>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext)
}
