/**
 * Promoter Dashboard
 *
 * Features:
 * - Welcome message with user name
 * - Stats cards: Total listings, Pending verification, Live listings, Total unlocks, Upcoming appointments
 * - Recent unlocks list
 * - Quick actions: Post New Property, View All Listings
 *
 * Uses RPC function: get_user_dashboard_stats()
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import { signOut } from '@/app/actions/auth'

interface DashboardStats {
  total_listings: number
  pending_listings: number
  live_listings: number
  total_unlocks: number
  upcoming_appointments: number
}

interface RecentUnlock {
  id: string
  created_at: string
  customer_name: string
  customer_phone: string
  listing_title: string
  listing_id: string
}

export default function PromoterDashboard() {
  const { user } = useAuth()
  const { profile } = useUserProfile(user?.id)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentUnlocks, setRecentUnlocks] = useState<RecentUnlock[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    const fetchDashboardData = async () => {
      try {
        // Fetch stats using RPC function
        const { data: statsData, error: statsError } = await supabase.rpc(
          'get_user_dashboard_stats',
          { p_user_id: user.id }
        )

        if (statsError) throw statsError

        setStats(statsData?.[0] || null)

        // Fetch recent unlocks (last 5)
        const { data: unlocksData, error: unlocksError } = await supabase
          .from('unlocks')
          .select(`
            id,
            created_at,
            users:user_id (full_name, phone_e164),
            listings:listing_id (id, property_type, city)
          `)
          .eq('listings.promoter_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (unlocksError) throw unlocksError

        // Transform data
        const formattedUnlocks = (unlocksData || []).map((unlock: any) => ({
          id: unlock.id,
          created_at: unlock.created_at,
          customer_name: unlock.users?.full_name || 'Unknown',
          customer_phone: unlock.users?.phone_e164 || '',
          listing_title: `${unlock.listings?.property_type} in ${unlock.listings?.city}`,
          listing_id: unlock.listings?.id || '',
        }))

        setRecentUnlocks(formattedUnlocks)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, supabase])

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <ProtectedRoute requiredRole="PROMOTER">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-blue-600">Houlnd</div>
                  <div className="text-sm text-gray-500">Realty</div>
                </Link>
                <Badge variant="info" className="ml-4">Promoter</Badge>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/promoter/listings" className="text-gray-700 hover:text-gray-900">
                  My Listings
                </Link>
                <Link href="/promoter/appointments" className="text-gray-700 hover:text-gray-900">
                  Appointments
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {profile?.full_name || 'Promoter'}!
            </h1>
            <p className="text-gray-600 mt-2">
              Here's what's happening with your properties today.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-gray-900">
                      {stats?.total_listings || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total Listings</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-yellow-600">
                      {stats?.pending_listings || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Pending Verification</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">
                      {stats?.live_listings || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Live Listings</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats?.total_unlocks || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total Unlocks</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats?.upcoming_appointments || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Upcoming Visits</div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Post New Property
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          List a new property for verification and go live.
                        </p>
                        <Link href="/promoter/post-new-property">
                          <Button>Post Property</Button>
                        </Link>
                      </div>
                      <div className="text-4xl">🏘️</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Manage Listings
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          View and edit all your property listings.
                        </p>
                        <Link href="/promoter/listings">
                          <Button variant="outline">View Listings</Button>
                        </Link>
                      </div>
                      <div className="text-4xl">📋</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Unlocks */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-900">Recent Inquiries</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Customers who recently unlocked your property contact
                  </p>
                </CardHeader>
                <CardContent>
                  {recentUnlocks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No inquiries yet. Your listings will appear here once customers unlock them.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentUnlocks.map((unlock) => (
                        <div
                          key={unlock.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{unlock.customer_name}</div>
                            <div className="text-sm text-gray-600">{unlock.customer_phone}</div>
                            <div className="text-sm text-gray-500 mt-1">{unlock.listing_title}</div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(unlock.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
