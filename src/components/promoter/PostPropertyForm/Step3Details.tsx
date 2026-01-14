/**
 * Step 3: Property Details
 * - Bedrooms (for apartments)
 * - Bathrooms (for apartments)
 * - Furnishing Status
 * - Description
 */

'use client'

import { usePostPropertyStore } from '@/stores/postPropertyStore'

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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Property Details</h2>
            <p className="text-gray-600">
              Provide detailed information to help buyers understand your property better
            </p>
          </div>

          {/* Bedrooms (only for apartments) */}
          {isApartment && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Bedrooms (BHK)
              </label>
              <div className="grid grid-cols-6 gap-3">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData({ bedrooms: num })}
                    className={`py-3 px-4 border-2 rounded-xl font-bold transition-all ${
                      formData.bedrooms === num
                        ? 'border-blue-600 bg-blue-50 text-blue-600 scale-105 shadow-sm'
                        : 'border-gray-300 hover:border-blue-400 hover:scale-105'
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
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Bathrooms
              </label>
              <div className="grid grid-cols-6 gap-3">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData({ bathrooms: num })}
                    className={`py-3 px-4 border-2 rounded-xl font-bold transition-all ${
                      formData.bathrooms === num
                        ? 'border-blue-600 bg-blue-50 text-blue-600 scale-105 shadow-sm'
                        : 'border-gray-300 hover:border-blue-400 hover:scale-105'
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
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Furnishing Status
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ furnishing_status: 'UNFURNISHED' })}
                  className={`p-5 border-2 rounded-xl text-center transition-all hover:scale-105 ${
                    formData.furnishing_status === 'UNFURNISHED'
                      ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <div className="font-bold text-lg mb-1">Unfurnished</div>
                  <div className="text-xs text-gray-500">No furniture</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ furnishing_status: 'SEMI_FURNISHED' })}
                  className={`p-5 border-2 rounded-xl text-center transition-all hover:scale-105 ${
                    formData.furnishing_status === 'SEMI_FURNISHED'
                      ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <div className="font-bold text-lg mb-1">Semi-Furnished</div>
                  <div className="text-xs text-gray-500">Basic furniture</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ furnishing_status: 'FURNISHED' })}
                  className={`p-5 border-2 rounded-xl text-center transition-all hover:scale-105 ${
                    formData.furnishing_status === 'FURNISHED'
                      ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <div className="font-bold text-lg mb-1">Fully Furnished</div>
                  <div className="text-xs text-gray-500">All furniture</div>
                </button>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              required
              minLength={50}
            />
            <div className="flex justify-between text-xs mt-2">
              <span className="text-gray-500">Minimum 50 characters required</span>
              <span
                className={
                  formData.description && formData.description.length >= 50
                    ? 'text-green-600 font-bold'
                    : 'text-gray-500'
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
              <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="text-sm text-gray-600 mb-1 font-medium">Property Summary</div>
                <div className="font-bold text-gray-900">
                  {formData.bedrooms} BHK, {formData.bathrooms} Bath,{' '}
                  {formData.furnishing_status.replace('_', ' ')}
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
          Next: Amenities
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </form>
  )
}
