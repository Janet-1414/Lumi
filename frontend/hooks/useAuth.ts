'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import type {
  RegisterRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '@/types/auth.types'

interface AuthState {
  loading: boolean
  error: string | null
}

/**
 * useAuth — provides all auth actions with loading + error state.
 *
 * Usage:
 *   const { login, loading, error } = useAuth()
 *   await login({ email, password })
 */
export function useAuth() {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    loading: false,
    error: null,
  })

  const setLoading = () => setState({ loading: true, error: null })
  const setError = (msg: string) => setState({ loading: false, error: msg })
  const setDone = () => setState({ loading: false, error: null })

  // ─── Register ─────────────────────────────────────────────────────────────

  const register = async (payload: RegisterRequest): Promise<boolean> => {
    setLoading()
    try {
      await apiClient.register(payload)
      setDone()
      return true
    } catch (err: unknown) {
      const msg = extractError(err) ?? 'Registration failed. Please try again.'
      setError(msg)
      return false
    }
  }

  // ─── Verify Email ─────────────────────────────────────────────────────────

  const verifyEmail = async (payload: VerifyEmailRequest): Promise<boolean> => {
    setLoading()
    try {
      await apiClient.verifyEmail(payload)
      setDone()
      return true
    } catch (err: unknown) {
      setError(extractError(err) ?? 'Invalid code. Please try again.')
      return false
    }
  }

  // ─── Resend Verification ──────────────────────────────────────────────────

  const resendVerification = async (email: string): Promise<boolean> => {
    setLoading()
    try {
      await apiClient.resendVerification({ email })
      setDone()
      return true
    } catch (err: unknown) {
      setError(extractError(err) ?? 'Failed to resend code.')
      return false
    }
  }

  // ─── Login ────────────────────────────────────────────────────────────────

  const login = async (payload: LoginRequest): Promise<boolean> => {
    setLoading()
    try {
      const res = await apiClient.login(payload)
      if (res?.data?.access_token) apiClient.setToken(res.data.access_token)
      setDone()
      return true
    } catch (err: unknown) {
      setError(extractError(err) ?? 'Invalid email or password.')
      return false
    }
  }

  // ─── Forgot Password ──────────────────────────────────────────────────────

  const forgotPassword = async (
    payload: ForgotPasswordRequest,
  ): Promise<boolean> => {
    setLoading()
    try {
      await apiClient.forgotPassword(payload)
      setDone()
      return true
    } catch (err: unknown) {
      setError(extractError(err) ?? 'Failed to send reset email.')
      return false
    }
  }

  // ─── Reset Password ───────────────────────────────────────────────────────

  const resetPassword = async (
    payload: ResetPasswordRequest,
  ): Promise<boolean> => {
    setLoading()
    try {
      await apiClient.resetPassword(payload)
      setDone()
      return true
    } catch (err: unknown) {
      setError(extractError(err) ?? 'Failed to reset password.')
      return false
    }
  }

  // ─── Logout ───────────────────────────────────────────────────────────────

  const logout = async (): Promise<void> => {
    try {
      await apiClient.logout()
    } finally {
      router.push('/auth/login')
    }
  }

  return {
    ...state,
    register,
    verifyEmail,
    resendVerification,
    login,
    forgotPassword,
    resetPassword,
    logout,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractError(err: unknown): string | null {
  if (
    typeof err === 'object' &&
    err !== null &&
    'response' in err
  ) {
    const resp = (err as { response?: { data?: { detail?: string; message?: string } } }).response
    return resp?.data?.detail ?? resp?.data?.message ?? null
  }
  return null
}
