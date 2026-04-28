'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AuthCard, AuthLogo } from '@/components/auth/AuthCard'
import { OtpInput } from '@/components/auth/OtpInput'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { isCompleteOtp } from '@/lib/validators'

const RESEND_COOLDOWN = 59

// ─── Inner component (uses useSearchParams) ────────────────────────────────────

function VerifyEmailInner() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''

  const { verifyEmail, resendVerification, loading, error } = useAuth()

  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [otpError, setOtpError] = useState<string>('')
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN)
  const [canResend, setCanResend] = useState(false)
  const [resendMsg, setResendMsg] = useState('')

  // ─── Countdown timer ────────────────────────────────────────────────────────

  useEffect(() => {
    if (secondsLeft <= 0) {
      setCanResend(true)
      return
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  // ─── Digit change ──────────────────────────────────────────────────────────

  const handleDigitChange = useCallback((next: string[]) => {
    setDigits(next)
    setOtpError('')
  }, [])

  // ─── Verify ────────────────────────────────────────────────────────────────

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isCompleteOtp(digits)) {
      setOtpError('Please enter all 6 digits')
      return
    }

    await verifyEmail({ email, code: digits.join('') })
  }

  // ─── Resend ────────────────────────────────────────────────────────────────

  const handleResend = async () => {
    setResendMsg('')
    const ok = await resendVerification(email)
    if (ok) {
      setSecondsLeft(RESEND_COOLDOWN)
      setCanResend(false)
      setDigits(Array(6).fill(''))
      setResendMsg('A new code has been sent to your email.')
    }
  }

  return (
    <AuthCard>
      <AuthLogo />

      {/* Icon */}
      <div style={{
        width: 64, height: 64,
        background: 'rgba(250,199,117,0.1)',
        border: '1px solid var(--border)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.25rem',
        fontSize: 28,
      }}>
        ✉️
      </div>

      <h1 style={{ fontSize: 24, textAlign: 'center', marginBottom: 6 }}>
        Check your inbox
      </h1>
      <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1rem' }}>
        We sent a 6-digit verification code to{' '}
        <strong style={{ color: 'var(--gold)' }}>{email || 'your email'}</strong>
      </p>

      {/* Info box */}
      <div style={{
        background: 'rgba(250,199,117,0.07)',
        border: '1px solid rgba(250,199,117,0.2)',
        borderRadius: 'var(--radius-sm)',
        padding: '10px 13px',
        fontSize: 12.5,
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
        marginBottom: '1.25rem',
      }}>
        The code expires in <strong style={{ color: 'var(--gold)' }}>10 minutes</strong>.
        Check your spam folder if you don&apos;t see it.
      </div>

      <form onSubmit={handleVerify}>
        <OtpInput
          value={digits}
          onChange={handleDigitChange}
          error={otpError || error || undefined}
          autoFocus
        />

        {/* Resend */}
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', margin: '0.75rem 0' }}>
          {canResend ? (
            <>
              Didn&apos;t get it?{' '}
              <button
                type="button"
                onClick={handleResend}
                style={{
                  color: 'var(--gold)', background: 'none', border: 'none',
                  cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13,
                  fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3,
                }}
              >
                Resend code
              </button>
            </>
          ) : (
            <>
              Resend in{' '}
              <span style={{ color: 'var(--gold)', fontWeight: 500 }}>
                {secondsLeft}s
              </span>
            </>
          )}
        </p>

        {resendMsg && (
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--teal)', marginBottom: 8 }}>
            {resendMsg}
          </p>
        )}

        <Button type="submit" loading={loading} style={{ marginTop: '0.75rem' }}>
          Verify my email
        </Button>
      </form>

      <Button
        variant="ghost"
        onClick={() => window.history.back()}
        style={{ marginTop: '0.5rem' }}
      >
        Go back and edit email
      </Button>
    </AuthCard>
  )
}

// ─── Page export wrapped in Suspense (required for useSearchParams) ────────────

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  )
}
