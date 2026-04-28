'use client'

import { useState } from 'react'
import { AuthCard, AuthLogo, AuthTabs } from '@/components/auth/AuthCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { useAuth } from '@/hooks/useAuth'
import { isValidEmail } from '@/lib/validators'
import type { LoginFormValues } from '@/types/auth.types'

type FormErrors = Partial<Record<keyof LoginFormValues, string>>

function validate(values: LoginFormValues): FormErrors {
  const errors: FormErrors = {}
  if (!isValidEmail(values.email)) errors.email = 'Please enter a valid email'
  if (!values.password)           errors.password = 'Please enter your password'
  return errors
}

export default function LoginPage() {
  const { login, loading, error: apiError } = useAuth()

  const [values, setValues] = useState<LoginFormValues>({
    email: '',
    password: '',
    remember_me: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const set = <K extends keyof LoginFormValues>(
    key: K,
    val: LoginFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: val }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(values)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    await login({
      email: values.email.trim().toLowerCase(),
      password: values.password,
      remember_me: values.remember_me,
    })
  }

  return (
    <AuthCard>
      <AuthLogo />
      <AuthTabs active="login" />

      <h1 style={{ fontSize: 24, marginBottom: 6 }}>Welcome back</h1>
      <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
        Your money missed you. Let&apos;s catch up.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: '1rem' }}>
          <Input
            label="Email address"
            type="email"
            placeholder="akosua@example.com"
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            error={errors.email}
            autoComplete="email"
            autoFocus
          />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <PasswordInput
            label="Password"
            placeholder="Your password"
            value={values.password}
            onChange={(e) => set('password', e.target.value)}
            error={errors.password}
            autoComplete="current-password"
          />
        </div>

        {/* Remember me + Forgot password row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', margin: '0.5rem 0 1rem',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12.5, color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={values.remember_me}
              onChange={(e) => set('remember_me', e.target.checked)}
              style={{ width: 15, height: 15, accentColor: 'var(--gold)', cursor: 'pointer' }}
            />
            Remember me
          </label>

          <a
            href="/auth/forgot-password"
            style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 500 }}
          >
            Forgot password?
          </a>
        </div>

        {apiError && (
          <p style={{ fontSize: 12.5, color: 'var(--red)', marginBottom: 12, textAlign: 'center' }}>
            {apiError}
          </p>
        )}

        <Button type="submit" loading={loading}>
          Sign in to Lumi
        </Button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginTop: '1.25rem' }}>
        Don&apos;t have an account?{' '}
        <a href="/auth/signup" style={{ fontWeight: 500 }}>Create one free</a>
      </p>
    </AuthCard>
  )
}
