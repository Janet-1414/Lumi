/**
 * ApiClient — centralised HTTP client for all Lumi API calls.
 *
 * - All requests go through a single axios instance
 * - Credentials (HTTP-only cookies) are sent automatically
 * - 401 responses redirect to /auth/login automatically
 * - Every public method is strongly typed
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type {
  RegisterRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  AuthResponse,
  ApiResponse,
  User,
} from '@/types/auth.types'

class ApiClient {
  private token: string | null = null

  private readonly client: AxiosInstance

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== "undefined") {
      if (token) localStorage.setItem("lumi_token", token)
      else localStorage.removeItem("lumi_token")
    }
  }
  getToken() { return this.token }

  constructor() {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("lumi_token")
      if (t) this.token = t
    }
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1',
      withCredentials: true,          // send HTTP-only cookies automatically
      timeout: 15_000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    this.attachRequestInterceptor()
    this.attachResponseInterceptor()
  }

  // ─── Interceptors ──────────────────────────────────────────────────────────

  private attachRequestInterceptor(): void {
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`
      }
      return config
    })
  }

  private attachResponseInterceptor(): void {
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // JWT expired or missing — send user to login
          if (typeof window !== 'undefined') {
            if (!window.location.pathname.startsWith('/auth') && window.location.pathname !== '/') window.location.href = '/auth/login'
          }
        }
        return Promise.reject(error)
      },
    )
  }

  // ─── Generic request helper ────────────────────────────────────────────────

  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<T>(config)
    return response.data
  }

  // ─── Auth Endpoints ────────────────────────────────────────────────────────

  async register(payload: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request({
      method: 'POST',
      url: '/auth/register',
      data: payload,
    })
  }

  async login(payload: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request({
      method: 'POST',
      url: '/auth/login',
      data: payload,
    })
  }

  async logout(): Promise<ApiResponse> {
    return this.request({ method: 'POST', url: '/auth/logout' })
  }

  async verifyEmail(payload: VerifyEmailRequest): Promise<ApiResponse> {
    return this.request({
      method: 'POST',
      url: '/auth/verify-email',
      data: payload,
    })
  }

  async resendVerification(
    payload: ResendVerificationRequest,
  ): Promise<ApiResponse> {
    return this.request({
      method: 'POST',
      url: '/auth/resend-verification',
      data: payload,
    })
  }

  async forgotPassword(
    payload: ForgotPasswordRequest,
  ): Promise<ApiResponse> {
    return this.request({
      method: 'POST',
      url: '/auth/forgot-password',
      data: payload,
    })
  }

  async resetPassword(
    payload: ResetPasswordRequest,
  ): Promise<ApiResponse> {
    return this.request({
      method: 'POST',
      url: '/auth/reset-password',
      data: payload,
    })
  }

  async getMe(): Promise<ApiResponse<User>> {
    return this.request({ method: 'GET', url: '/auth/me' })
  }
}

// Export a single shared instance — never instantiate this twice
export const apiClient = new ApiClient()
