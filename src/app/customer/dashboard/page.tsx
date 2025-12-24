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
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
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
          { p_user_id: user.id }
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
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-blue-600">Houlnd</div>
                  <div className="text-sm text-gray-500">Realty</div>
                </Link>
                <Badge variant="success" className="ml-4">Customer</Badge>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/search" className="text-gray-700 hover:text-gray-900">
                  Search
                </Link>
                <Link href="/customer/saved" className="text-gray-700 hover:text-gray-900">
                  Saved
                </Link>
                <Link href="/customer/appointments" className="text-gray-700 hover:text-gray-900">
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
              Welcome back, {profile?.full_name || 'Customer'}!
            </h1>
            <p className="text-gray-600 mt-2">
              Find your dream property with transparent sq.ft pricing.
            </p>
          </div>

          {/* Quick Search */}
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Quick Search</h2>
              <p className="text-sm text-gray-600 mt-1">
                Search by price per square foot (Our PRIMARY USP!)
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQuickSearch} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="minPpsf" className="block text-sm font-medium text-gray-700 mb-1">
                    Min ₹/sq.ft
                  </label>
                  <input
                    id="minPpsf"
                    type="number"
                    value={minPpsf}
                    onChange={(e) => setMinPpsf(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 5000"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="maxPpsf" className="block text-sm font-medium text-gray-700 mb-1">
                    Max ₹/sq.ft
                  </label>
                  <input
                    id="maxPpsf"
                    type="number"
                    value={maxPpsf}
                    onChange={(e) => setMaxPpsf(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 10000"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="w-full sm:w-auto">
                    Search Properties
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats?.saved_properties || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Saved Properties</div>
                    <Link href="/customer/saved" className="text-sm text-blue-600 hover:underline mt-2 block">
                      View All →
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">
                      {stats?.unlocked_properties || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Unlocked Properties</div>
                    <div className="text-sm text-gray-500 mt-2">
                      Contact details unlocked
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats?.upcoming_appointments || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Upcoming Visits</div>
                    <Link href="/customer/appointments" className="text-sm text-blue-600 hover:underline mt-2 block">
                      View Schedule →
                    </Link>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-4xl mb-3">🔍</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Browse Properties
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Search through verified listings with sq.ft filter
                      </p>
                      <Link href="/search">
                        <Button>Start Searching</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-4xl mb-3">❤️</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Saved Properties
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        View your saved and unlocked properties
                      </p>
                      <Link href="/customer/saved">
                        <Button variant="outline">View Saved</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-4xl mb-3">📅</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        My Appointments
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Manage your scheduled site visits
                      </p>
                      <Link href="/customer/appointments">
                        <Button variant="outline">View Appointments</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
