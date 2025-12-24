/**
 * User Profile Hook
 *
 * This hook fetches the user's profile from the users table.
 * It provides the user's role, full name, phone, email, and other profile data.
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

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

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
  const supabase = createClient()

  const fetchProfile = async () => {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      setError(null)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (fetchError) {
        throw fetchError
      }

      setProfile(data)
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch user profile')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  }
}
