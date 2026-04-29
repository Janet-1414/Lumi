'use client'

// components/layout/BottomNav.tsx

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const MOBILE_NAV = [
  { href: '/dashboard',    label: 'Dashboard',    emoji: '🏠' },
  { href: '/transactions', label: 'Transactions', emoji: '💳' },
  { href: '/savings',      label: 'Savings',      emoji: '🎯' },
  { href: '/community',    label: 'Community',    emoji: '🌍' },
  { href: '/chat',         label: 'Chat',         emoji: '✨' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'var(--bg-card)', borderTop: '1px solid var(--border)',
      display: 'flex', zIndex: 50,
      paddingBottom: 'env(safe-area-inset-bottom, 0.5rem)',
    }}>
      {MOBILE_NAV.map((item) => {
        const active = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              flex: 1, padding: '6px 4px', textDecoration: 'none',
              color: active ? 'var(--gold)' : 'var(--text-muted)',
              transition: 'color 0.18s',
            }}
          >
            <span style={{ fontSize: 18 }}>{item.emoji}</span>
            <span style={{ fontSize: 10, fontWeight: 500 }}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
