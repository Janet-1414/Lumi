'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard',    label: 'Dashboard',    emoji: '🏠' },
  { href: '/transactions', label: 'Transactions', emoji: '💳' },
  { href: '/savings',      label: 'Savings',      emoji: '🎯' },
  { href: '/reports',      label: 'Reports',      emoji: '📊' },
  { href: '/community',    label: 'Community',    emoji: '🌍' },
  { href: '/chat',         label: 'AI Chat',      emoji: '✨' },
  { href: '/profile',      label: 'Profile',      emoji: '👤' },
]

interface SidebarProps { userName?: string }

export function Sidebar({ userName = 'Akosua' }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: 240,
      background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem', zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem', padding: '0 0.5rem' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, #FAC775, #EF9F27)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>💡</div>
        <span style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>
          Lumi
        </span>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                color: active ? 'var(--gold)' : 'var(--text-secondary)',
                fontSize: 13.5, fontWeight: 500,
                background: active ? 'rgba(250,199,117,0.1)' : 'transparent',
                transition: 'all 0.18s', position: 'relative',
              }}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.emoji}</span>
              <span>{item.label}</span>
              {active && (
                <span style={{
                  position: 'absolute', right: 12,
                  width: 6, height: 6, background: 'var(--gold)', borderRadius: '50%',
                }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User pill */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', borderTop: '1px solid var(--border)', marginTop: 'auto',
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FAC775, #EF9F27)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, color: '#1a0f00',
        }}>
          {userName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{userName}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Free plan</div>
        </div>
      </div>
    </aside>
  )
}
