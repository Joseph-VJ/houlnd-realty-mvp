/**
 * Customer Appointments Page
 *
 * Features:
 * - Display all customer's scheduled appointments
 * - Filter: Upcoming, Past, All
 * - Status badges: PENDING, ACCEPTED, REJECTED, CANCELLED
 * - Cancel button for PENDING appointments
 * - Shows property details and promoter contact info
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { getCustomerAppointments, cancelAppointment } from '@/app/actions/appointments'

interface Appointment {
  id: string
  listing_id: string
  customer_id: string
  promoter_id: string
  scheduled_start: string
  scheduled_end: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
  customer_notes: string | null
  promoter_notes: string | null
  created_at: string
  listing: {
    id: string
    title: string
    property_type: string
    city: string
    locality: string
    image_urls: string[]
  }
  promoter: {
    id: string
    fullName: string
    email: string
    phoneE164: string
  } | null
}

export default function CustomerAppointmentsPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'past'>('all')

  useEffect(() => {
    fetchAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, activeFilter])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getCustomerAppointments()

      if (result.success && result.data) {
        setAppointments(result.data)
      } else {
        setError(result.error || 'Failed to load appointments')
      }
    } catch (err) {
      console.error('Error fetching appointments:', err)
      setError('An error occurred while loading appointments')
    } finally {
      setLoading(false)
    }
  }

  const filterAppointments = () => {
    const now = new Date()

    if (activeFilter === 'upcoming') {
      setFilteredAppointments(
        appointments.filter((apt) => new Date(apt.scheduled_start) >= now)
      )
    } else if (activeFilter === 'past') {
      setFilteredAppointments(
        appointments.filter((apt) => new Date(apt.scheduled_start) < now)
      )
    } else {
      setFilteredAppointments(appointments)
    }
  }

  const handleCancel = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    try {
      setCancellingId(appointmentId)
      const result = await cancelAppointment(appointmentId, 'Cancelled by customer')

      if (result.success) {
        // Update local state
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === appointmentId ? { ...apt, status: 'CANCELLED' } : apt
          )
        )
      } else {
        alert(result.error || 'Failed to cancel appointment')
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err)
      alert('An error occurred while cancelling the appointment')
    } finally {
      setCancellingId(null)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-900'
      default:
        return 'bg-gray-100 text-gray-900'
    }
  }

  return (
    <ProtectedRoute requiredRole="CUSTOMER">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white rounded-sm transform rotate-45"></div>
                </div>
                <span className="text-xl font-bold text-gray-900">Houlnd Realty</span>
              </Link>
              <Link href="/customer/dashboard">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-900 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="font-medium">Back</span>
                </button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">My Scheduled Appointments</h1>
            <p className="text-lg text-gray-900">Manage your upcoming property visits and buyer inquiries securely. Confirm visits or reschedule with a single tap.</p>
          </div>

          {/* Filter Tabs - Modern Design */}
          <div className="flex gap-3 mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveFilter('upcoming')}
              className={`pb-3 px-1 font-semibold transition-all border-b-2 ${
                activeFilter === 'upcoming'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-900 border-transparent hover:text-gray-900'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveFilter('past')}
              className={`pb-3 px-1 font-semibold transition-all border-b-2 ${
                activeFilter === 'past'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-900 border-transparent hover:text-gray-900'
              }`}
            >
              Past
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="text-gray-900">Loading appointments...</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && !loading && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={fetchAppointments}>Try Again</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !error && filteredAppointments.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {activeFilter === 'all'
                      ? 'No Appointments Yet'
                      : activeFilter === 'upcoming'
                        ? 'No Upcoming Appointments'
                        : 'No Past Appointments'}
                  </h3>
                  <p className="text-gray-900 mb-6 max-w-md mx-auto">
                    {activeFilter === 'all'
                      ? "You haven't scheduled any property visits yet. Browse properties and schedule visits to view them here."
                      : activeFilter === 'upcoming'
                        ? 'You have no upcoming property visits scheduled.'
                        : "You haven't had any past appointments yet."}
                  </p>
                  <Link href="/search">
                    <Button>Browse Properties</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appointments List - Modern Cards */}
          {!loading && !error && filteredAppointments.length > 0 && (
            <div className="space-y-5">
              {filteredAppointments.map((appointment) => {
                const appointmentDate = new Date(appointment.scheduled_start)
                const isPending = appointment.status === 'PENDING'
                const imageUrl =
                  appointment.listing.image_urls && appointment.listing.image_urls.length > 0
                    ? appointment.listing.image_urls[0]
                    : '/placeholder-property.jpg'

                return (
                  <div key={appointment.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-5 p-5">
                      {/* Property Image */}
                      <div className="w-full md:w-32 h-32 flex-shrink-0">
                        <img
                          src={imageUrl}
                          alt={appointment.listing.title}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>

                      {/* Appointment Details */}
                      <div className="flex-1 space-y-3">
                        {/* Header Row */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
                                {appointmentDate.toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getStatusBadgeColor(appointment.status)}`}>
                                {appointment.status}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 truncate">
                              {appointment.listing.title ||
                                `${appointment.listing.property_type} in ${appointment.listing.locality || appointment.listing.city}`}
                            </h3>
                            <p className="text-sm text-gray-900 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {appointment.listing.locality && `${appointment.listing.locality}, `}
                              {appointment.listing.city}
                            </p>
                          </div>
                        </div>

                          {/* Promoter Info (if accepted) */}
                          {appointment.status === 'ACCEPTED' && appointment.promoter && (
                            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="text-sm text-gray-900">
                                <div className="font-medium text-green-800 mb-1">
                                  Appointment Confirmed
                                </div>
                                <div>
                                  <span className="font-medium">Contact:</span>{' '}
                                  {appointment.promoter.fullName}
                                </div>
                                <div>
                                  <span className="font-medium">Phone:</span>{' '}
                                  {appointment.promoter.phoneE164}
                                </div>
                                <div>
                                  <span className="font-medium">Email:</span>{' '}
                                  {appointment.promoter.email}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Customer Notes */}
                          {appointment.customer_notes && (
                            <div className="mb-3">
                              <div className="text-sm text-gray-900">
                                <span className="font-medium">Your message:</span>{' '}
                                {appointment.customer_notes}
                              </div>
                            </div>
                          )}

                          {/* Promoter Notes */}
                          {appointment.promoter_notes && (
                            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="text-sm text-gray-900">
                                <span className="font-medium">Promoter's note:</span>{' '}
                                {appointment.promoter_notes}
                              </div>
                            </div>
                          )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          {appointment.status === 'ACCEPTED' && (
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium transition-all text-sm shadow-sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Confirmed
                            </button>
                          )}
                          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-all text-sm shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Reschedule
                          </button>
                          {isPending && (
                            <button
                              onClick={() => handleCancel(appointment.id)}
                              disabled={cancellingId === appointment.id}
                              className="px-4 py-2 border border-gray-300 hover:border-red-300 hover:bg-red-50 text-gray-900 hover:text-red-600 rounded-full font-medium transition-all text-sm disabled:opacity-50"
                            >
                              {cancellingId === appointment.id ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
