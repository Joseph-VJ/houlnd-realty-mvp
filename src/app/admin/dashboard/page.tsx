/**
 * Admin Dashboard
 *
 * Features:
 * - Welcome message
 * - Stats cards: Total users, Total promoters, Total customers, Pending listings, Live listings, Total unlocks, Total revenue
 * - Quick actions: View Pending Listings, Manage Users
 *
 * Uses Prisma database via getDashboardStats server action
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { signOut } from '@/app/actions/auth'
import { getDashboardStats } from '@/app/actions/getDashboardStats'

interface DashboardStats {
  total_users: number
  total_promoters: number
  total_customers: number
  pending_listings: number
  live_listings: number
  total_unlocks: number
  total_revenue: number
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const { profile } = useUserProfile(user?.id)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchDashboardData = async () => {
      try {
        // Fetch stats using server action with Prisma
        const result = await getDashboardStats()

        if (result.success && result.stats) {
          setStats(result.stats)
        } else {
          console.error('Error fetching stats:', result.error)
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Houlnd Realty</span>
                    <div className="text-xs text-gray-900 font-medium -mt-0.5">Admin Portal</div>
                  </div>
                </Link>
              </div>
              <nav className="flex items-center gap-1">
                <Link
                  href="/admin/dashboard"
                  className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg transition-all"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/pending-listings"
                  className="px-4 py-2 text-sm font-semibold text-gray-900 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all relative"
                >
                  Pending
                  {stats && stats.pending_listings > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {stats.pending_listings}
                    </span>
                  )}
                </Link>
                <Link
                  href="/admin/listings"
                  className="px-4 py-2 text-sm font-semibold text-gray-900 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                >
                  Listings
                </Link>
                <Link
                  href="/admin/users"
                  className="px-4 py-2 text-sm font-semibold text-gray-900 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                >
                  Users
                </Link>
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-semibold text-gray-900 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Dashboard Overview
                </h1>
                <p className="text-gray-900 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Real-time platform metrics and activity
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-900">Welcome back,</div>
                <div className="text-lg font-semibold text-gray-900">{profile?.full_name || 'Admin'}</div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-900 font-medium">Loading dashboard data...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Key Metrics - Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-gray-900 bg-blue-50 px-2 py-1 rounded-full">Total</div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stats?.total_users || 0}
                  </div>
                  <div className="text-sm font-medium text-gray-900">Platform Users</div>
                </div>

                <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-shadow">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-gray-900 bg-emerald-50 px-2 py-1 rounded-full">Buyers</div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stats?.total_customers || 0}
                  </div>
                  <div className="text-sm font-medium text-gray-900">Active Customers</div>
                </div>

                <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-gray-900 bg-violet-50 px-2 py-1 rounded-full">Sellers</div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stats?.total_promoters || 0}
                  </div>
                  <div className="text-sm font-medium text-gray-900">Property Promoters</div>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-orange-600 backdrop-blur rounded-xl shadow-lg border border-orange-200/50 p-6 hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur rounded-lg shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-white/90 bg-white/20 px-2 py-1 rounded-full">Revenue</div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    ₹{((stats?.total_revenue || 0) / 100).toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm font-medium text-white/90">Total Earnings</div>
                </div>
              </div>

              {/* Property Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">Pending Review</div>
                    </div>
                    {stats && stats.pending_listings > 0 && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                        Action Required
                      </span>
                    )}
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {stats?.pending_listings || 0}
                  </div>
                  <Link href="/admin/pending-listings" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                    Review listings
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">Live Listings</div>
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {stats?.live_listings || 0}
                  </div>
                  <div className="text-sm text-gray-900">Active properties</div>
                </div>

                <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">Total Unlocks</div>
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {stats?.total_unlocks || 0}
                  </div>
                  <div className="text-sm text-gray-900">Contact reveals</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-xl p-8 text-white relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                      {stats && stats.pending_listings > 0 && (
                        <div className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold">
                          {stats.pending_listings} New
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Review Pending Listings</h3>
                    <p className="text-blue-100 mb-6">
                      Approve or reject property listings waiting for your verification.
                    </p>
                    <Link href="/admin/pending-listings" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-lg font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl group">
                      Start Review
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg border border-gray-200/50 p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Manage Users</h3>
                    <p className="text-gray-900 mb-6">
                      View and manage all platform users, including customers and promoters.
                    </p>
                    <Link href="/admin/users" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-900 rounded-lg font-bold hover:bg-gray-50 hover:border-gray-400 transition-all group">
                      View All Users
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
