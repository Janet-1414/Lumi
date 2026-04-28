'use client'

import React, { useState } from 'react'
import type { TransactionCategory, TransactionType } from '@/types/dashboard.types'
import { getCategoryMeta } from '@/lib/categories'
import { formatCurrency } from '@/lib/formatters'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScanPreview {
  amount:      number
  type:        TransactionType
  category:    TransactionCategory
  description: string
  date:        string
  currency:    string
  confidence:  number
  raw_text:    string
}

type ScanStep = 'idle' | 'scanning' | 'preview' | 'saving' | 'success' | 'error'

interface SMSScannerProps {
  onTransactionSaved?: () => void
}

// ─── Example MTN SMS messages ─────────────────────────────────────────────────

const EXAMPLE_SMS = [
  'You have received UGX 350,000 from ANDELA KENYA LTD on 15/01/2025. Your new balance is UGX 2,450,000. Transaction ID: TXN123456789.',
  'MTN MoMo: You sent UGX 30,000 to NAKATO SARAH (0772123456) on 15/01/2025. Fee: UGX 500. Balance: UGX 2,419,500.',
  'Airtel Money: You bought airtime of UGX 10,000 for 0752345678. Balance UGX 245,000. Ref: AIR20250115001.',
]

/**
 * SMSScanner — Lumi's flagship AI feature.
 *
 * Flow:
 *   1. User pastes MTN MoMo SMS (or any receipt text)
 *   2. We hit POST /transactions/scan → AI extracts details
 *   3. User sees a preview and can edit before confirming
 *   4. User confirms → POST /transactions/scan/confirm → saved to DB
 *   5. Parent refreshes the transaction list
 */
