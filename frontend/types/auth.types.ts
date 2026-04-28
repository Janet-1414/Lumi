// ─── Auth Request / Response Types ──────────────────────────────────────────

export interface RegisterRequest {
  first_name: string
  last_name: string
  email: string
  phone?: string
  password: string
  money_personality?: string
}

export interface LoginRequest {
  email: string
  password: string
  remember_me?: boolean
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  code: string
  new_password: string
}

export interface VerifyEmailRequest {
  email: string
  code: string
}

export interface ResendVerificationRequest {
  email: string
}

// ─── User Types ──────────────────────────────────────────────────────────────

export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  is_verified: boolean
  money_personality?: MoneyPersonality
  created_at: string
}

export type MoneyPersonality =
  | 'saver'
  | 'spender'
  | 'investor'
  | 'avoider'
  | 'planner'

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T
  message?: string
  success: boolean
}

export interface AuthResponse {
  user: User
  message: string
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface RegisterFormValues {
  first_name: string
  last_name: string
  email: string
  phone: string
  password: string
  confirm_password: string
  terms_accepted: boolean
}

export interface LoginFormValues {
  email: string
  password: string
  remember_me: boolean
}

export interface ForgotPasswordFormValues {
  email: string
}

export interface ResetPasswordFormValues {
  code: string
  new_password: string
  confirm_password: string
}

// ─── Password Strength ───────────────────────────────────────────────────────

export type PasswordStrength = 0 | 1 | 2 | 3 | 4

export interface PasswordStrengthResult {
  score: PasswordStrength
  label: string
  color: string
}
