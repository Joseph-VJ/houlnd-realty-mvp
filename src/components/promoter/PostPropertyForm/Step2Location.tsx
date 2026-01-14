/**
 * Step 2: Location Details
 * - City (dropdown)
 * - Locality/Area
 * - Full Address
 * - Latitude/Longitude (optional, for future map integration)
 */

'use client'

import { usePostPropertyStore } from '@/stores/postPropertyStore'

const CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Ahmedabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Jaipur',
  'Surat',
  'Lucknow',
  'Kanpur',
  'Nagpur',
  'Indore',
  'Thane',
  'Bhopal',
  'Visakhapatnam',
  'Pimpri-Chinchwad',
  'Patna',
  'Vadodara',
]

export function Step2Location() {
  const { formData, setFormData, nextStep, previousStep } = usePostPropertyStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  const isValid = formData.city.trim().length > 0 && formData.locality && formData.locality.trim().length > 0

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Location Details</h2>
            <p className="text-gray-600">
              Help buyers find your property by providing accurate location information
            </p>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.city}
              onChange={(e) => setFormData({ city: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            >
              <option value="">Select a city</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Locality/Area */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Locality / Area <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.locality || ''}
              onChange={(e) => setFormData({ locality: e.target.value })}
              placeholder="e.g., Koramangala, Bandra West, Jubilee Hills"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Specific neighborhood or area name
            </p>
          </div>

          {/* Full Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Address (Optional)
            </label>
            <textarea
              value={formData.address || ''}
              onChange={(e) => setFormData({ address: e.target.value })}
              placeholder="Enter complete address (street, landmarks, pin code)"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              This will be shared only after contact is unlocked
            </p>
          </div>

          {/* Map Coordinates (Optional) */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-semibold text-gray-700">
                Map Coordinates (Optional)
              </span>
              <span className="text-xs text-gray-500">For future map integration</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude || ''}
                  onChange={(e) =>
                    setFormData({ latitude: e.target.value ? Number(e.target.value) : null })
                  }
                  placeholder="e.g., 12.9716"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude || ''}
                  onChange={(e) =>
                    setFormData({ longitude: e.target.value ? Number(e.target.value) : null })
                  }
                  placeholder="e.g., 77.5946"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Location Summary */}
          {formData.city && formData.locality && (
            <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="text-sm text-gray-600 mb-1 font-medium">Property Location</div>
              <div className="font-bold text-gray-900">
                {formData.locality}, {formData.city}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex justify-between gap-4">
        <button
          type="button"
          onClick={previousStep}
          className="flex items-center gap-2 px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-bold hover:bg-gray-50 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Property Details
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </form>
  )
}
