/**
 * Promoter Appointments Page
 *
 * Features:
 * - Display all appointments for promoter's properties
 * - Filter: Pending, Accepted, All
 * - Status badges: PENDING, ACCEPTED, REJECTED, CANCELLED
 * - Accept/Reject buttons for PENDING appointments
 * - Shows customer details and property info
 * - Add notes when accepting/rejecting
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { getPromoterAppointments, updateAppointmentStatus } from '@/app/actions/appointments'

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
  customer: {
    id: string
    fullName: string
    email: string
    phoneE164: string
  } | null
}

export default function PromoterAppointmentsPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'accepted'>('all')
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<{ id: string; action: 'ACCEPTED' | 'REJECTED' } | null>(null)
  const [notes, setNotes] = useState('')

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
      const result = await getPromoterAppointments()

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
    if (activeFilter === 'pending') {
      setFilteredAppointments(
        appointments.filter((apt) => apt.status === 'PENDING')
      )
    } else if (activeFilter === 'accepted') {
      setFilteredAppointments(
        appointments.filter((apt) => apt.status === 'ACCEPTED')
      )
    } else {
      setFilteredAppointments(appointments)
    }
  }

  const handleAction = async (appointmentId: string, action: 'ACCEPTED' | 'REJECTED') => {
    setSelectedAppointment({ id: appointmentId, action })
    setShowNotesModal(true)
  }

  const confirmAction = async () => {
    if (!selectedAppointment) return

    try {
      setUpdatingId(selectedAppointment.id)
      setShowNotesModal(false)

      const result = await updateAppointmentStatus(
        selectedAppointment.id,
        selectedAppointment.action,
        notes || undefined
      )

      if (result.success) {
        // Update local state
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === selectedAppointment.id
              ? { ...apt, status: selectedAppointment.action, promoter_notes: notes || null }
              : apt
          )
        )
        setNotes('')
        setSelectedAppointment(null)
      } else {
        alert(result.error || 'Failed to update appointment')
      }
    } catch (err) {
      console.error('Error updating appointment:', err)
      alert('An error occurred while updating the appointment')
    } finally {
      setUpdatingId(null)
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
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <ProtectedRoute requiredRole="PROMOTER">
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
              <Link href="/promoter/dashboard">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all">
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
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">Appointment Requests</h1>
            <p className="text-lg text-gray-600">Manage site visit requests for your properties. Confirm or reschedule with buyers securely.</p>
          </div>

          {/* Filter Tabs - Modern Design */}
          <div className="flex gap-3 mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveFilter('pending')}
              className={`pb-3 px-1 font-semibold transition-all border-b-2 ${
                activeFilter === 'pending'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveFilter('accepted')}
              className={`pb-3 px-1 font-semibold transition-all border-b-2 ${
                activeFilter === 'accepted'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Accepted
            </button>
            <button
              onClick={() => setActiveFilter('all')}
              className={`pb-3 px-1 font-semibold transition-all border-b-2 ${
                activeFilter === 'all'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              All
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="text-gray-500">Loading appointments...</div>
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
                      : activeFilter === 'pending'
                        ? 'No Pending Requests'
                        : 'No Accepted Appointments'}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {activeFilter === 'all'
                      ? "You haven't received any appointment requests yet. When customers schedule visits to your properties, they'll appear here."
                      : activeFilter === 'pending'
                        ? 'You have no pending appointment requests at the moment.'
                        : "You haven't accepted any appointments yet."}
                  </p>
                  <Link href="/promoter/listings">
                    <Button>View My Listings</Button>
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
                              <span className="text-sm text-gray-500">
                                {appointmentDate.toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
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
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {appointment.listing.locality && `${appointment.listing.locality}, `}
                              {appointment.listing.city}
                            </p>
                          </div>
                        </div>

                          {/* Customer Info */}
                          {appointment.customer && (
                            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="text-sm text-gray-700">
                                <div className="font-medium text-blue-800 mb-1">
                                  Customer Details
                                </div>
                                <div>
                                  <span className="font-medium">Name:</span>{' '}
                                  {appointment.customer.fullName}
                                </div>
                                <div>
                                  <span className="font-medium">Phone:</span>{' '}
                                  <a
                                    href={`tel:${appointment.customer.phoneE164}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {appointment.customer.phoneE164}
                                  </a>
                                </div>
                                <div>
                                  <span className="font-medium">Email:</span>{' '}
                                  <a
                                    href={`mailto:${appointment.customer.email}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {appointment.customer.email}
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Customer Notes */}
                          {appointment.customer_notes && (
                            <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                              <div className="text-sm text-gray-700">
                                <span className="font-medium">Customer's message:</span>{' '}
                                {appointment.customer_notes}
                              </div>
                            </div>
                          )}

                          {/* Promoter Notes */}
                          {appointment.promoter_notes && (
                            <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                              <div className="text-sm text-gray-700">
                                <span className="font-medium">Your note:</span>{' '}
                                {appointment.promoter_notes}
                              </div>
                            </div>
                          )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleAction(appointment.id, 'ACCEPTED')}
                                disabled={updatingId === appointment.id}
                                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium transition-all text-sm shadow-sm disabled:opacity-50"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {updatingId === appointment.id ? 'Processing...' : 'Confirm'}
                              </button>
                              <button
                                onClick={() => handleAction(appointment.id, 'REJECTED')}
                                disabled={updatingId === appointment.id}
                                className="px-5 py-2.5 border border-gray-300 hover:border-red-300 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-full font-medium transition-all text-sm disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full font-medium text-sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {appointment.status}
                            </span>
                          )}
                          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-all text-sm shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Reschedule
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>

        {/* Notes Modal - Modern Design */}
        {showNotesModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all">
              <h3 className="text-2xl font-black text-gray-900 mb-2">
                {selectedAppointment.action === 'ACCEPTED' ? 'Confirm Appointment' : 'Reject Appointment'}
              </h3>
              <p className="text-sm text-gray-600 mb-5">
                {selectedAppointment.action === 'ACCEPTED'
                  ? 'Add a personal note for the customer. Your contact details will be automatically shared.'
                  : 'Let the customer know your reason (optional). This helps maintain transparency.'}
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-5 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowNotesModal(false)
                    setSelectedAppointment(null)
                    setNotes('')
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className={`flex-1 px-4 py-3 text-white rounded-full font-medium transition-all shadow-sm ${
                    selectedAppointment.action === 'ACCEPTED'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
