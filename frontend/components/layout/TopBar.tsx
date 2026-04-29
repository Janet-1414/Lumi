'use client'

// components/layout/TopBar.tsx

import { usePathname } from 'next/navigation'

const PAGE_LABELS: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/transactions': 'Transactions',
  '/savings':      'Savings',
  '/reports':      'Reports',
  '/community':    'Community',
  '/chat':         'AI Chat',
  '/profile':      'Profile',
}

interface TopBarProps { userName?: string }

export function TopBar({ userName = 'Akosua' }: TopBarProps) {
  const pathname  = usePathname()
  const pageLabel = Object.entries(PAGE_LABELS).find(([key]) => pathname.startsWith(key))?.[1] ?? 'Lumi'
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1.25rem 2rem',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-deep)',
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      <div>
        <h1 style={{
          fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700,
          color: 'var(--text-primary)', margin: 0,
        }}>
          {pageLabel}
        </h1>
        {pathname === '/dashboard' && (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            {greeting}, {userName} 👋
          </p>
        )}
      </div>
      <button
        aria-label="Notifications"
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '50%', width: 38, height: 38,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, cursor: 'pointer', transition: 'border-color 0.2s',
        }}
      >
        🔔
      </button>
    </header>
  )
}
