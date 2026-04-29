/**
 * __tests__/hooks/useAuth.test.ts
 */

import { renderHook, act } from '@testing-library/react'

// Mock apiClient
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    register:           jest.fn(),
    login:              jest.fn(),
    logout:             jest.fn(),
    verifyEmail:        jest.fn(),
    resendVerification: jest.fn(),
    forgotPassword:     jest.fn(),
    resetPassword:      jest.fn(),
    getMe:              jest.fn(),
  },
}))

import { useAuth }   from '@/hooks/useAuth'
import { apiClient } from '@/lib/api/client'

const mockedClient = apiClient as jest.Mocked<typeof apiClient>

describe('useAuth hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns loading: false and error: null by default', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('register returns true on success', async () => {
    mockedClient.register.mockResolvedValueOnce({
      success: true,
      message: 'Account created',
    })

    const { result } = renderHook(() => useAuth())

    let success: boolean
    await act(async () => {
      success = await result.current.register({
        first_name: 'Akosua',
        last_name:  'Mensah',
        email:      'akosua@example.com',
        password:   'Str0ng@Pass!',
      })
    })

    expect(success!).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('register returns false and sets error on failure', async () => {
    mockedClient.register.mockRejectedValueOnce({
      response: { data: { detail: 'Email already exists' } },
    })

    const { result } = renderHook(() => useAuth())

    let success: boolean
    await act(async () => {
      success = await result.current.register({
        first_name: 'Akosua',
        last_name:  'Mensah',
        email:      'taken@example.com',
        password:   'Str0ng@Pass!',
      })
    })

    expect(success!).toBe(false)
    expect(result.current.error).toBe('Email already exists')
  })

  it('login returns false and sets error on wrong password', async () => {
    mockedClient.login.mockRejectedValueOnce({
      response: { data: { detail: 'Invalid email or password' } },
    })

    const { result } = renderHook(() => useAuth())

    let success: boolean
    await act(async () => {
      success = await result.current.login({
        email:    'akosua@example.com',
        password: 'WrongPassword!',
      })
    })

    expect(success!).toBe(false)
    expect(result.current.error).toBe('Invalid email or password')
  })

  it('forgotPassword always returns true (prevents enumeration)', async () => {
    mockedClient.forgotPassword.mockResolvedValueOnce({
      success: true,
      message: 'If an account exists...',
    })

    const { result } = renderHook(() => useAuth())

    let success: boolean
    await act(async () => {
      success = await result.current.forgotPassword({ email: 'any@example.com' })
    })

    expect(success!).toBe(true)
  })
})
