'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--bg-deep)',
      color: 'var(--text-primary)', textAlign: 'center',
      padding: '2rem', fontFamily: 'var(--font-body)',
    }}>
      <div style={{ fontSize: 52, marginBottom: '1rem' }}>⚠️</div>
      <h1 style={{
        fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700, marginBottom: 8,
      }}>
        Something went wrong
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: '1.5rem', maxWidth: 340 }}>
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        style={{
          padding: '10px 22px',
          background: 'linear-gradient(135deg, #FAC775, #EF9F27)',
          color: '#1a0f00', fontWeight: 700, fontSize: 14,
          border: 'none', borderRadius: 8, cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </main>
  )
}
