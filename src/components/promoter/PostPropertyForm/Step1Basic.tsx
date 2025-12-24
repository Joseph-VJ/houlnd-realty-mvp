/**
 * Step 1: Basic Details
 * - Property Type (Plot/Apartment)
 * - Total Price
 * - Total Sq.ft
 * - Price Type (Fixed/Negotiable)
 */

'use client'

import { usePostPropertyStore } from '@/stores/postPropertyStore'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export function Step1Basic() {
  const { formData, setFormData, nextStep } = usePostPropertyStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  const isValid = (formData.total_price || 0) > 0 && (formData.total_sqft || 0) > 0

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Basic Details</h2>
              <p className="text-gray-600 mt-2">
                Let's start with the fundamental information about your property
              </p>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ property_type: 'PLOT' })}
                  className={`p-4 border-2 rounded-lg text-center transition ${
                    formData.property_type === 'PLOT'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">🏞️</div>
                  <div className="font-semibold">Plot</div>
                  <div className="text-xs text-gray-500">Empty land/site</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ property_type: 'APARTMENT' })}
                  className={`p-4 border-2 rounded-lg text-center transition ${
                    formData.property_type === 'APARTMENT'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">🏢</div>
                  <div className="font-semibold">Apartment</div>
                  <div className="text-xs text-gray-500">Residential unit</div>
                </button>
              </div>
            </div>

            {/* Total Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.total_price || ''}
                onChange={(e) => setFormData({ total_price: Number(e.target.value) })}
                placeholder="e.g., 5000000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(formData.total_price || 0) > 0
                  ? `₹${(formData.total_price || 0).toLocaleString('en-IN')}`
                  : 'Enter the total selling price'}
              </p>
            </div>

            {/* Total Sq.ft */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Area (sq.ft) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.total_sqft || ''}
                onChange={(e) => setFormData({ total_sqft: Number(e.target.value) })}
                placeholder="e.g., 1500"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(formData.total_sqft || 0) > 0
                  ? `${(formData.total_sqft || 0).toLocaleString('en-IN')} sq.ft`
                  : 'Enter the total area in square feet'}
              </p>
            </div>

            {/* Price per sq.ft (calculated) */}
            {(formData.total_price || 0) > 0 && (formData.total_sqft || 0) > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-gray-600">Price per sq.ft</div>
                <div className="text-2xl font-bold text-green-600">
                  ₹{Math.round((formData.total_price || 0) / (formData.total_sqft || 1)).toLocaleString('en-IN')}
                  /sq.ft
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  This will be prominently displayed to buyers
                </div>
              </div>
            )}

            {/* Price Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ price_type: 'FIXED' })}
                  className={`p-4 border-2 rounded-lg text-center transition ${
                    formData.price_type === 'FIXED'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">Fixed Price</div>
                  <div className="text-xs text-gray-500">Non-negotiable</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ price_type: 'NEGOTIABLE' })}
                  className={`p-4 border-2 rounded-lg text-center transition ${
                    formData.price_type === 'NEGOTIABLE'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">Negotiable</div>
                  <div className="text-xs text-gray-500">Open to offers</div>
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="mt-6 flex justify-end">
        <Button type="submit" size="lg" disabled={!isValid}>
          Next: Location Details →
        </Button>
      </div>
    </form>
  )
}
