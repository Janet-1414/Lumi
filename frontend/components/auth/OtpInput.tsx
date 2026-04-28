'use client'

import React, { useRef, useCallback } from 'react'

interface OtpInputProps {
  length?: number
  value: string[]
  onChange: (digits: string[]) => void
  error?: string
  autoFocus?: boolean
}

/**
 * OtpInput — 6-digit OTP entry with:
 * - Auto-advance on digit entry
 * - Backspace navigates to previous field
 * - Paste fills all fields at once
 * - Fully accessible with aria labels
 */
export function OtpInput({
  length = 6,
  value,
  onChange,
  error,
  autoFocus = true,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const focus = (index: number) => {
    inputRefs.current[index]?.focus()
  }

  const handleChange = useCallback(
    (index: number, raw: string) => {
      // Only accept digits
      const digit = raw.replace(/\D/g, '').slice(-1)
      const next = [...value]
      next[index] = digit

      onChange(next)

      // Auto-advance
      if (digit && index < length - 1) {
        focus(index + 1)
      }
    },
    [value, onChange, length],
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (value[index]) {
          const next = [...value]
          next[index] = ''
          onChange(next)
        } else if (index > 0) {
          focus(index - 1)
        }
      }
      if (e.key === 'ArrowLeft' && index > 0) focus(index - 1)
      if (e.key === 'ArrowRight' && index < length - 1) focus(index + 1)
    },
    [value, onChange, length],
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      const pasted = e.clipboardData
        .getData('text')
        .replace(/\D/g, '')
        .slice(0, length)
        .split('')

      const next = Array.from({ length }, (_, i) => pasted[i] ?? '')
      onChange(next)

      const lastFilled = Math.min(pasted.length, length - 1)
      focus(lastFilled)
    },
    [onChange, length],
  )

  return (
    <div className="otp-root">
      <div
        className="otp-wrap"
        role="group"
        aria-label="One-time password input"
      >
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el }}
            className={['otp-box', value[i] ? 'otp-box--filled' : ''].filter(Boolean).join(' ')}
            type="text"
            inputMode="numeric"
            pattern="[0-9]"
            maxLength={1}
            value={value[i] ?? ''}
            autoFocus={autoFocus && i === 0}
            aria-label={`Digit ${i + 1} of ${length}`}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>

      {error && (
        <p className="otp-error" role="alert">
          {error}
        </p>
      )}

      <style jsx>{`
        .otp-root { display: flex; flex-direction: column; gap: 8px; }

        .otp-wrap {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .otp-box {
          width: 48px; height: 56px;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          text-align: center;
          font-family: var(--font-head);
          font-size: 22px;
          font-weight: 600;
          color: var(--gold);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          caret-color: var(--gold);
        }

        .otp-box:focus {
          border-color: var(--border-focus);
          background: var(--bg-input-focus);
          box-shadow: 0 0 0 3px var(--gold-glow-sm);
        }

        .otp-box--filled {
          border-color: rgba(250, 199, 117, 0.4);
        }

        .otp-error {
          text-align: center;
          font-size: 11.5px;
          color: var(--red);
        }
      `}</style>
    </div>
  )
}
