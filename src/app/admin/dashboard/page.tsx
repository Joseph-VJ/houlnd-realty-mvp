/**
 * Admin Dashboard
 *
 * Features:
 * - Welcome message
 * - Stats cards: Total users, Total promoters, Total customers, Pending listings, Live listings, Total unlocks, Total revenue
 * - Quick actions: View Pending Listings, Manage Users
 * - Recent activity feed
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
  total_users: number
  total_promoters: number
  total_customers: number
  pending_listings: number
  live_listings: number
  total_unlocks: number
  total_revenue: number
}

interface RecentActivity {
  id: string
  created_at: string
  action_type: string
  description: string
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const { profile } = useUserProfile(user?.id)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
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

        // Fetch recent activity
        const { data: activityData, error: activityError } = await supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)

        if (activityError) throw activityError

        setRecentActivity(activityData || [])
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
    <ProtectedRoute requiredRole="ADMIN">
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
                <Badge variant="danger" className="ml-4">Admin</Badge>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/admin/pending-listings" className="text-gray-700 hover:text-gray-900">
                  Pending Listings
                </Link>
                <Link href="/admin/listings" className="text-gray-700 hover:text-gray-900">
                  All Listings
                </Link>
                <Link href="/admin/users" className="text-gray-700 hover:text-gray-900">
                  Users
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
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage the Houlnd Realty platform and monitor activity.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Stats Cards - Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-gray-900">
                      {stats?.total_users || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total Users</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats?.total_customers || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Customers</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">
                      {stats?.total_promoters || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Promoters</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-purple-600">
                      ₹{((stats?.total_revenue || 0) / 100).toLocaleString('en-IN')}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total Revenue</div>
                  </CardContent>
                </Card>
              </div>

              {/* Stats Cards - Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-yellow-600">
                      {stats?.pending_listings || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Pending Verification</div>
                    <Link href="/admin/pending-listings" className="text-sm text-blue-600 hover:underline mt-2 block">
                      Review Now →
                    </Link>
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
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Review Pending Listings
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Approve or reject property listings waiting for verification.
                        </p>
                        <Link href="/admin/pending-listings">
                          <Button>
                            Review Listings
                            {stats?.pending_listings ? (
                              <Badge variant="warning" className="ml-2">
                                {stats.pending_listings}
                              </Badge>
                            ) : null}
                          </Button>
                        </Link>
                      </div>
                      <div className="text-4xl">📝</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Manage Users
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          View and manage all users on the platform.
                        </p>
                        <Link href="/admin/users">
                          <Button variant="outline">View Users</Button>
                        </Link>
                      </div>
                      <div className="text-4xl">👥</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Latest actions on the platform
                  </p>
                </CardHeader>
                <CardContent>
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No recent activity to display.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentActivity.slice(0, 5).map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{activity.action_type}</div>
                            <div className="text-sm text-gray-600 mt-1">{activity.description}</div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(activity.created_at).toLocaleString()}
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
