/**
 * Step 6: Availability
 * - Set time slots for site visits (optional)
 * - This will be used for appointment scheduling in Phase 5
 */

'use client'

import { usePostPropertyStore } from '@/stores/postPropertyStore'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export function Step6Availability() {
  const { formData, nextStep, previousStep } = usePostPropertyStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Availability for Site Visits</h2>
              <p className="text-gray-600 mt-2">
                Set your preferred time slots for showing the property to interested buyers
              </p>
            </div>

            {/* Coming Soon Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Appointment Scheduling Coming Soon
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-4">
                The availability and appointment scheduling feature is under development. For
                now, buyers will contact you directly after unlocking your contact details.
              </p>
              <div className="text-sm text-gray-500">
                You can skip this step and continue with your listing.
              </div>
            </div>

            {/* Future Features Preview */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="text-sm font-medium text-gray-700 mb-3">
                Upcoming Features:
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Set weekly recurring availability slots</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Customers can book appointments directly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Automatic calendar sync and reminders</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Manage bookings from your dashboard</span>
                </li>
              </ul>
            </div>

            {/* Placeholder for future availability form */}
            <div className="opacity-50 pointer-events-none">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred Days (Disabled - Coming Soon)
              </label>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <button
                    key={day}
                    type="button"
                    disabled
                    className="py-2 px-3 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-400"
                  >
                    {day}
                  </button>
                ))}
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-3">
                Time Slots (Disabled - Coming Soon)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">From</label>
                  <input
                    type="time"
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To</label>
                  <input
                    type="time"
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <Button type="button" variant="outline" onClick={previousStep}>
          ← Back
        </Button>
        <Button type="submit" size="lg">
          Next: Agreement →
        </Button>
      </div>
    </form>
  )
}
