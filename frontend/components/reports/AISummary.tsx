'use client'

// components/reports/AISummary.tsx

interface AISummaryData {
  headline:    string
  body:        string
  top_insight: string
  savings_tip: string
}

interface AISummaryProps {
  summary: AISummaryData
  period:  string
  loading?: boolean
}

export function AISummary({ summary, period, loading = false }: AISummaryProps) {
  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(250,199,117,0.07), rgba(29,158,117,0.04))',
        border: '1px solid rgba(250,199,117,0.2)',
        borderRadius: 'var(--radius-lg)', padding: '1.25rem',
      }}>
        {[1,2,3].map(i => (
          <div key={i} style={{
            height: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 6,
            marginBottom: 10, width: i === 1 ? '60%' : i === 2 ? '90%' : '75%',
            animation: 'pulse 1.4s infinite',
          }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(250,199,117,0.07), rgba(29,158,117,0.04))',
      border: '1px solid rgba(250,199,117,0.2)',
      borderRadius: 'var(--radius-lg)', padding: '1.25rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, #FAC775, #EF9F27)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>💡</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold)' }}>Lumi AI Report</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{period}</div>
        </div>
      </div>

      <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        {summary.headline}
      </h3>
      <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 14 }}>
        {summary.body}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { label: '📊 Top category insight', text: summary.top_insight },
          { label: '💡 Savings tip',          text: summary.savings_tip },
        ].map((item) => (
          <div key={item.label} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)',
            borderRadius: 10, padding: 12,
          }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
              {item.label}
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
