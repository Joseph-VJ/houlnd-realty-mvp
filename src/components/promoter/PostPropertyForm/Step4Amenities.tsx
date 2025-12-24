/**
 * Step 4: Amenities
 * - Amenities checkboxes (pool, gym, parking, etc.)
 * - Amenities Price (optional)
 */

'use client'

import { usePostPropertyStore } from '@/stores/postPropertyStore'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

const AMENITIES_LIST = [
  { id: 'parking', label: 'Parking', icon: '🅿️' },
  { id: 'gym', label: 'Gym', icon: '🏋️' },
  { id: 'swimming_pool', label: 'Swimming Pool', icon: '🏊' },
  { id: 'garden', label: 'Garden', icon: '🌳' },
  { id: 'clubhouse', label: 'Clubhouse', icon: '🏛️' },
  { id: 'security', label: '24x7 Security', icon: '🔒' },
  { id: 'power_backup', label: 'Power Backup', icon: '⚡' },
  { id: 'elevator', label: 'Elevator', icon: '🛗' },
  { id: 'playground', label: 'Playground', icon: '🎪' },
  { id: 'water_supply', label: '24x7 Water Supply', icon: '💧' },
  { id: 'gas_pipeline', label: 'Gas Pipeline', icon: '🔥' },
  { id: 'wifi', label: 'WiFi', icon: '📶' },
]

export function Step4Amenities() {
  const { formData, setFormData, nextStep, previousStep } = usePostPropertyStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  const toggleAmenity = (amenityId: string) => {
    const currentAmenities = formData.amenities || []
    const amenityLabel = AMENITIES_LIST.find((a) => a.id === amenityId)?.label || amenityId

    if (currentAmenities.includes(amenityLabel)) {
      setFormData({
        amenities: currentAmenities.filter((a) => a !== amenityLabel),
      })
    } else {
      setFormData({
        amenities: [...currentAmenities, amenityLabel],
      })
    }
  }

  const isAmenitySelected = (amenityId: string) => {
    const amenityLabel = AMENITIES_LIST.find((a) => a.id === amenityId)?.label || amenityId
    return (formData.amenities || []).includes(amenityLabel)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Amenities</h2>
              <p className="text-gray-600 mt-2">
                Select all amenities available with your property (optional but recommended)
              </p>
            </div>

            {/* Amenities Grid */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Available Amenities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AMENITIES_LIST.map((amenity) => (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`p-4 border-2 rounded-lg text-left transition ${
                      isAmenitySelected(amenity.id)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{amenity.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{amenity.label}</div>
                      </div>
                      {isAmenitySelected(amenity.id) && (
                        <div className="text-blue-600">✓</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Click to select/deselect amenities
              </p>
            </div>

            {/* Selected Amenities Summary */}
            {formData.amenities && formData.amenities.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">
                  Selected Amenities ({formData.amenities.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="px-3 py-1 bg-white border border-blue-300 rounded-full text-sm text-gray-700"
                    >
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amenities Price (Optional)
              </label>
              <input
                type="number"
                value={formData.amenities_price || ''}
                onChange={(e) =>
                  setFormData({
                    amenities_price: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="e.g., 50000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.amenities_price && formData.amenities_price > 0
                  ? `₹${formData.amenities_price.toLocaleString('en-IN')}`
                  : 'Additional charge for amenities (if any)'}
              </p>
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
          Next: Upload Photos →
        </Button>
      </div>
    </form>
  )
}
