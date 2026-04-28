'use client'

import React, { forwardRef, useState } from 'react'
import { getPasswordStrength } from '@/lib/validators'
import type { PasswordStrengthResult } from '@/types/auth.types'

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  showStrength?: boolean
}

const EyeOpenIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeOffIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

/**
 * PasswordInput — password field with:
 * - show / hide toggle
 * - optional 4-segment strength meter
 * - accessible aria labels
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, showStrength = false, onChange, value, ...props }, ref) => {
    const [visible, setVisible] = useState(false)
    const [strength, setStrength] = useState<PasswordStrengthResult>({
      score: 0,
      label: '',
      color: 'transparent',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (showStrength) {
        setStrength(getPasswordStrength(e.target.value))
      }
      onChange?.(e)
    }

    return (
      <div className="pw-field">
        {label && <label className="pw-label">{label}</label>}

        <div className="pw-wrap">
          <input
            ref={ref}
            type={visible ? 'text' : 'password'}
            className={['pw-input', error ? 'pw-input--error' : ''].filter(Boolean).join(' ')}
            onChange={handleChange}
            value={value}
            aria-invalid={!!error}
            autoComplete={props.autoComplete ?? 'current-password'}
            {...props}
          />

          <button
            type="button"
            className="pw-toggle"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? <EyeOffIcon /> : <EyeOpenIcon />}
          </button>
        </div>

        {showStrength && strength.score > 0 && (
          <div className="pw-strength">
            <div className="pw-segs">
              {[1, 2, 3, 4].map((seg) => (
                <div
                  key={seg}
                  className="pw-seg"
                  style={{
                    background: seg <= strength.score ? strength.color : 'rgba(255,255,255,0.08)',
                  }}
                />
              ))}
            </div>
            <span className="pw-strength-label" style={{ color: strength.color }}>
              {strength.label}
            </span>
          </div>
        )}

        {error && (
          <p className="pw-error" role="alert">
            {error}
          </p>
        )}

        <style jsx>{`
          .pw-field { display: flex; flex-direction: column; gap: 6px; }

          .pw-label {
            font-size: 12.5px; font-weight: 500;
            color: var(--text-secondary); letter-spacing: 0.02em;
          }

          .pw-wrap { position: relative; }

          .pw-input {
            width: 100%;
            background: var(--bg-input);
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            padding: 11px 44px 11px 14px;
            font-family: var(--font-body);
            font-size: 14px;
            color: var(--text-primary);
            outline: none;
            transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          }
          .pw-input:focus {
            border-color: var(--border-focus);
            background: var(--bg-input-focus);
            box-shadow: 0 0 0 3px var(--gold-glow-sm);
          }
          .pw-input::placeholder { color: var(--text-muted); }
          .pw-input--error { border-color: rgba(216,90,48,0.6); }

          .pw-toggle {
            position: absolute; right: 12px; top: 50%;
            transform: translateY(-50%);
            background: none; border: none; cursor: pointer;
            color: var(--text-muted); padding: 4px;
            display: flex; align-items: center;
            transition: color 0.2s;
            border-radius: 4px;
          }
          .pw-toggle:hover { color: var(--gold); }
          .pw-toggle:focus-visible {
            outline: 2px solid var(--gold);
            outline-offset: 2px;
          }

          .pw-strength { display: flex; flex-direction: column; gap: 4px; }
          .pw-segs { display: flex; gap: 4px; }
          .pw-seg {
            flex: 1; height: 3px; border-radius: 2px;
            transition: background 0.3s;
          }
          .pw-strength-label { font-size: 11px; }

          .pw-error { font-size: 11.5px; color: var(--red); }
        `}</style>
      </div>
    )
  },
)

PasswordInput.displayName = 'PasswordInput'
