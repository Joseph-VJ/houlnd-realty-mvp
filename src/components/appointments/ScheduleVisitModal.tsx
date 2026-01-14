'use client'

import { useState } from 'react'
import { createAppointment } from '@/app/actions/appointments'

interface ScheduleVisitModalProps {
  listingId: string
  listingTitle: string
  onClose: () => void
  onSuccess?: () => void
}

export default function ScheduleVisitModal({
  listingId,
  listingTitle,
  onClose,
  onSuccess,
}: ScheduleVisitModalProps) {
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    visitorName: '',
    visitorPhone: '',
    visitorEmail: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Time slots from 9 AM to 6 PM
  const timeSlots = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
  ]

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const validateForm = (): string | null => {
    if (!formData.scheduledDate) return 'Please select a date'
    if (!formData.scheduledTime) return 'Please select a time'
    if (!formData.visitorName.trim()) return 'Please enter your name'
    if (!formData.visitorPhone.trim()) return 'Please enter your phone number'

    // Validate date is in future
    const selectedDate = new Date(`${formData.scheduledDate}T${formData.scheduledTime}:00`)
    const now = new Date()
    if (selectedDate <= now) {
      return 'Please select a future date and time'
    }

    // Basic phone validation
    const phoneRegex = /^[0-9+\-\s()]{10,}$/
    if (!phoneRegex.test(formData.visitorPhone)) {
      return 'Please enter a valid phone number'
    }

    // Email validation (optional field)
    if (formData.visitorEmail && formData.visitorEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.visitorEmail)) {
        return 'Please enter a valid email address'
      }
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate form
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createAppointment(listingId, {
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        visitorName: formData.visitorName,
        visitorPhone: formData.visitorPhone,
        visitorEmail: formData.visitorEmail || undefined,
        message: formData.message || undefined,
      })

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess?.()
          onClose()
        }, 2000)
      } else {
        setError(result.error || 'Failed to schedule appointment')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Appointment booking error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Schedule a Visit</h2>
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">{listingTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-3xl leading-none transition-colors"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-green-800 font-semibold">
                Appointment scheduled successfully!
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Date */}
          <div>
            <label htmlFor="scheduledDate" className="block text-sm font-semibold text-gray-700 mb-2">
              Visit Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="scheduledDate"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              min={today}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Time */}
          <div>
            <label htmlFor="scheduledTime" className="block text-sm font-semibold text-gray-700 mb-2">
              Preferred Time <span className="text-red-500">*</span>
            </label>
            <select
              id="scheduledTime"
              name="scheduledTime"
              value={formData.scheduledTime}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">Select time slot</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* Visitor Name */}
          <div>
            <label htmlFor="visitorName" className="block text-sm font-semibold text-gray-700 mb-2">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="visitorName"
              name="visitorName"
              value={formData.visitorName}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Visitor Phone */}
          <div>
            <label htmlFor="visitorPhone" className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="visitorPhone"
              name="visitorPhone"
              value={formData.visitorPhone}
              onChange={handleChange}
              required
              placeholder="+91 98765 43210"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Visitor Email (Optional) */}
          <div>
            <label htmlFor="visitorEmail" className="block text-sm font-semibold text-gray-700 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              id="visitorEmail"
              name="visitorEmail"
              value={formData.visitorEmail}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Message (Optional) */}
          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              placeholder="Any specific requirements or questions..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-5 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || success}
              className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Scheduling...' : success ? 'Scheduled!' : 'Schedule Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
