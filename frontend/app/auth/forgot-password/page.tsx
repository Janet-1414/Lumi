'use client'

import { useState, useEffect, useCallback } from 'react'
import { AuthCard, AuthLogo } from '@/components/auth/AuthCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { OtpInput } from '@/components/auth/OtpInput'
import { useAuth } from '@/hooks/useAuth'
import {
  isValidEmail,
  isStrongPassword,
  passwordsMatch,
  isCompleteOtp,
} from '@/lib/validators'

type Step = 'email' | 'otp' | 'new-password' | 'success'

// ─── Step progress bar ────────────────────────────────────────────────────────

function StepBar({ step }: { step: Step }) {
  const map: Record<Step, number> = { email: 1, otp: 2, 'new-password': 3, success: 3 }
  const current = map[step]

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          style={{
            flex: 1, height: 3, borderRadius: 2,
            background:
              n < current ? 'var(--teal)' :
              n === current ? 'var(--gold)' :
              'rgba(255,255,255,0.08)',
            transition: 'background 0.4s',
          }}
        />
      ))}
    </div>
  )
}

// ─── Back button ──────────────────────────────────────────────────────────────

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-secondary)', fontFamily: 'var(--font-body)',
        fontSize: 13, padding: 0, marginBottom: '1.25rem',
        transition: 'color 0.2s',
      }}
    >
      ← Back
    </button>
  )
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const { forgotPassword, resetPassword, loading, error: apiError } = useAuth()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [otpError, setOtpError] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwError, setPwError] = useState('')
  const [confirmError, setConfirmError] = useState('')

  // Resend countdown
  const [secondsLeft, setSecondsLeft] = useState(59)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if (step !== 'otp') return
    setSecondsLeft(59); setCanResend(false)
  }, [step])

  useEffect(() => {
    if (step !== 'otp' || secondsLeft <= 0) { if (secondsLeft <= 0) setCanResend(true); return }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft, step])

  // ─── Step 1: Email ──────────────────────────────────────────────────────────

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(email)) { setEmailError('Please enter a valid email address'); return }
    setEmailError('')
    const ok = await forgotPassword({ email: email.trim().toLowerCase() })
    if (ok) setStep('otp')
  }

  // ─── Step 2: OTP ────────────────────────────────────────────────────────────

  const handleOtpChange = useCallback((next: string[]) => {
    setDigits(next); setOtpError('')
  }, [])

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isCompleteOtp(digits)) { setOtpError('Please enter all 6 digits'); return }
    setOtpError('')
    setStep('new-password')
  }

  const handleResend = async () => {
    await forgotPassword({ email })
    setSecondsLeft(59); setCanResend(false)
    setDigits(Array(6).fill(''))
  }

  // ─── Step 3: New password ───────────────────────────────────────────────────

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let ok = true
    if (!isStrongPassword(newPassword)) { setPwError('Password must have uppercase, lowercase, number and symbol'); ok = false }
    if (!passwordsMatch(newPassword, confirmPassword)) { setConfirmError('Passwords do not match'); ok = false }
    if (!ok) return

    const done = await resetPassword({
      email,
      code: digits.join(''),
      new_password: newPassword,
    })
    if (done) setStep('success')
  }

  // ─── Success ────────────────────────────────────────────────────────────────

  if (step === 'success') {
    return (
      <AuthCard>
        <AuthLogo />
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64,
            background: 'rgba(29,158,117,0.12)',
            border: '1px solid rgba(29,158,117,0.3)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem', fontSize: 28,
          }}>
            ✅
          </div>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Password reset!</h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Your password has been updated. You can now sign in with your new password.
          </p>
          <Button onClick={() => window.location.href = '/auth/login'}>
            Sign in now
          </Button>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <AuthLogo />
      <StepBar step={step} />

      {/* ── Step 1: Email ── */}
      {step === 'email' && (
        <>
          <BackBtn onClick={() => window.location.href = '/auth/login'} />
          <h1 style={{ fontSize: 24, marginBottom: 6 }}>Forgot password?</h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            No worries. Enter your email and we&apos;ll send you a recovery code.
          </p>
          <form onSubmit={handleEmailSubmit} noValidate>
            <div style={{ marginBottom: '1rem' }}>
              <Input
                label="Email address"
                type="email"
                placeholder="akosua@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                error={emailError || apiError || undefined}
                autoComplete="email"
                autoFocus
              />
            </div>
            <Button type="submit" loading={loading}>Send recovery code</Button>
          </form>
          <Button variant="ghost" onClick={() => window.location.href = '/auth/login'} style={{ marginTop: '0.5rem' }}>
            Cancel
          </Button>
        </>
      )}

      {/* ── Step 2: OTP ── */}
      {step === 'otp' && (
        <>
          <BackBtn onClick={() => setStep('email')} />
          <div style={{
            width: 64, height: 64,
            background: 'rgba(250,199,117,0.1)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem', fontSize: 28,
          }}>
            🔐
          </div>
          <h1 style={{ fontSize: 24, textAlign: 'center', marginBottom: 6 }}>Enter recovery code</h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1rem' }}>
            We sent a 6-digit code to{' '}
            <strong style={{ color: 'var(--gold)' }}>{email}</strong>
          </p>
          <form onSubmit={handleOtpSubmit}>
            <OtpInput value={digits} onChange={handleOtpChange} error={otpError || undefined} autoFocus />
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', margin: '0.75rem 0' }}>
              {canResend ? (
                <>
                  Didn&apos;t receive it?{' '}
                  <button type="button" onClick={handleResend}
                    style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                    Resend code
                  </button>
                </>
              ) : (
                <>Resend in <span style={{ color: 'var(--gold)', fontWeight: 500 }}>{secondsLeft}s</span></>
              )}
            </p>
            <Button type="submit" loading={loading} style={{ marginTop: '0.5rem' }}>
              Verify code
            </Button>
          </form>
        </>
      )}

      {/* ── Step 3: New password ── */}
      {step === 'new-password' && (
        <>
          <h1 style={{ fontSize: 24, marginBottom: 6 }}>Set new password</h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Make it strong — you&apos;re protecting your financial data.
          </p>
          <form onSubmit={handleResetSubmit} noValidate>
            <div style={{ marginBottom: '1rem' }}>
              <PasswordInput
                label="New password"
                placeholder="Create a strong password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setPwError('') }}
                error={pwError}
                showStrength
                autoComplete="new-password"
                autoFocus
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <PasswordInput
                label="Confirm new password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setConfirmError('') }}
                error={confirmError}
                autoComplete="new-password"
              />
            </div>
            {apiError && (
              <p style={{ fontSize: 12.5, color: 'var(--red)', marginBottom: 12, textAlign: 'center' }}>{apiError}</p>
            )}
            <Button type="submit" loading={loading}>Reset my password</Button>
          </form>
        </>
      )}
    </AuthCard>
  )
}
