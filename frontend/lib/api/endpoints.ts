/**
 * lib/api/endpoints.ts
 * All API endpoint paths as typed constants.
 * Never hardcode URLs anywhere else in the frontend.
 */

export const ENDPOINTS = {
  // Auth
  auth: {
    register:           '/auth/register',
    login:              '/auth/login',
    logout:             '/auth/logout',
    verifyEmail:        '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
    forgotPassword:     '/auth/forgot-password',
    resetPassword:      '/auth/reset-password',
    me:                 '/auth/me',
  },

  // Dashboard
  dashboard: '/dashboard',

  // Transactions
  transactions: {
    list:    '/transactions',
    create:  '/transactions',
    summary: '/transactions/summary',
    scan:    '/transactions/scan',
    confirm: '/transactions/scan/confirm',
    byId:    (id: string) => `/transactions/${id}`,
  },

  // Savings
  savings: {
    list:      '/savings',
    create:    '/savings',
    challenge: '/savings/challenge',
    byId:      (id: string) => `/savings/${id}`,
    deposit:   (id: string) => `/savings/${id}/deposit`,
  },

  // Reports
  reports: '/reports',

  // Community
  community: {
    feed:        '/community/feed',
    challenges:  '/community/challenges',
    leaderboard: '/community/leaderboard',
    pulse:       '/community/pulse',
    tips:        '/community/tips',
  },

  // Chat
  chat: {
    session: '/chat/session',
    message: '/chat/message',
    stream:  '/chat/stream',
    prompts: '/chat/prompts',
  },

  // Profile
  profile: {
    get:           '/profile',
    update:        '/profile',
    notifications: '/profile/notification-settings',
  },
} as const
