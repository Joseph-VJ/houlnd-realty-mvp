/**
 * User Profile Hook
 *
 * This hook fetches the user's profile from the users table.
 * It provides the user's role, full name, phone, email, and other profile data.
 * Supports both Supabase (online) and Prisma (offline mode).
 *
 * Usage:
 * ```tsx
 * const { profile, loading, error, refetch } = useUserProfile(userId)
 *
 * if (loading) return <LoadingSpinner />
 * if (error) return <ErrorAlert message={error} />
 * if (!profile) return <ProfileNotFound />
 *
 * return <UserDashboard role={profile.role} name={profile.full_name} />
 * ```
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

// Check if offline mode is enabled
const isOfflineMode = process.env.NEXT_PUBLIC_USE_OFFLINE === 'true'

type UserProfile = Database['public']['Tables']['users']['Row']

interface UseUserProfileReturn {
  profile: UserProfile | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useUserProfile(userId?: string): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      setError(null)
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (isOfflineMode) {
        // OFFLINE MODE: Fetch from API endpoint
        const response = await fetch(`/api/users/${userId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch user profile')
        }
        const data = await response.json()
        setProfile(data.user)
      } else {
        // ONLINE MODE: Use Supabase
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        if (fetchError) {
          throw fetchError
        }

        setProfile(data)
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch user profile')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    // Reset loading state when userId changes
    if (userId) {
      setLoading(true)
    }
    fetchProfile()
  }, [fetchProfile, userId])

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  }
}
