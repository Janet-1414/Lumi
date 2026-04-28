'use client'

import React, { forwardRef } from 'react'

type ButtonVariant = 'primary' | 'ghost' | 'danger'
type ButtonSize    = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
}

/**
 * Button — Lumi design system button.
 * Variants: primary (gold gradient), ghost (outlined), danger (red).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = true,
      leftIcon,
      children,
      disabled,
      className = '',
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    return (
      <>
        <button
          ref={ref}
          disabled={isDisabled}
          className={[
            'lumi-btn',
            `lumi-btn--${variant}`,
            `lumi-btn--${size}`,
            fullWidth ? 'lumi-btn--full' : '',
            loading ? 'lumi-btn--loading' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-busy={loading}
          {...props}
        >
          {loading ? (
            <span className="lumi-btn-spinner" aria-hidden="true" />
          ) : leftIcon ? (
            <span className="lumi-btn-icon">{leftIcon}</span>
          ) : null}
          <span>{children}</span>
        </button>

        <style jsx>{`
          .lumi-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border: none;
            border-radius: var(--radius-sm);
            font-family: var(--font-body);
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
            letter-spacing: 0.01em;
            text-decoration: none;
            position: relative;
            white-space: nowrap;
          }

          .lumi-btn--full { width: 100%; }

          /* Sizes */
          .lumi-btn--sm  { font-size: 13px;   padding: 8px 16px; }
          .lumi-btn--md  { font-size: 14.5px; padding: 12px 20px; }
          .lumi-btn--lg  { font-size: 15.5px; padding: 14px 24px; }

          /* Primary */
          .lumi-btn--primary {
            background: linear-gradient(135deg, #FAC775, #EF9F27);
            color: #1a0f00;
          }
          .lumi-btn--primary:hover:not(:disabled) {
            opacity: 0.92;
            transform: translateY(-1px);
            box-shadow: var(--shadow-gold);
          }
          .lumi-btn--primary:active:not(:disabled) { transform: translateY(0); }

          /* Ghost */
          .lumi-btn--ghost {
            background: transparent;
            border: 1px solid var(--border);
            color: var(--text-secondary);
          }
          .lumi-btn--ghost:hover:not(:disabled) {
            border-color: var(--border-focus);
            color: var(--gold);
            background: var(--gold-glow-sm);
          }

          /* Danger */
          .lumi-btn--danger {
            background: transparent;
            border: 1px solid rgba(216, 90, 48, 0.4);
            color: var(--red);
          }
          .lumi-btn--danger:hover:not(:disabled) {
            background: rgba(216, 90, 48, 0.1);
          }

          /* Disabled */
          .lumi-btn:disabled {
            opacity: 0.45;
            cursor: not-allowed;
            transform: none !important;
          }

          /* Spinner */
          .lumi-btn-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(0,0,0,0.2);
            border-top-color: #1a0f00;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
            flex-shrink: 0;
          }
          .lumi-btn--ghost .lumi-btn-spinner,
          .lumi-btn--danger .lumi-btn-spinner {
            border-color: rgba(255,255,255,0.15);
            border-top-color: var(--gold);
          }

          .lumi-btn-icon { display: flex; align-items: center; }

          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </>
    )
  },
)

Button.displayName = 'Button'