export function SMSScanner({ onTransactionSaved }: SMSScannerProps) {
  const [expanded, setExpanded]   = useState(false)
  const [step,     setStep]       = useState<ScanStep>('idle')
  const [smsText,  setSmsText]    = useState('')
  const [preview,  setPreview]    = useState<ScanPreview | null>(null)
  const [edited,   setEdited]     = useState<Partial<ScanPreview>>({})
  const [error,    setError]      = useState('')

  const merged = { ...preview, ...edited } as ScanPreview

  // ── Step 1: Scan ─────────────────────────────────────────────────────────

  const handleScan = async () => {
    if (!smsText.trim() || smsText.length < 10) {
      setError('Please paste your SMS message first.')
      return
    }

    setStep('scanning')
    setError('')

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/scan`,
        {
          method:      'POST',
          credentials: 'include',
          headers:     { 'Content-Type': 'application/json' },
          body:        JSON.stringify({ text: smsText }),
        },
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail ?? 'Could not parse this message.')
      }

      const data: ScanPreview = await res.json()
      setPreview(data)
      setEdited({})
      setStep('preview')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Scanner failed. Please try again.')
      setStep('error')
    }
  }

  // ── Step 2: Confirm ───────────────────────────────────────────────────────

  const handleConfirm = async () => {
    if (!merged) return
    setStep('saving')

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/scan/confirm`,
        {
          method:      'POST',
          credentials: 'include',
          headers:     { 'Content-Type': 'application/json' },
          body:        JSON.stringify({
            amount:      merged.amount,
            type:        merged.type,
            category:    merged.category,
            description: merged.description,
            date:        merged.date,
            currency:    merged.currency,
          }),
        },
      )

      if (!res.ok) throw new Error('Could not save transaction.')

      setStep('success')
      onTransactionSaved?.()

      // Reset after 2s
      setTimeout(() => {
        setStep('idle'); setExpanded(false)
        setSmsText(''); setPreview(null); setEdited({})
      }, 2000)
    } catch {
      setError('Failed to save. Please try again.')
      setStep('error')
    }
  }

  const reset = () => {
    setStep('idle'); setError(''); setPreview(null); setEdited({})
  }

  const meta = merged?.category ? getCategoryMeta(merged.category) : null

  return (
    <div className="scanner-root">
      {/* ── Collapsed banner ── */}
      {!expanded && (
        <button className="scanner-banner" onClick={() => setExpanded(true)}>
          <div className="scanner-banner-left">
            <span className="scanner-icon">📱</span>
            <div>
              <div className="scanner-title">MTN MoMo SMS Scanner</div>
              <div className="scanner-sub">Paste a mobile money message — Lumi logs it instantly</div>
            </div>
          </div>
          <span className="scanner-cta">Try it ✨</span>
        </button>
      )}

      {/* ── Expanded panel ── */}
      {expanded && (
        <div className="scanner-panel">
          <div className="scanner-panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="scanner-avatar">✨</div>
              <div>
                <div className="scanner-panel-title">AI SMS Scanner</div>
                <div className="scanner-panel-sub">Lumi reads your MTN Mobile Money messages</div>
              </div>
            </div>
            <button className="scanner-close" onClick={() => { setExpanded(false); reset() }} aria-label="Close">✕</button>
          </div>

          {/* ── Idle: text input ── */}
          {(step === 'idle' || step === 'error') && (
            <>
              <textarea
                className="scanner-textarea"
                placeholder="Paste your MTN MoMo SMS here…&#10;&#10;e.g. &quot;You have received UGX 350,000 from ANDELA on 15/01/2025&quot;"
                value={smsText}
                onChange={(e) => { setSmsText(e.target.value); setError('') }}
                rows={4}
                aria-label="SMS text input"
              />

              {/* Example pills */}
              <div className="scanner-examples">
                <span className="scanner-examples-label">Try an example:</span>
                <div className="scanner-example-pills">
                  {EXAMPLE_SMS.map((ex, i) => (
                    <button
                      key={i}
                      className="scanner-example-pill"
                      onClick={() => setSmsText(ex)}
                    >
                      Example {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="scanner-error">{error}</p>}

              <button className="scanner-btn-primary" onClick={handleScan}>
                <span>📱</span> Scan message
              </button>
            </>
          )}

          {/* ── Scanning spinner ── */}
          {step === 'scanning' && (
            <div className="scanner-loading">
              <div className="scanner-spinner" />
              <p className="scanner-loading-text">Lumi AI is reading your message…</p>
              <p className="scanner-loading-sub">Usually takes 2–3 seconds</p>
            </div>
          )}

          {/* ── Preview ── */}
          {step === 'preview' && preview && (
            <div className="scanner-preview">
              <div className="preview-header">
                <span className="preview-check">✅</span>
                <span className="preview-label">Transaction extracted</span>
                <span
                  className="preview-confidence"
                  style={{ color: preview.confidence > 0.8 ? 'var(--teal)' : 'var(--gold)' }}
                >
                  {Math.round(preview.confidence * 100)}% confidence
                </span>
              </div>

              {/* Editable fields */}
              <div className="preview-card">
                {/* Amount */}
                <div className="preview-row">
                  <span className="preview-field-label">Amount</span>
                  <div className="preview-field-value preview-amount" style={{ color: merged.type === 'income' ? 'var(--teal)' : 'var(--text-primary)' }}>
                    {merged.type === 'income' ? '+' : '-'}
                    {formatCurrency(merged.amount, merged.currency)}
                  </div>
                </div>

                {/* Category */}
                <div className="preview-row">
                  <span className="preview-field-label">Category</span>
                  <select
                    className="preview-select"
                    value={merged.category}
                    onChange={(e) => setEdited((p) => ({ ...p, category: e.target.value as TransactionCategory }))}
                  >
                    {(['food','transport','shopping','utilities','health','education','savings','income','mobile_money','other'] as TransactionCategory[]).map((cat) => (
                      <option key={cat} value={cat}>{getCategoryMeta(cat).emoji} {getCategoryMeta(cat).label}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="preview-row">
                  <span className="preview-field-label">Description</span>
                  <input
                    className="preview-input"
                    value={merged.description}
                    onChange={(e) => setEdited((p) => ({ ...p, description: e.target.value }))}
                  />
                </div>

                {/* Date */}
                <div className="preview-row">
                  <span className="preview-field-label">Date</span>
                  <input
                    className="preview-input"
                    type="date"
                    value={merged.date}
                    onChange={(e) => setEdited((p) => ({ ...p, date: e.target.value }))}
                  />
                </div>

                {/* Type badge */}
                <div className="preview-row">
                  <span className="preview-field-label">Type</span>
                  <span className={`preview-type-badge preview-type-badge--${merged.type}`}>
                    {merged.type === 'income' ? '📈 Income' : '📉 Expense'}
                  </span>
                </div>
              </div>

              {/* Raw SMS */}
              <details className="preview-raw">
                <summary>Original message</summary>
                <p>{preview.raw_text}</p>
              </details>

              <div className="preview-actions">
                <button className="scanner-btn-ghost" onClick={reset}>← Rescan</button>
                <button className="scanner-btn-primary" onClick={handleConfirm}>
                  Save transaction ✓
                </button>
              </div>
            </div>
          )}

          {/* ── Saving ── */}
          {step === 'saving' && (
            <div className="scanner-loading">
              <div className="scanner-spinner" />
              <p className="scanner-loading-text">Saving your transaction…</p>
            </div>
          )}

          {/* ── Success ── */}
          {step === 'success' && (
            <div className="scanner-success">
              <div className="success-icon">🎉</div>
              <p className="success-text">Transaction saved!</p>
              <p className="success-sub">Your transaction has been logged automatically.</p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .scanner-root { margin-bottom: 0; }

        /* ── Banner ── */
        .scanner-banner {
          width: 100%;
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px;
          background: linear-gradient(135deg, rgba(250,199,117,0.08) 0%, rgba(29,158,117,0.05) 100%);
          border: 1px solid rgba(250,199,117,0.25);
          border-radius: var(--radius-lg);
          padding: 1rem 1.25rem;
          cursor: pointer; text-align: left;
          transition: border-color 0.2s, transform 0.2s;
        }
        .scanner-banner:hover {
          border-color: rgba(250,199,117,0.5);
          transform: translateY(-1px);
        }
        .scanner-banner-left { display: flex; align-items: center; gap: 12px; }
        .scanner-icon { font-size: 24px; }
        .scanner-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
        .scanner-sub   { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
        .scanner-cta   { font-size: 13px; font-weight: 600; color: var(--gold); white-space: nowrap; flex-shrink: 0; }

        /* ── Panel ── */
        .scanner-panel {
          background: var(--bg-card);
          border: 1px solid rgba(250,199,117,0.3);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          box-shadow: 0 0 40px rgba(250,199,117,0.06);
        }
        .scanner-panel-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .scanner-avatar {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #FAC775, #EF9F27);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
        }
        .scanner-panel-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
        .scanner-panel-sub   { font-size: 11.5px; color: var(--text-secondary); }
        .scanner-close {
          background: none; border: none; cursor: pointer;
          color: var(--text-muted); font-size: 16px;
          width: 28px; height: 28px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .scanner-close:hover { background: rgba(255,255,255,0.06); color: var(--text-primary); }

        /* ── Textarea ── */
        .scanner-textarea {
          width: 100%;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 12px 14px;
          font-family: var(--font-body); font-size: 13px;
          color: var(--text-primary);
          resize: vertical; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          line-height: 1.6;
          min-height: 100px;
        }
        .scanner-textarea:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px var(--gold-glow-sm);
        }
        .scanner-textarea::placeholder { color: var(--text-muted); }

        /* ── Examples ── */
        .scanner-examples { margin: 10px 0; }
        .scanner-examples-label { font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 6px; }
        .scanner-example-pills { display: flex; gap: 6px; flex-wrap: wrap; }
        .scanner-example-pill {
          padding: 4px 10px; border-radius: 20px;
          background: rgba(250,199,117,0.08);
          border: 1px solid rgba(250,199,117,0.2);
          color: var(--gold); font-size: 11.5px;
          cursor: pointer; transition: background 0.15s;
          font-family: var(--font-body);
        }
        .scanner-example-pill:hover { background: rgba(250,199,117,0.15); }

        .scanner-error { font-size: 12px; color: var(--red); margin: 6px 0; }

        /* ── Buttons ── */
        .scanner-btn-primary {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          width: 100%; padding: 11px;
          background: linear-gradient(135deg, #FAC775, #EF9F27);
          border: none; border-radius: var(--radius-sm);
          font-family: var(--font-body); font-size: 14px; font-weight: 600;
          color: #1a0f00; cursor: pointer; margin-top: 12px;
          transition: opacity 0.2s, transform 0.15s;
        }
        .scanner-btn-primary:hover { opacity: 0.92; transform: translateY(-1px); }

        .scanner-btn-ghost {
          display: flex; align-items: center; justify-content: center;
          flex: 1; padding: 10px;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-family: var(--font-body); font-size: 13.5px;
          color: var(--text-secondary); cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .scanner-btn-ghost:hover { border-color: var(--border-focus); color: var(--gold); }

        /* ── Loading ── */
        .scanner-loading {
          display: flex; flex-direction: column; align-items: center;
          gap: 10px; padding: 2rem 0;
        }
        .scanner-spinner {
          width: 32px; height: 32px;
          border: 3px solid rgba(250,199,117,0.2);
          border-top-color: var(--gold);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .scanner-loading-text { font-size: 14px; color: var(--text-primary); font-weight: 500; }
        .scanner-loading-sub  { font-size: 12px; color: var(--text-muted); }

        /* ── Preview ── */
        .scanner-preview { display: flex; flex-direction: column; gap: 12px; }
        .preview-header {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px;
        }
        .preview-check { font-size: 16px; }
        .preview-label { font-weight: 500; color: var(--text-primary); flex: 1; }
        .preview-confidence { font-size: 12px; font-weight: 600; }

        .preview-card {
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          overflow: hidden;
        }
        .preview-row {
          display: flex; align-items: center;
          padding: 10px 14px; gap: 12px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .preview-row:last-child { border-bottom: none; }
        .preview-field-label {
          font-size: 11.5px; color: var(--text-muted);
          font-weight: 500; width: 90px; flex-shrink: 0;
        }
        .preview-field-value { font-size: 14px; color: var(--text-primary); }
        .preview-amount { font-family: var(--font-head); font-weight: 700; font-size: 18px; }

        .preview-input {
          flex: 1; background: transparent; border: none; outline: none;
          font-family: var(--font-body); font-size: 13.5px;
          color: var(--text-primary); padding: 0;
        }
        .preview-input:focus { color: var(--gold); }
        .preview-select {
          flex: 1; background: transparent; border: none; outline: none;
          font-family: var(--font-body); font-size: 13.5px;
          color: var(--text-primary); cursor: pointer;
          appearance: none;
        }
        .preview-select option { background: var(--bg-card); }

        .preview-type-badge {
          font-size: 12px; font-weight: 600; padding: 3px 10px;
          border-radius: 20px;
        }
        .preview-type-badge--income  { background: rgba(29,158,117,0.15); color: var(--teal); }
        .preview-type-badge--expense { background: rgba(216,90,48,0.12);  color: var(--red);  }

        .preview-raw {
          font-size: 11.5px; color: var(--text-muted); cursor: pointer;
        }
        .preview-raw summary { outline: none; margin-bottom: 6px; }
        .preview-raw p {
          background: var(--bg-input); border-radius: 6px;
          padding: 8px 10px; line-height: 1.5;
          border: 1px solid var(--border-subtle);
        }

        .preview-actions { display: flex; gap: 8px; }

        /* ── Success ── */
        .scanner-success {
          display: flex; flex-direction: column; align-items: center;
          gap: 8px; padding: 1.5rem 0;
        }
        .success-icon  { font-size: 36px; }
        .success-text  { font-size: 16px; font-weight: 600; color: var(--teal); }
        .success-sub   { font-size: 13px; color: var(--text-secondary); text-align: center; }
      `}</style>
    </div>
  )
}
