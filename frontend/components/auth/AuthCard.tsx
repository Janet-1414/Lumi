import React from 'react'

interface AuthCardProps {
  children: React.ReactNode
}

/**
 * AuthCard — full-page centered layout wrapper for all auth screens.
 * Provides the dark background, glow effects, and centered card.
 */
export function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow--top" />
      <div className="auth-glow auth-glow--bottom" />
      <div className="auth-card animate-fadeUp">{children}</div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          background: var(--bg-deep);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
        }

        .auth-glow {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .auth-glow--top {
          top: -200px; left: -200px;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(250,199,117,0.06) 0%, transparent 70%);
        }
        .auth-glow--bottom {
          bottom: -200px; right: -200px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(29,158,117,0.05) 0%, transparent 70%);
        }

        .auth-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 2.25rem 2rem;
          box-shadow: var(--shadow-card);
        }

        @media (max-width: 480px) {
          .auth-card { padding: 1.75rem 1.25rem; }
        }
      `}</style>
    </div>
  )
}

// ─── Logo row ─────────────────────────────────────────────────────────────────

export function AuthLogo() {
  return (
    <div className="auth-logo">
      <div className="auth-logo-icon">💡</div>
      <span className="auth-logo-text">Lumi</span>

      <style jsx>{`
        .auth-logo {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 1.75rem;
        }
        .auth-logo-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #FAC775, #EF9F27);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        .auth-logo-text {
          font-family: var(--font-head);
          font-size: 22px; font-weight: 700;
          color: var(--gold); letter-spacing: -0.5px;
        }
      `}</style>
    </div>
  )
}

// ─── Nav tabs (Login / Register switcher) ─────────────────────────────────────

interface AuthTabsProps {
  active: 'login' | 'register'
}

export function AuthTabs({ active }: AuthTabsProps) {
  return (
    <div className="auth-tabs">
      <a
        href="/auth/signup"
        className={['auth-tab', active === 'register' ? 'auth-tab--active' : ''].join(' ')}
      >
        Create account
      </a>
      <a
        href="/auth/login"
        className={['auth-tab', active === 'login' ? 'auth-tab--active' : ''].join(' ')}
      >
        Sign in
      </a>

      <style jsx>{`
        .auth-tabs {
          display: flex;
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 1.75rem;
          text-decoration: none;
        }
        .auth-tab {
          flex: 1; padding: 8px;
          border-radius: 7px;
          font-family: var(--font-body);
          font-size: 13.5px; font-weight: 500;
          color: var(--text-secondary);
          text-align: center;
          text-decoration: none;
          transition: all 0.2s;
        }
        .auth-tab:hover { color: var(--text-primary); }
        .auth-tab--active {
          background: linear-gradient(135deg, #FAC775, #EF9F27);
          color: #1a0f00;
        }
        .auth-tab--active:hover { color: #1a0f00; }
      `}</style>
    </div>
  )
}
