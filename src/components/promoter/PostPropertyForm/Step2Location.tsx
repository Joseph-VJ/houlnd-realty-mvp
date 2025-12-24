/**
 * Step 2: Location Details
 * - City (dropdown)
 * - Locality/Area
 * - Full Address
 * - Latitude/Longitude (optional, for future map integration)
 */

'use client'

import { usePostPropertyStore } from '@/stores/postPropertyStore'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

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
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Location Details</h2>
              <p className="text-gray-600 mt-2">
                Help buyers find your property by providing accurate location information
              </p>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ city: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Locality / Area <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.locality || ''}
                onChange={(e) => setFormData({ locality: e.target.value })}
                placeholder="e.g., Koramangala, Bandra West, Jubilee Hills"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Specific neighborhood or area name
              </p>
            </div>

            {/* Full Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Address (Optional)
              </label>
              <textarea
                value={formData.address || ''}
                onChange={(e) => setFormData({ address: e.target.value })}
                placeholder="Enter complete address (street, landmarks, pin code)"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be shared only after contact is unlocked
              </p>
            </div>

            {/* Map Coordinates (Optional) */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Map Coordinates (Optional)
                </span>
                <span className="text-xs text-gray-500">For future map integration</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude || ''}
                    onChange={(e) =>
                      setFormData({ latitude: e.target.value ? Number(e.target.value) : null })
                    }
                    placeholder="e.g., 12.9716"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude || ''}
                    onChange={(e) =>
                      setFormData({ longitude: e.target.value ? Number(e.target.value) : null })
                    }
                    placeholder="e.g., 77.5946"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Location Summary */}
            {formData.city && formData.locality && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Property Location</div>
                <div className="font-semibold text-gray-900">
                  {formData.locality}, {formData.city}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <Button type="button" variant="outline" onClick={previousStep}>
          ← Back
        </Button>
        <Button type="submit" size="lg" disabled={!isValid}>
          Next: Property Details →
        </Button>
      </div>
    </form>
  )
}
