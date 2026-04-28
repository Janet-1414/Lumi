import Link from 'next/link'

export default function NotFound() {
  return (
    <main style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--bg-deep)',
      color: 'var(--text-primary)', textAlign: 'center',
      padding: '2rem', fontFamily: 'var(--font-body)',
    }}>
      <div style={{ fontSize: 64, marginBottom: '1rem' }}>💡</div>
      <h1 style={{
        fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 700,
        marginBottom: 8,
      }}>
        Page not found
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: '2rem', maxWidth: 360 }}>
        This page doesn't exist. Let's get you back on track.
      </p>
      <Link
        href="/dashboard"
        style={{
          padding: '11px 24px',
          background: 'linear-gradient(135deg, #FAC775, #EF9F27)',
          color: '#1a0f00', fontWeight: 700, fontSize: 14,
          borderRadius: 8, textDecoration: 'none',
        }}
      >
        Go to Dashboard →
      </Link>
    </main>
  )
}
