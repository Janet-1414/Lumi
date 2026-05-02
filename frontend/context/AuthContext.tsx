'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { apiClient } from '@/lib/api/client'
import type { User } from '@/types/auth.types'

interface AuthContextValue {
  user:     User | null
  loading:  boolean
  setUser:  (user: User | null) => void
  logout:   () => Promise<void>
  refresh:  () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user:    null,
  loading: true,
  setUser: () => {},
  logout:  async () => {},
  refresh: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check current session on mount
  const refresh = useCallback(async () => {
    try {
      const res = await apiClient.getMe()
      setUser(res ?? null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const logout = useCallback(async () => {
    try { await apiClient.logout() } catch { /* ignore */ }
    localStorage.removeItem("lumi_token")
    apiClient.setToken(null)
    setUser(null)
    window.location.href = '/auth/login'
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
