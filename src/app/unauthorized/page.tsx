/**
 * Unauthorized Access Page
 *
 * This page is shown when a user tries to access a page they don't have permission for.
 * For example, a CUSTOMER trying to access /promoter/dashboard.
 */

'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export default function UnauthorizedPage() {
  const { user } = useAuth()
  const { profile } = useUserProfile(user?.id)

  const getDashboardUrl = () => {
    if (!profile) return '/'

    switch (profile.role) {
      case 'CUSTOMER':
        return '/customer/dashboard'
      case 'PROMOTER':
        return '/promoter/dashboard'
      case 'ADMIN':
        return '/admin/dashboard'
      default:
        return '/'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              {/* Error Icon */}
              <div className="text-6xl mb-4">🚫</div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Access Denied
              </h1>

              {/* Message */}
              <p className="text-gray-900 mb-6">
                You don't have permission to access this page.
                {profile && (
                  <span className="block mt-2 text-sm">
                    Your account type: <span className="font-medium text-gray-900">{profile.role}</span>
                  </span>
                )}
              </p>

              {/* Actions */}
              <div className="space-y-3">
                {user && profile ? (
                  <Link href={getDashboardUrl()}>
                    <Button className="w-full">
                      Go to My Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button className="w-full">
                      Login
                    </Button>
                  </Link>
                )}

                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Back to Home
                  </Button>
                </Link>
              </div>

              {/* Help Text */}
              <p className="text-xs text-gray-900 mt-6">
                If you believe this is an error, please contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
