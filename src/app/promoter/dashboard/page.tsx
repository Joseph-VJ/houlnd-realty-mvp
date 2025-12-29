/**
 * Promoter Dashboard
 *
 * Features:
 * - Welcome message with user name
 * - Stats cards: Total listings, Pending verification, Live listings, Total unlocks, Upcoming appointments
 * - Recent unlocks list
 * - Quick actions: Post New Property, View All Listings
 *
 * Uses server action: getPromoterDashboardStats()
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { signOut } from '@/app/actions/auth'
import { getPromoterDashboardStats } from '@/app/actions/dashboard'
import { getPromoterRecentUnlocks } from '@/app/actions/admin'

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

  useEffect(() => {
    if (!user) return

    const fetchDashboardData = async () => {
      try {
        // Fetch stats using server action (supports offline mode)
        const statsResult = await getPromoterDashboardStats()

        if (statsResult.success && statsResult.data) {
          setStats({
            total_listings: statsResult.data.total_listings,
            pending_listings: statsResult.data.pending_listings,
            live_listings: statsResult.data.live_listings,
            total_unlocks: statsResult.data.total_unlocks,
            upcoming_appointments: 0 // TODO: Add appointments count
          })
        }

        // Fetch recent unlocks using server action (supports offline mode)
        const unlocksResult = await getPromoterRecentUnlocks()

        if (unlocksResult.success && unlocksResult.data) {
          setRecentUnlocks(unlocksResult.data)
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
    <ProtectedRoute requiredRole="PROMOTER">
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
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold">Promoter</span>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/promoter/listings" className="text-gray-900 hover:text-gray-900 font-medium transition-colors">
                  My Listings
                </Link>
                <Link href="/promoter/appointments" className="text-gray-900 hover:text-gray-900 font-medium transition-colors">
                  Appointments
                </Link>
                <button onClick={handleLogout} className="px-4 py-2 text-gray-900 hover:text-gray-900 hover:bg-gray-100 rounded-full font-medium transition-all">
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
              Welcome back, {profile?.full_name || 'Promoter'}!
            </h1>
            <p className="text-lg text-gray-900">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="text-3xl font-black text-gray-900 mb-1">
                    {stats?.total_listings || 0}
                  </div>
                  <div className="text-sm text-gray-900 font-medium">Total Listings</div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-black text-gray-900 mb-1">
                    {stats?.pending_listings || 0}
                  </div>
                  <div className="text-sm text-gray-900 font-medium">Pending Verification</div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-black text-gray-900 mb-1">
                    {stats?.live_listings || 0}
                  </div>
                  <div className="text-sm text-gray-900 font-medium">Live Listings</div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-black text-gray-900 mb-1">
                    {stats?.total_unlocks || 0}
                  </div>
                  <div className="text-sm text-gray-900 font-medium">Total Unlocks</div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-black text-gray-900 mb-1">
                    {stats?.upcoming_appointments || 0}
                  </div>
                  <div className="text-sm text-gray-900 font-medium">Upcoming Visits</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Post New Property
                      </h3>
                      <p className="text-sm text-gray-900 mb-5">
                        List a new property for verification and go live.
                      </p>
                      <Link href="/promoter/post-new-property">
                        <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-bold transition-all shadow-sm">
                          Post Property
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Manage Listings
                      </h3>
                      <p className="text-sm text-gray-900 mb-5">
                        View and edit all your property listings.
                      </p>
                      <Link href="/promoter/listings">
                        <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-bold transition-all shadow-sm">
                          View Listings
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Unlocks */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Recent Inquiries</h2>
                  <p className="text-sm text-gray-900">
                    Customers who recently unlocked your property contact
                  </p>
                </div>
                <div>
                  {recentUnlocks.length === 0 ? (
                    <div className="text-center py-12 text-gray-900">
                      No inquiries yet. Your listings will appear here once customers unlock them.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentUnlocks.map((unlock) => (
                        <div
                          key={unlock.id}
                          className="flex items-center justify-between p-5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-blue-200 transition-all"
                        >
                          <div className="flex-1">
                            <div className="font-bold text-gray-900 mb-1">{unlock.customer_name}</div>
                            <div className="text-sm text-gray-900 font-medium">{unlock.customer_phone}</div>
                            <div className="text-sm text-gray-900 mt-2">{unlock.listing_title}</div>
                          </div>
                          <div className="text-sm text-gray-900 font-medium">
                            {new Date(unlock.created_at).toLocaleDateString()}
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
