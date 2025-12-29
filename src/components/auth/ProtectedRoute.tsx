/**
 * Protected Route Component
 *
 * This component wraps pages that require authentication.
 * It checks if the user is authenticated and optionally checks their role.
 *
 * Features:
 * - Redirects to login if not authenticated
 * - Shows loading state while checking auth
 * - Optionally checks user role
 * - Redirects to unauthorized page if role doesn't match
 *
 * Usage:
 * ```tsx
 * // Protect any authenticated page
 * <ProtectedRoute>
 *   <DashboardContent />
 * </ProtectedRoute>
 *
 * // Protect with role check
 * <ProtectedRoute requiredRole="PROMOTER">
 *   <PromoterDashboard />
 * </ProtectedRoute>
 * ```
 */

'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'CUSTOMER' | 'PROMOTER' | 'ADMIN'
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading } = useUserProfile(user?.id)
  const router = useRouter()
  const pathname = usePathname()

  // Check if profile matches the current user
  const profileMatchesUser = profile && user && profile.id === user.id

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return

    // Redirect to login if not authenticated
    if (!user) {
      const loginUrl = new URL(redirectTo, window.location.origin)
      loginUrl.searchParams.set('redirectedFrom', pathname)
      router.push(loginUrl.toString())
      return
    }

    // If role check is required, wait for profile to load AND match the user
    if (requiredRole && user && !profileLoading && profileMatchesUser) {
      // Check if user has required role
      if (profile.role !== requiredRole) {
        router.push('/unauthorized')
      }
    }
  }, [
    user,
    authLoading,
    profile,
    profileLoading,
    profileMatchesUser,
    requiredRole,
    router,
    pathname,
    redirectTo,
  ])

  // Show loading state while auth or profile is loading
  // Also show loading if we have a user but profile doesn't match yet (still fetching)
  if (authLoading || (requiredRole && (profileLoading || (user && !profileMatchesUser)))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated
  if (!user) {
    return null
  }

  // Don't render children if role check fails (only check if profile matches user)
  if (requiredRole && profileMatchesUser && profile.role !== requiredRole) {
    return null
  }

  // Render protected content
  return <>{children}</>
}
