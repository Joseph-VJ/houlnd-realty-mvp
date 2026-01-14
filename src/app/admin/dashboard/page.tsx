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
import { signOut } from '@/app/actions/auth'
import { getAdminDashboardStats, getRecentActivity } from '@/app/actions/dashboard'

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

  useEffect(() => {
    if (!user) return

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch stats
        const statsResult = await getAdminDashboardStats()
        if (statsResult.success && statsResult.data) {
          setStats(statsResult.data)
        }

        // Fetch recent activity
        const activityResult = await getRecentActivity(10)
        if (activityResult.success && activityResult.data) {
          setRecentActivity(activityResult.data)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white rounded-sm transform rotate-45"></div>
                  </div>
                  <span className="text-xl font-bold text-gray-900">Houlnd Realty</span>
                </Link>
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">Admin</span>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/admin/pending-listings" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
                  Pending Listings
                </Link>
                <Link href="/admin/listings" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
                  All Listings
                </Link>
                <Link href="/admin/users" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
                  Users
                </Link>
                <button onClick={handleLogout} className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full font-medium transition-all">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Welcome Section */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
              Admin Dashboard
            </h1>
            <p className="text-lg text-gray-600">
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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-black text-gray-900 mb-1">
                    {stats?.total_users || 0}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Total Users</div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-black text-gray-900 mb-1">
                    {stats?.total_customers || 0}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Customers</div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-black text-gray-900 mb-1">
                    {stats?.total_promoters || 0}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Promoters</div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-black text-gray-900 mb-1">
                    ₹{((stats?.total_revenue || 0) / 100).toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Total Revenue</div>
                </div>
              </div>

              {/* Stats Cards - Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="text-2xl font-black text-blue-600">
                    {stats?.pending_listings || 0}
                  </div>
                  <div className="text-sm text-gray-700 font-medium mt-1">Pending Verification</div>
                  <Link href="/admin/pending-listings" className="text-sm text-blue-600 hover:underline mt-2 block font-medium">
                    Review Now →
                  </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="text-2xl font-black text-blue-600">
                    {stats?.live_listings || 0}
                  </div>
                  <div className="text-sm text-gray-700 font-medium mt-1">Live Listings</div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="text-2xl font-black text-blue-600">
                    {stats?.total_unlocks || 0}
                  </div>
                  <div className="text-sm text-gray-700 font-medium mt-1">Total Unlocks</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Review Pending Listings
                      </h3>
                      <p className="text-sm text-gray-700 mb-4">
                        Approve or reject property listings waiting for verification.
                      </p>
                      <Link href="/admin/pending-listings" className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/30 hover:scale-105">
                        Review Listings
                        {stats?.pending_listings ? (
                          <span className="ml-1 px-2.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                            {stats.pending_listings}
                          </span>
                        ) : null}
                      </Link>
                    </div>
                    <div className="text-4xl">📝</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Manage Users
                      </h3>
                      <p className="text-sm text-gray-700 mb-4">
                        View and manage all users on the platform.
                      </p>
                      <Link href="/admin/users" className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-full font-bold hover:bg-gray-50 transition-all hover:scale-105">
                        View Users
                      </Link>
                    </div>
                    <div className="text-4xl">👥</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-xl font-black text-gray-900">Recent Activity</h2>
                  <p className="text-sm text-gray-700 mt-1">
                    Latest actions on the platform
                  </p>
                </div>
                <div className="p-6">
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No recent activity to display.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentActivity.slice(0, 5).map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all"
                        >
                          <div className="flex-1">
                            <div className="font-bold text-gray-900">{activity.action_type}</div>
                            <div className="text-sm text-gray-700 mt-1">{activity.description}</div>
                          </div>
                          <div className="text-xs text-gray-600 font-medium">
                            {new Date(activity.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
