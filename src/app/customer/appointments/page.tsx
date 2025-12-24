/**
 * Customer Appointments Page (Placeholder)
 *
 * This page will show:
 * - Upcoming appointments
 * - Past appointments
 * - Cancelled appointments
 * - Actions: Cancel, Reschedule request
 */

'use client'

import Link from 'next/link'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export default function CustomerAppointmentsPage() {
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
              </div>
              <div className="flex items-center gap-4">
                <Link href="/customer/dashboard">
                  <Button variant="ghost" size="sm">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-600 mt-2">Manage your scheduled site visits</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Appointments Feature Coming Soon
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  The appointments feature is under development. You'll be able to schedule site visits
                  with property owners directly from property listings.
                </p>
                <Link href="/search">
                  <Button>Browse Properties</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
