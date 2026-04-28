'use client'

import React, { forwardRef, useState, useId } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightElement?: React.ReactNode
}

/**
 * Input — base form input with label, error, hint and icon slots.
 * Uses forwardRef so parent forms can call .focus() on it.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightElement, className = '', id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId

    return (
      <div className="lumi-field">
        {label && (
          <label htmlFor={inputId} className="lumi-label">
            {label}
          </label>
        )}

        <div className="lumi-input-wrap">
          {leftIcon && <span className="lumi-input-left-icon">{leftIcon}</span>}

          <input
            ref={ref}
            id={inputId}
            className={[
              'lumi-input',
              leftIcon ? 'lumi-input--has-left' : '',
              error ? 'lumi-input--error' : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />

          {rightElement && (
            <span className="lumi-input-right">{rightElement}</span>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="lumi-field-error" role="alert">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${inputId}-hint`} className="lumi-field-hint">
            {hint}
          </p>
        )}

        <style jsx>{`
          .lumi-field { display: flex; flex-direction: column; gap: 6px; }

          .lumi-label {
            font-size: 12.5px;
            font-weight: 500;
            color: var(--text-secondary);
            letter-spacing: 0.02em;
          }

          .lumi-input-wrap { position: relative; display: flex; align-items: center; }

          .lumi-input {
            width: 100%;
            background: var(--bg-input);
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            padding: 11px 42px 11px 14px;
            font-family: var(--font-body);
            font-size: 14px;
            color: var(--text-primary);
            outline: none;
            transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          }

          .lumi-input--has-left { padding-left: 40px; }

          .lumi-input:focus {
            border-color: var(--border-focus);
            background: var(--bg-input-focus);
            box-shadow: 0 0 0 3px var(--gold-glow-sm);
          }

          .lumi-input::placeholder { color: var(--text-muted); }

          .lumi-input--error {
            border-color: rgba(216, 90, 48, 0.6);
          }

          .lumi-input-left-icon {
            position: absolute;
            left: 13px;
            color: var(--text-muted);
            display: flex;
            align-items: center;
            pointer-events: none;
          }

          .lumi-input-right {
            position: absolute;
            right: 10px;
            display: flex;
            align-items: center;
          }

          .lumi-field-error {
            font-size: 11.5px;
            color: var(--red);
            line-height: 1.4;
          }

          .lumi-field-hint {
            font-size: 11.5px;
            color: var(--text-muted);
            line-height: 1.4;
          }
        `}</style>
      </div>
    )
  },
)

Input.displayName = 'Input'
