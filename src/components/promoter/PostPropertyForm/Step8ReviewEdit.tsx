/**
 * Step 8: Review & Update (Edit Mode)
 * - Display summary of all entered data
 * - Upload new images to Supabase Storage
 * - Update listing via API
 * - Show success/error state
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePostPropertyStore } from '@/stores/postPropertyStore'
import { useAuth } from '@/hooks/useAuth'
import { updateListing } from '@/app/actions/updateListing'

interface Step8ReviewEditProps {
  listingId?: string
}

export function Step8ReviewEdit({ listingId }: Step8ReviewEditProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { formData, existingImageUrls, previousStep, resetForm } = usePostPropertyStore()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Compress image to reduce file size
  const compressImage = async (file: File): Promise<{ blob: Blob; type: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const reader = new FileReader()

      reader.onload = (e) => {
        img.src = e.target?.result as string
      }

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Resize if image is too large (max 1920px width)
        const maxWidth = 1920
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Convert to blob with compression (0.8 quality for JPEG)
        const outputType = 'image/jpeg' // Always use JPEG for better compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, type: outputType })
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          outputType,
          0.8
        )
      }

      img.onerror = reject
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError('You must be logged in to update a listing')
      return
    }

    if (!listingId) {
      setError('Listing ID is missing')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      // Compress and convert new images to base64
      const newImageFilesData = await Promise.all(
        (formData.imageFiles || []).map(async (file) => {
          // Compress image first
          const { blob, type } = await compressImage(file)

          // Convert compressed blob to base64
          return new Promise<{ name: string; type: string; data: string }>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
              resolve({
                name: file.name,
                type: type, // Use the compressed blob's type
                data: reader.result as string,
              })
            }
            reader.onerror = reject
            reader.readAsDataURL(blob)
          })
        })
      )

      // Prepare property data
      const propertyData = {
        property_type: formData.property_type,
        total_price: formData.total_price || 0,
        total_sqft: formData.total_sqft || 0,
        price_type: formData.price_type,
        city: formData.city,
        locality: formData.locality,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        furnishing_status: formData.furnishing_status,
        description: formData.description,
        amenities: formData.amenities,
        amenities_price: formData.amenities_price,
      }

      // Update listing via server action (supports both online and offline modes)
      const result = await updateListing(listingId, propertyData, newImageFilesData, existingImageUrls)

      if (!result.success) {
        throw new Error(result.error || 'Failed to update listing')
      }

      // Reset form
      resetForm()

      // Redirect to listing detail page
      router.push(`/property/${listingId}?updated=true`)
    } catch (err) {
      console.error('Error updating listing:', err)
      setError(err instanceof Error ? err.message : 'Failed to update listing')
      setSubmitting(false)
    }
  }

  const totalImages = existingImageUrls.length + (formData.imageFiles?.length || 0)

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Review Your Changes</h2>
            <p className="text-gray-900">
              Please review all information before updating your property listing
            </p>
          </div>

          {/* Basic Details */}
          <div className="border border-gray-200 rounded-xl p-5">
            <h3 className="font-bold text-gray-900 mb-3">Basic Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-900">Property Type</div>
                <div className="font-bold text-gray-900">{formData.property_type}</div>
              </div>
              <div>
                <div className="text-gray-900">Price Type</div>
                <div className="font-bold text-gray-900">{formData.price_type}</div>
              </div>
              <div>
                <div className="text-gray-900">Total Price</div>
                <div className="font-bold text-gray-900">
                  ₹{(formData.total_price || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div className="text-gray-900">Area</div>
                <div className="font-bold text-gray-900">
                  {(formData.total_sqft || 0).toLocaleString('en-IN')} sq.ft
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-900">Price per sq.ft</div>
                <div className="text-lg font-black text-green-600">
                  ₹
                  {Math.round((formData.total_price || 0) / (formData.total_sqft || 1)).toLocaleString(
                    'en-IN'
                  )}
                  /sq.ft
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="border border-gray-200 rounded-xl p-5">
            <h3 className="font-bold text-gray-900 mb-3">Location</h3>
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-gray-900">City</div>
                <div className="font-bold text-gray-900">{formData.city}</div>
              </div>
              <div>
                <div className="text-gray-900">Locality</div>
                <div className="font-bold text-gray-900">{formData.locality}</div>
              </div>
              {formData.address && (
                <div>
                  <div className="text-gray-900">Address</div>
                  <div className="font-bold text-gray-900">{formData.address}</div>
                </div>
              )}
            </div>
          </div>

          {/* Property Details */}
          {['APARTMENT', 'VILLA', 'HOUSE'].includes(formData.property_type || '') && (
            <div className="border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-3">Property Details</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-900">Bedrooms</div>
                  <div className="font-bold text-gray-900">{formData.bedrooms} BHK</div>
                </div>
                <div>
                  <div className="text-gray-900">Bathrooms</div>
                  <div className="font-bold text-gray-900">{formData.bathrooms}</div>
                </div>
                <div>
                  <div className="text-gray-900">Furnishing</div>
                  <div className="font-bold text-gray-900">
                    {formData.furnishing_status?.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {formData.description && (
            <div className="border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-3">Description</h3>
              <p className="text-sm text-gray-900 whitespace-pre-line">
                {formData.description}
              </p>
            </div>
          )}

          {/* Amenities */}
          {formData.amenities && formData.amenities.length > 0 && (
            <div className="border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-3">
                Amenities ({formData.amenities.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="px-3 py-1.5 bg-blue-50 border border-blue-300 rounded-full text-sm text-gray-900 font-medium"
                  >
                    {amenity}
                  </div>
                ))}
              </div>
              {formData.amenities_price && formData.amenities_price > 0 && (
                <div className="mt-3 text-sm text-gray-900 font-medium">
                  Amenities Price: ₹{formData.amenities_price.toLocaleString('en-IN')}
                </div>
              )}
            </div>
          )}

          {/* Photos */}
          {totalImages > 0 && (
            <div className="border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-3">Photos ({totalImages})</h3>
              <div className="grid grid-cols-4 gap-3">
                {/* Existing Images */}
                {existingImageUrls.slice(0, 4 - (formData.imageFiles?.length || 0)).map((url, index) => (
                  <div key={`existing-${index}`} className="aspect-square rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={url}
                      alt={`Property ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {/* New Images */}
                {formData.imagePreviewUrls
                  ?.slice(0, 4 - existingImageUrls.length)
                  .map((url, index) => (
                    <div
                      key={`new-${index}`}
                      className="aspect-square rounded-xl overflow-hidden border-2 border-green-400 relative"
                    >
                      <img
                        src={url}
                        alt={`New Property ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 right-1 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        NEW
                      </div>
                    </div>
                  ))}
              </div>
              {totalImages > 4 && (
                <p className="text-sm text-gray-900 font-medium mt-2">
                  +{totalImages - 4} more images
                </p>
              )}
              {(formData.imageFiles?.length || 0) > 0 && (
                <p className="text-sm text-green-700 font-medium mt-2">
                  ✓ {formData.imageFiles?.length} new image(s) will be added
                </p>
              )}
            </div>
          )}

          {/* Agreement Status */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="text-2xl">✓</div>
              <div className="flex-1">
                <div className="font-bold text-green-800">Commission Agreement Accepted</div>
                <div className="text-sm text-green-700 mt-1">
                  You agreed to the 2% commission on sale on{' '}
                  {formData.agreement_accepted_at &&
                    new Date(formData.agreement_accepted_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✕</div>
                <div className="flex-1">
                  <div className="font-bold text-red-800">Update Failed</div>
                  <div className="text-sm text-red-700 mt-1">{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* What Happens Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="font-bold text-blue-900 mb-2">What Happens Next?</div>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Your listing will be updated immediately</li>
              <li>Changes will be visible to buyers right away</li>
              <li>You can continue to edit your listing anytime</li>
              <li>Track views and unlocks from your dashboard</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex justify-between gap-4">
        <button
          type="button"
          onClick={previousStep}
          disabled={submitting}
          className="flex items-center gap-2 px-8 py-3 border-2 border-gray-300 text-gray-900 rounded-full font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed min-w-64"
        >
          {submitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating...
            </>
          ) : (
            <>
              Update Listing
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
