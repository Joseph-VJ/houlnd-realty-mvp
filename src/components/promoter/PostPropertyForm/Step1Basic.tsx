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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Basic Details</h2>
            <p className="text-gray-900">
              Let's start with the fundamental information about your property
            </p>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Property Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ property_type: 'PLOT' })}
                className={`p-6 border-2 rounded-xl text-center transition-all hover:scale-105 ${
                  formData.property_type === 'PLOT'
                    ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-lg shadow-blue-100'
                    : 'border-gray-300 hover:border-blue-400 hover:shadow-md'
                }`}
              >
                <div className="text-4xl mb-2">🏞️</div>
                <div className="font-bold text-gray-900">Plot</div>
                <div className="text-xs text-gray-500 mt-1">Empty land/site</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ property_type: 'APARTMENT' })}
                className={`p-6 border-2 rounded-xl text-center transition-all hover:scale-105 ${
                  formData.property_type === 'APARTMENT'
                    ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-lg shadow-blue-100'
                    : 'border-gray-300 hover:border-blue-400 hover:shadow-md'
                }`}
              >
                <div className="text-4xl mb-2">🏢</div>
                <div className="font-bold text-gray-900">Apartment</div>
                <div className="text-xs text-gray-500 mt-1">Residential unit</div>
              </button>
            </div>
          </div>

          {/* Total Price */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Total Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.total_price || ''}
              onChange={(e) => setFormData({ total_price: Number(e.target.value) })}
              placeholder="e.g., 5000000"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400"
              required
              min="1"
            />
            <p className="text-xs text-gray-900 mt-2 font-medium">
              {(formData.total_price || 0) > 0
                ? `₹${(formData.total_price || 0).toLocaleString('en-IN')}`
                : 'Enter the total selling price'}
            </p>
          </div>

          {/* Total Sq.ft */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Total Area (sq.ft) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.total_sqft || ''}
              onChange={(e) => setFormData({ total_sqft: Number(e.target.value) })}
              placeholder="e.g., 1500"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400"
              required
              min="1"
            />
            <p className="text-xs text-gray-900 mt-2 font-medium">
              {(formData.total_sqft || 0) > 0
                ? `${(formData.total_sqft || 0).toLocaleString('en-IN')} sq.ft`
                : 'Enter the total area in square feet'}
            </p>
          </div>

          {/* Price per sq.ft (calculated) */}
          {(formData.total_price || 0) > 0 && (formData.total_sqft || 0) > 0 && (
            <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="text-sm text-gray-900 font-medium">Price per sq.ft</div>
              <div className="text-3xl font-black text-blue-600 mt-1">
                ₹{Math.round((formData.total_price || 0) / (formData.total_sqft || 1)).toLocaleString('en-IN')}
                /sq.ft
              </div>
              <div className="text-xs text-gray-900 mt-2 font-medium">
                This will be prominently displayed to buyers
              </div>
            </div>
          )}

          {/* Price Type */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Price Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ price_type: 'FIXED' })}
                className={`p-6 border-2 rounded-xl text-center transition-all hover:scale-105 ${
                  formData.price_type === 'FIXED'
                    ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-lg shadow-blue-100'
                    : 'border-gray-300 hover:border-blue-400 hover:shadow-md'
                }`}
              >
                <div className="font-bold text-gray-900">Fixed Price</div>
                <div className="text-xs text-gray-500 mt-1">Non-negotiable</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ price_type: 'NEGOTIABLE' })}
                className={`p-6 border-2 rounded-xl text-center transition-all hover:scale-105 ${
                  formData.price_type === 'NEGOTIABLE'
                    ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-lg shadow-blue-100'
                    : 'border-gray-300 hover:border-blue-400 hover:shadow-md'
                }`}
              >
                <div className="font-bold text-gray-900">Negotiable</div>
                <div className="text-xs text-gray-500 mt-1">Open to offers</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={!isValid}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/30 transform active:scale-95"
        >
          Next: Location Details
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </form>
  )
}
