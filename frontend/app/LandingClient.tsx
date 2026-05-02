'use client'

import Link from 'next/link'


const FEATURES = [
  { emoji: '📱', title: 'MTN MoMo Scanner',       desc: 'Paste any mobile money SMS and Lumi logs it automatically in seconds.' },
  { emoji: '✨', title: 'AI Financial Chat',       desc: 'Ask Lumi anything about your money and get answers from your actual data.' },
  { emoji: '🎯', title: 'Savings Goals',           desc: 'Set goals, track progress, and get AI coaching to stay on track.' },
  { emoji: '📊', title: 'Visual Reports',          desc: 'Weekly AI-generated charts and written summaries of your finances.' },
  { emoji: '🌍', title: 'Anonymous Community',     desc: 'Share wins and compete with peers — no real names, no actual amounts.' },
  { emoji: '🔒', title: 'Privacy First',           desc: 'JWT in HTTP-only cookies. Your financial data never leaves our servers.' },
]

const STATS = [
  { value: '10s', label: 'To log an MTN SMS' },
  { value: 'UGX', label: 'Native currency support' },
  { value: 'AI',  label: 'Powered insights' },
]

export default function LandingPage() {
  return (
    <main className="landing">

      {/* Nav */}
      <nav className="nav">
        <div className="nav-logo">
          <div className="nav-logo-icon">💡</div>
          <span className="nav-logo-text">Lumi</span>
        </div>
        <div className="nav-actions">
          <Link href="/auth/login"  className="nav-link">Sign in</Link>
          <Link href="/auth/signup" className="nav-cta">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-badge">🌍 Built for African youth</div>
        <h1 className="hero-title">
          Your Financial Future,<br />
          <span className="hero-accent">Illuminated</span>
        </h1>
        <p className="hero-sub">
          The AI-powered financial companion that understands MTN Mobile Money,
          speaks your currency, and helps you build wealth — starting today.
        </p>
        <div className="hero-btns">
          <Link href="/auth/signup" className="btn-primary-lg">
            Start for free →
          </Link>
          <Link href="/auth/login" className="btn-ghost-lg">
            I have an account
          </Link>
        </div>

        {/* Stats row */}
        <div className="stats-row">
          {STATS.map(s => (
            <div key={s.label} className="stat">
              <div className="stat-val">{s.value}</div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2 className="section-title">Everything you need to master your money</h2>
        <p className="section-sub">Built for Kampala, Lagos, Nairobi — not San Francisco.</p>
        <div className="features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-emoji">{f.emoji}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <h2 className="cta-title">Ready to illuminate your finances?</h2>
          <p className="cta-sub">Join thousands of African youth building wealth with Lumi.</p>
          <Link href="/auth/signup" className="btn-primary-lg">
            Create your free account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-logo">
          <span>💡</span> Lumi · Your Financial Future, Illuminated
        </div>
        <p className="footer-copy">
          Built with ❤️ for African youth · {new Date().getFullYear()}
        </p>
      </footer>

      <style jsx>{`
        .landing {
          min-height: 100vh;
          background: var(--bg-deep);
          color: var(--text-primary);
          font-family: var(--font-body);
        }

        /* Nav */
        .nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 2rem;
          border-bottom: 1px solid var(--border);
          position: sticky; top: 0; z-index: 40;
          background: rgba(10,15,30,0.9);
          backdrop-filter: blur(12px);
        }
        .nav-logo { display: flex; align-items: center; gap: 10px; }
        .nav-logo-icon {
          width: 34px; height: 34px; border-radius: 9px;
          background: linear-gradient(135deg, #FAC775, #EF9F27);
          display: flex; align-items: center; justify-content: center; font-size: 17px;
        }
        .nav-logo-text {
          font-family: var(--font-head); font-size: 20px; font-weight: 700;
          color: var(--gold); letter-spacing: -0.5px;
        }
        .nav-actions { display: flex; align-items: center; gap: 10px; }
        .nav-link {
          font-size: 14px; color: var(--text-secondary); text-decoration: none;
          padding: 7px 14px; border-radius: var(--radius-sm);
          transition: color 0.2s;
        }
        .nav-link:hover { color: var(--gold); }
        .nav-cta {
          font-size: 13.5px; font-weight: 600; color: #1a0f00;
          text-decoration: none; padding: 8px 18px;
          background: linear-gradient(135deg, #FAC775, #EF9F27);
          border-radius: var(--radius-sm);
          transition: opacity 0.2s, transform 0.15s;
        }
        .nav-cta:hover { opacity: 0.9; transform: translateY(-1px); color: #1a0f00; }

        /* Hero */
        .hero {
          text-align: center; padding: 5rem 2rem 4rem;
          max-width: 720px; margin: 0 auto;
          position: relative;
        }
        .hero-glow {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 600px; height: 300px;
          background: radial-gradient(ellipse, rgba(250,199,117,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-badge {
          display: inline-block; font-size: 13px; font-weight: 500;
          background: rgba(250,199,117,0.1); border: 1px solid rgba(250,199,117,0.25);
          color: var(--gold); padding: 5px 14px; border-radius: var(--radius-full);
          margin-bottom: 1.5rem;
        }
        .hero-title {
          font-family: var(--font-head); font-size: clamp(32px, 6vw, 54px);
          font-weight: 700; letter-spacing: -1px; margin-bottom: 1.25rem;
          line-height: 1.15;
        }
        .hero-accent {
          background: linear-gradient(135deg, #FAC775, #EF9F27);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-size: clamp(15px, 2.5vw, 18px); color: var(--text-secondary);
          line-height: 1.7; margin-bottom: 2rem; max-width: 560px; margin-inline: auto;
        }
        .hero-btns {
          display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
          margin-bottom: 3rem;
        }
        .btn-primary-lg {
          display: inline-block; padding: 13px 28px;
          background: linear-gradient(135deg, #FAC775, #EF9F27);
          color: #1a0f00; font-weight: 700; font-size: 15px;
          border-radius: var(--radius-sm); text-decoration: none;
          transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 4px 20px rgba(250,199,117,0.3);
        }
        .btn-primary-lg:hover { opacity: 0.9; transform: translateY(-2px); color: #1a0f00; }
        .btn-ghost-lg {
          display: inline-block; padding: 13px 28px;
          background: transparent; border: 1px solid var(--border);
          color: var(--text-secondary); font-size: 15px;
          border-radius: var(--radius-sm); text-decoration: none;
          transition: all 0.2s;
        }
        .btn-ghost-lg:hover { border-color: var(--border-focus); color: var(--gold); }

        /* Stats */
        .stats-row {
          display: flex; justify-content: center; gap: 3rem; flex-wrap: wrap;
        }
        .stat-val {
          font-family: var(--font-head); font-size: 28px; font-weight: 700; color: var(--gold);
        }
        .stat-lbl { font-size: 12px; color: var(--text-muted); margin-top: 3px; }

        /* Features */
        .features {
          padding: 4rem 2rem;
          max-width: 1100px; margin: 0 auto;
          text-align: center;
        }
        .section-title {
          font-family: var(--font-head); font-size: clamp(22px, 4vw, 32px);
          font-weight: 700; margin-bottom: 8px;
        }
        .section-sub { font-size: 15px; color: var(--text-secondary); margin-bottom: 3rem; }
        .features-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem; text-align: left;
        }
        .feature-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 1.5rem;
          transition: transform 0.2s, border-color 0.2s;
        }
        .feature-card:hover {
          transform: translateY(-3px); border-color: rgba(250,199,117,0.3);
        }
        .feature-emoji { font-size: 28px; margin-bottom: 12px; }
        .feature-title {
          font-family: var(--font-head); font-size: 16px; font-weight: 700;
          color: var(--text-primary); margin-bottom: 6px;
        }
        .feature-desc { font-size: 13.5px; color: var(--text-secondary); line-height: 1.65; }

        /* CTA */
        .cta-section { padding: 4rem 2rem; max-width: 700px; margin: 0 auto; }
        .cta-card {
          background: linear-gradient(135deg, rgba(250,199,117,0.08), rgba(29,158,117,0.05));
          border: 1px solid rgba(250,199,117,0.2);
          border-radius: var(--radius-xl); padding: 3rem 2rem;
          text-align: center;
        }
        .cta-title {
          font-family: var(--font-head); font-size: clamp(22px, 4vw, 30px);
          font-weight: 700; margin-bottom: 10px;
        }
        .cta-sub { font-size: 15px; color: var(--text-secondary); margin-bottom: 2rem; }

        /* Footer */
        .footer {
          text-align: center; padding: 2rem;
          border-top: 1px solid var(--border); color: var(--text-muted); font-size: 13px;
        }
        .footer-logo { font-size: 14px; margin-bottom: 4px; }
      `}</style>
    </main>
  )
}
