/**
 * Step 6: Availability
 * - Set time slots for site visits (optional)
 * - This will be used for appointment scheduling in Phase 5
 */

'use client'

import { usePostPropertyStore } from '@/stores/postPropertyStore'

export function Step6Availability() {
  const { formData, nextStep, previousStep } = usePostPropertyStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Availability for Site Visits</h2>
            <p className="text-gray-900">
              Set your preferred time slots for showing the property to interested buyers
            </p>
          </div>

          {/* Coming Soon Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-xl font-black text-gray-900 mb-2">
              Appointment Scheduling Coming Soon
            </h3>
            <p className="text-gray-900 max-w-md mx-auto mb-4">
              The availability and appointment scheduling feature is under development. For
              now, buyers will contact you directly after unlocking your contact details.
            </p>
            <div className="text-sm text-gray-900 font-medium">
              You can skip this step and continue with your listing.
            </div>
          </div>

          {/* Future Features Preview */}
          <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
            <div className="text-sm font-bold text-gray-800 mb-3">
              Upcoming Features:
            </div>
            <ul className="text-sm text-gray-900 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Set weekly recurring availability slots</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Customers can book appointments directly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Automatic calendar sync and reminders</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Manage bookings from your dashboard</span>
              </li>
            </ul>
          </div>

          {/* Placeholder for future availability form */}
          <div className="opacity-50 pointer-events-none">
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Preferred Days (Disabled - Coming Soon)
            </label>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <button
                  key={day}
                  type="button"
                  disabled
                  className="py-2 px-3 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-400"
                >
                  {day}
                </button>
              ))}
            </div>

            <label className="block text-sm font-bold text-gray-900 mb-3">
              Time Slots (Disabled - Coming Soon)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-900 mb-1">From</label>
                <input
                  type="time"
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-900 mb-1">To</label>
                <input
                  type="time"
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex justify-between gap-4">
        <button
          type="button"
          onClick={previousStep}
          className="flex items-center gap-2 px-8 py-3 border-2 border-gray-300 text-gray-900 rounded-full font-bold hover:bg-gray-50 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30"
        >
          Next: Agreement
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </form>
  )
}
