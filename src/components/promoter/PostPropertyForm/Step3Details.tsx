/**
 * Step 3: Property Details
 * - Bedrooms (for apartments)
 * - Bathrooms (for apartments)
 * - Furnishing Status
 * - Description
 */

'use client'

import { usePostPropertyStore } from '@/stores/postPropertyStore'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export function Step3Details() {
  const { formData, setFormData, nextStep, previousStep } = usePostPropertyStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  const isApartment = formData.property_type === 'APARTMENT'
  const isValid = formData.description && formData.description.trim().length >= 50

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
              <p className="text-gray-600 mt-2">
                Provide detailed information to help buyers understand your property better
              </p>
            </div>

            {/* Bedrooms (only for apartments) */}
            {isApartment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms (BHK)
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFormData({ bedrooms: num })}
                      className={`py-3 px-4 border-2 rounded-lg font-semibold transition ${
                        formData.bedrooms === num
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Number of bedrooms in the apartment
                </p>
              </div>
            )}

            {/* Bathrooms (only for apartments) */}
            {isApartment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFormData({ bathrooms: num })}
                      className={`py-3 px-4 border-2 rounded-lg font-semibold transition ${
                        formData.bathrooms === num
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Number of bathrooms in the apartment
                </p>
              </div>
            )}

            {/* Furnishing Status (only for apartments) */}
            {isApartment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Furnishing Status
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ furnishing_status: 'UNFURNISHED' })}
                    className={`p-4 border-2 rounded-lg text-center transition ${
                      formData.furnishing_status === 'UNFURNISHED'
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">Unfurnished</div>
                    <div className="text-xs text-gray-500">No furniture</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ furnishing_status: 'SEMI_FURNISHED' })}
                    className={`p-4 border-2 rounded-lg text-center transition ${
                      formData.furnishing_status === 'SEMI_FURNISHED'
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">Semi-Furnished</div>
                    <div className="text-xs text-gray-500">Basic furniture</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ furnishing_status: 'FURNISHED' })}
                    className={`p-4 border-2 rounded-lg text-center transition ${
                      formData.furnishing_status === 'FURNISHED'
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">Fully Furnished</div>
                    <div className="text-xs text-gray-500">All furniture</div>
                  </button>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ description: e.target.value })}
                placeholder="Describe your property in detail. Include information about:
- Property highlights and unique features
- Nearby amenities (schools, hospitals, markets)
- Transportation access (metro, bus stops)
- Any additional information buyers should know"
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={50}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Minimum 50 characters required</span>
                <span
                  className={
                    formData.description && formData.description.length >= 50
                      ? 'text-green-600 font-medium'
                      : ''
                  }
                >
                  {formData.description?.length || 0} / 50
                </span>
              </div>
            </div>

            {/* Summary */}
            {isApartment &&
              formData.bedrooms !== null &&
              formData.bathrooms !== null &&
              formData.furnishing_status && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Property Summary</div>
                  <div className="font-semibold text-gray-900">
                    {formData.bedrooms} BHK, {formData.bathrooms} Bath,{' '}
                    {formData.furnishing_status.replace('_', ' ')}
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
          Next: Amenities →
        </Button>
      </div>
    </form>
  )
}
