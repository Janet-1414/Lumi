'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthCard, AuthLogo, AuthTabs } from '@/components/auth/AuthCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { useAuth } from '@/hooks/useAuth'
import {
  isValidEmail,
  isStrongPassword,
  passwordsMatch,
  isValidName,
} from '@/lib/validators'
import type { RegisterFormValues } from '@/types/auth.types'

// ─── Initial form state ───────────────────────────────────────────────────────

const INITIAL: RegisterFormValues = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
  confirm_password: '',
  terms_accepted: false,
}

// ─── Field-level errors ───────────────────────────────────────────────────────

type FormErrors = Partial<Record<keyof RegisterFormValues, string>>

function validate(values: RegisterFormValues): FormErrors {
  const errors: FormErrors = {}

  if (!isValidName(values.first_name))
    errors.first_name = 'Please enter your first name'

  if (!isValidEmail(values.email))
    errors.email = 'Please enter a valid email address'

  if (!isStrongPassword(values.password))
    errors.password =
      'Password must have uppercase, lowercase, a number and a symbol'

  if (!passwordsMatch(values.password, values.confirm_password))
    errors.confirm_password = 'Passwords do not match'

  if (!values.terms_accepted)
    errors.terms_accepted = 'You must accept the terms to continue'

  return errors
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter()
  const { register, loading, error: apiError } = useAuth()

  const [values, setValues] = useState<RegisterFormValues>(INITIAL)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  // ─── Field update helper ──────────────────────────────────────────────────

  const set = <K extends keyof RegisterFormValues>(
    key: K,
    val: RegisterFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: val }))
    // Clear field error on change
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)

    const errs = validate(values)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    const ok = await register({
      first_name: values.first_name.trim(),
      last_name:  values.last_name.trim(),
      email:      values.email.trim().toLowerCase(),
      phone:      values.phone || undefined,
      password:   values.password,
    })

    if (ok) {
      // Pass email to verification page via query param
      router.push(
        `/auth/verify-email?email=${encodeURIComponent(values.email.trim())}`,
      )
    }
  }

  return (
    <AuthCard>
      <AuthLogo />
      <AuthTabs active="register" />

      <h1 style={{ fontSize: 24, marginBottom: 6 }}>Start your journey</h1>
      <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
        Your financial future starts here. Let&apos;s get you set up.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Name row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1rem' }}>
          <Input
            label="First name"
            placeholder="Akosua"
            value={values.first_name}
            onChange={(e) => set('first_name', e.target.value)}
            error={errors.first_name}
            autoComplete="given-name"
            autoFocus
          />
          <Input
            label="Last name"
            placeholder="Mensah"
            value={values.last_name}
            onChange={(e) => set('last_name', e.target.value)}
            error={errors.last_name}
            autoComplete="family-name"
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: '1rem' }}>
          <Input
            label="Email address"
            type="email"
            placeholder="akosua@example.com"
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            error={errors.email}
            autoComplete="email"
          />
        </div>

        {/* Phone */}
        <div style={{ marginBottom: '1rem' }}>
          <Input
            label="Phone number (optional)"
            type="tel"
            placeholder="+256 700 000 000"
            value={values.phone}
            onChange={(e) => set('phone', e.target.value)}
            autoComplete="tel"
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '1rem' }}>
          <PasswordInput
            label="Password"
            placeholder="Create a strong password"
            value={values.password}
            onChange={(e) => set('password', e.target.value)}
            error={errors.password}
            showStrength
            autoComplete="new-password"
          />
        </div>

        {/* Confirm password */}
        <div style={{ marginBottom: '1rem' }}>
          <PasswordInput
            label="Confirm password"
            placeholder="Repeat your password"
            value={values.confirm_password}
            onChange={(e) => set('confirm_password', e.target.value)}
            error={errors.confirm_password}
            autoComplete="new-password"
          />
        </div>

        {/* Terms */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, margin: '0.75rem 0' }}>
          <input
            type="checkbox"
            id="terms"
            checked={values.terms_accepted}
            onChange={(e) => set('terms_accepted', e.target.checked)}
            style={{ width: 16, height: 16, marginTop: 2, accentColor: 'var(--gold)', cursor: 'pointer', flexShrink: 0 }}
          />
          <label htmlFor="terms" style={{ fontSize: 12.5, color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: 1.5 }}>
            I agree to the{' '}
            <a href="/terms">Terms of Service</a> and{' '}
            <a href="/privacy">Privacy Policy</a>
          </label>
        </div>
        {submitted && errors.terms_accepted && (
          <p style={{ fontSize: 11.5, color: 'var(--red)', marginBottom: 8 }}>
            {errors.terms_accepted}
          </p>
        )}

        {/* API error */}
        {apiError && (
          <p style={{ fontSize: 12.5, color: 'var(--red)', marginBottom: 12, textAlign: 'center' }}>
            {apiError}
          </p>
        )}

        <Button type="submit" loading={loading} style={{ marginTop: '0.5rem' }}>
          Create my account
        </Button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginTop: '1rem' }}>
        Already have an account?{' '}
        <a href="/auth/login" style={{ fontWeight: 500 }}>Sign in</a>
      </p>
    </AuthCard>
  )
}
