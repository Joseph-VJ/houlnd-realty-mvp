/**
 * Authentication Hook
 *
 * This hook provides access to the current authentication state.
 * It supports both Supabase auth (online) and JWT auth (offline mode).
 *
 * Usage:
 * ```tsx
 * const { user, loading } = useAuth()
 *
 * if (loading) return <LoadingSpinner />
 * if (!user) return <LoginPrompt />
 * return <Dashboard user={user} />
 * ```
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

// Check if offline mode is enabled
const isOfflineMode = process.env.NEXT_PUBLIC_USE_OFFLINE === 'true'

// Offline user type that matches Supabase User structure
interface OfflineUser {
  id: string
  email?: string | null
  role?: string
  user_metadata?: {
    role?: string
  }
}

interface UseAuthReturn {
  user: User | OfflineUser | null
  loading: boolean
  refetch: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | OfflineUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchOfflineUser = useCallback(async () => {
    try {
      // Fetch from API endpoint that reads the cookie server-side
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,
            user_metadata: { role: data.user.role }
          })
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error fetching offline user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(async () => {
    setLoading(true)
    if (isOfflineMode) {
      await fetchOfflineUser()
    } else {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }
  }, [fetchOfflineUser])

  useEffect(() => {
    if (isOfflineMode) {
      // OFFLINE MODE: Get user from JWT token via API
      fetchOfflineUser()
    } else {
      // ONLINE MODE: Use Supabase
      const supabase = createClient()
      
      // Get initial session
      const getInitialSession = async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession()
          setUser(session?.user ?? null)
        } catch (error) {
          console.error('Error fetching session:', error)
          setUser(null)
        } finally {
          setLoading(false)
        }
      }

      getInitialSession()

      // Subscribe to auth state changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe()
      }
    }
  }, [fetchOfflineUser])

  return { user, loading, refetch }
}
