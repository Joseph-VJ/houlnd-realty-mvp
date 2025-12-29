/**
 * Customer Dashboard
 *
 * Features:
 * - Welcome message with user name
 * - Quick search bar with sq.ft price filter
 * - Stats cards: Saved properties, Unlocked properties, Upcoming appointments
 * - Quick links: Search, Saved Properties, Appointments
 *
 * Uses RPC function: get_user_dashboard_stats()
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { createClient } from '@/lib/supabase/client'
import { signOut } from '@/app/actions/auth'

interface DashboardStats {
  saved_properties: number
  unlocked_properties: number
  upcoming_appointments: number
}

export default function CustomerDashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const { profile } = useUserProfile(user?.id)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [minPpsf, setMinPpsf] = useState('')
  const [maxPpsf, setMaxPpsf] = useState('')
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    const fetchDashboardData = async () => {
      try {
        // Fetch stats using RPC function
        const { data: statsData, error: statsError } = await supabase.rpc(
          'get_user_dashboard_stats',
          { p_user_id: user.id } as any
        )

        if (statsError) throw statsError

        setStats(statsData?.[0] || null)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, supabase])

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (minPpsf) params.set('minPpsf', minPpsf)
    if (maxPpsf) params.set('maxPpsf', maxPpsf)
    router.push(`/search?${params.toString()}`)
  }

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <ProtectedRoute requiredRole="CUSTOMER">
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
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">Customer</span>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/search" className="text-gray-900 hover:text-gray-900 font-medium transition-colors">
                  Search
                </Link>
                <Link href="/customer/saved" className="text-gray-900 hover:text-gray-900 font-medium transition-colors">
                  Saved
                </Link>
                <Link href="/customer/appointments" className="text-gray-900 hover:text-gray-900 font-medium transition-colors">
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
              Welcome back, {profile?.full_name || 'Customer'}!
            </h1>
            <p className="text-lg text-gray-900">
              Find your dream property with transparent sq.ft pricing.
            </p>
          </div>

          {/* Quick Search */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-10">
            <div className="mb-5">
              <h2 className="text-2xl font-black text-gray-900 mb-2">Quick Search</h2>
              <p className="text-sm text-gray-900">
                Search by price per square foot - Our PRIMARY USP!
              </p>
            </div>
            <form onSubmit={handleQuickSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="minPpsf" className="block text-sm font-bold text-gray-900 mb-2">
                  Min ₹/sq.ft
                </label>
                <input
                  id="minPpsf"
                  type="number"
                  value={minPpsf}
                  onChange={(e) => setMinPpsf(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="e.g., 5000"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="maxPpsf" className="block text-sm font-bold text-gray-900 mb-2">
                  Max ₹/sq.ft
                </label>
                <input
                  id="maxPpsf"
                  type="number"
                  value={maxPpsf}
                  onChange={(e) => setMaxPpsf(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="e.g., 10000"
                />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-bold transition-all shadow-sm">
                  Search Properties
                </button>
              </div>
            </form>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-black text-gray-900 mb-1">
                    {stats?.saved_properties || 0}
                  </div>
                  <div className="text-sm text-gray-900 font-medium mb-3">Saved Properties</div>
                  <Link href="/customer/saved" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-semibold">
                    View All
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-black text-gray-900 mb-1">
                    {stats?.unlocked_properties || 0}
                  </div>
                  <div className="text-sm text-gray-900 font-medium mb-3">Unlocked Properties</div>
                  <div className="text-sm text-gray-900 font-medium">
                    Contact details unlocked
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-black text-gray-900 mb-1">
                    {stats?.upcoming_appointments || 0}
                  </div>
                  <div className="text-sm text-gray-900 font-medium mb-3">Upcoming Visits</div>
                  <Link href="/customer/appointments" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-semibold">
                    View Schedule
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Browse Properties
                  </h3>
                  <p className="text-sm text-gray-900 mb-5">
                    Search through verified listings with sq.ft filter
                  </p>
                  <Link href="/search">
                    <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-bold transition-all shadow-sm">
                      Start Searching
                    </button>
                  </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Saved Properties
                  </h3>
                  <p className="text-sm text-gray-900 mb-5">
                    View your saved and unlocked properties
                  </p>
                  <Link href="/customer/saved">
                    <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-bold transition-all shadow-sm">
                      View Saved
                    </button>
                  </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    My Appointments
                  </h3>
                  <p className="text-sm text-gray-900 mb-5">
                    Manage your scheduled site visits
                  </p>
                  <Link href="/customer/appointments">
                    <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-bold transition-all shadow-sm">
                      View Appointments
                    </button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
