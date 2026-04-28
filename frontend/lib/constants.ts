/**
 * lib/constants.ts — app-wide constants
 */

export const APP_NAME    = 'Lumi'
export const APP_TAGLINE = 'Your Financial Future, Illuminated'

export const DEFAULT_CURRENCY = 'UGX'
export const DEFAULT_LOCALE   = 'en-UG'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export const OTP_LENGTH        = 6
export const RESEND_COOLDOWN_S = 59

export const MAX_FILE_SIZE_MB  = 5
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const SAVING_STREAK_MILESTONES = [7, 14, 30, 60, 100]

export const BADGE_TIERS = ['bronze', 'silver', 'gold', 'diamond'] as const

export const NAV_ROUTES = {
  home:         '/',
  login:        '/auth/login',
  signup:       '/auth/signup',
  verify:       '/auth/verify-email',
  forgot:       '/auth/forgot-password',
  dashboard:    '/dashboard',
  transactions: '/transactions',
  savings:      '/savings',
  reports:      '/reports',
  community:    '/community',
  chat:         '/chat',
  profile:      '/profile',
} as const
