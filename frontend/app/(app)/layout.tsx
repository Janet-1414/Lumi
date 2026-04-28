'use client'

/**
 * app/(app)/layout.tsx
 *
 * Auth guard layout that wraps every protected route.
 * Redirects unauthenticated users to /auth/login.
 *
 * Place this file at: frontend/app/(app)/layout.tsx
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth }   from '@/context/AuthContext'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router            = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login')
    }
  }, [user, loading, router])

  // Show nothing while checking auth — prevents flash of protected content
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--bg-deep)',
      }}>
        <div style={{
          width: 32, height: 32,
          border: '3px solid rgba(250,199,117,0.2)',
          borderTopColor: 'var(--gold)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
