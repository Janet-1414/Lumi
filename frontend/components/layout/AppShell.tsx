'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ─── Nav items ────────────────────────────────────────────────────────────────

interface NavItem {
  href:  string
  label: string
  emoji: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',    label: 'Dashboard',    emoji: '🏠' },
  { href: '/transactions', label: 'Transactions', emoji: '💳' },
  { href: '/savings',      label: 'Savings',      emoji: '🎯' },
  { href: '/reports',      label: 'Reports',      emoji: '📊' },
  { href: '/community',    label: 'Community',    emoji: '🌍' },
  { href: '/chat',         label: 'AI Chat',      emoji: '✨' },
  { href: '/profile',      label: 'Profile',      emoji: '👤' },
]

// ─── AppShell ─────────────────────────────────────────────────────────────────

interface AppShellProps {
  children: React.ReactNode
  userName?: string
}

export function AppShell({ children, userName = 'Akosua' }: AppShellProps) {
  const pathname = usePathname()

  return (
    <div className="shell">
      <Sidebar pathname={pathname} userName={userName} />

      <div className="shell-main">
        <TopBar pathname={pathname} userName={userName} />
        <main className="shell-content">{children}</main>
      </div>

      <BottomNav pathname={pathname} />

      <style jsx>{`
        .shell {
          display: flex;
          min-height: 100vh;
          background: var(--bg-deep);
          color: var(--text-primary);
        }

        .shell-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          margin-left: 240px;
        }

        .shell-content {
          flex: 1;
          padding: 1.5rem 2rem 5rem;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .shell-main { margin-left: 0; }
          .shell-content { padding: 1rem 1rem 5.5rem; }
        }
      `}</style>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ pathname, userName }: { pathname: string; userName: string }) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">💡</div>
        <span className="sidebar-logo-text">Lumi</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={['sidebar-link', active ? 'sidebar-link--active' : ''].join(' ')}
            >
              <span className="sidebar-link-icon">{item.emoji}</span>
              <span className="sidebar-link-label">{item.label}</span>
              {active && <span className="sidebar-link-dot" />}
            </Link>
          )
        })}
      </nav>

      {/* User pill at bottom */}
      <div className="sidebar-user">
        <div className="sidebar-user-avatar">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{userName}</div>
          <div className="sidebar-user-sub">Free plan</div>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          position: fixed;
          left: 0; top: 0; bottom: 0;
          width: 240px;
          background: var(--bg-card);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1rem;
          z-index: 40;
        }

        .sidebar-logo {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 2rem; padding: 0 0.5rem;
        }
        .sidebar-logo-icon {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #FAC775, #EF9F27);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .sidebar-logo-text {
          font-family: var(--font-head);
          font-size: 20px; font-weight: 700;
          color: var(--gold); letter-spacing: -0.5px;
        }

        .sidebar-nav {
          display: flex; flex-direction: column; gap: 2px; flex: 1;
        }

        .sidebar-link {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          text-decoration: none;
          color: var(--text-secondary);
          font-size: 13.5px; font-weight: 500;
          transition: all 0.18s;
          position: relative;
        }
        .sidebar-link:hover {
          background: rgba(250,199,117,0.06);
          color: var(--text-primary);
        }
        .sidebar-link--active {
          background: rgba(250,199,117,0.1);
          color: var(--gold);
        }
        .sidebar-link--active:hover { color: var(--gold); }
        .sidebar-link-icon { font-size: 16px; width: 20px; text-align: center; }
        .sidebar-link-dot {
          position: absolute; right: 12px;
          width: 6px; height: 6px;
          background: var(--gold);
          border-radius: 50%;
        }

        .sidebar-user {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px;
          border-top: 1px solid var(--border);
          margin-top: auto;
        }
        .sidebar-user-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, #FAC775, #EF9F27);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-head); font-size: 14px; font-weight: 700;
          color: #1a0f00; flex-shrink: 0;
        }
        .sidebar-user-name {
          font-size: 13px; font-weight: 500; color: var(--text-primary);
        }
        .sidebar-user-sub {
          font-size: 11px; color: var(--text-muted);
        }

        @media (max-width: 768px) { .sidebar { display: none; } }
      `}</style>
    </aside>
  )
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

function TopBar({ pathname, userName }: { pathname: string; userName: string }) {
  const pageLabel = NAV_ITEMS.find((n) => pathname.startsWith(n.href))?.label ?? 'Lumi'
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{pageLabel}</h1>
        {pathname === '/dashboard' && (
          <p className="topbar-sub">{greeting}, {userName} 👋</p>
        )}
      </div>
      <div className="topbar-right">
        <button className="topbar-notif" aria-label="Notifications">
          🔔
        </button>
      </div>

      <style jsx>{`
        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 2rem 0;
          border-bottom: 1px solid var(--border);
          padding-bottom: 1.25rem;
          background: var(--bg-deep);
          position: sticky; top: 0; z-index: 30;
        }
        .topbar-title {
          font-family: var(--font-head);
          font-size: 22px; font-weight: 700;
          color: var(--text-primary); margin: 0;
        }
        .topbar-sub {
          font-size: 13px; color: var(--text-secondary); margin: 2px 0 0;
        }
        .topbar-notif {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 50%; width: 38px; height: 38px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; cursor: pointer;
          transition: border-color 0.2s;
        }
        .topbar-notif:hover { border-color: var(--gold); }
        @media (max-width: 768px) {
          .topbar { padding: 1rem 1rem 0.75rem; }
        }
      `}</style>
    </header>
  )
}

// ─── BottomNav — mobile ───────────────────────────────────────────────────────

function BottomNav({ pathname }: { pathname: string }) {
  // Show only 5 items in bottom nav
  const mobileItems = NAV_ITEMS.slice(0, 5)

  return (
    <nav className="bottom-nav">
      {mobileItems.map((item) => {
        const active = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={['bottom-link', active ? 'bottom-link--active' : ''].join(' ')}
          >
            <span className="bottom-icon">{item.emoji}</span>
            <span className="bottom-label">{item.label}</span>
          </Link>
        )
      })}

      <style jsx>{`
        .bottom-nav {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0;
          background: var(--bg-card);
          border-top: 1px solid var(--border);
          padding: 0.5rem 0 env(safe-area-inset-bottom, 0.5rem);
          z-index: 50;
        }
        .bottom-link {
          display: flex; flex-direction: column;
          align-items: center; gap: 3px;
          flex: 1; padding: 6px 4px;
          text-decoration: none;
          color: var(--text-muted);
          transition: color 0.18s;
        }
        .bottom-link--active { color: var(--gold); }
        .bottom-icon { font-size: 18px; }
        .bottom-label { font-size: 10px; font-weight: 500; }

        @media (max-width: 768px) {
          .bottom-nav { display: flex; }
        }
      `}</style>
    </nav>
  )
}

