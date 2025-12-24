/**
 * Step 8: Review & Submit
 * - Display summary of all entered data
 * - Upload images to Supabase Storage
 * - Create listing via API
 * - Show success/error state
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePostPropertyStore } from '@/stores/postPropertyStore'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'

export function Step8Review() {
  const router = useRouter()
  const { user } = useAuth()
  const { formData, previousStep, resetForm } = usePostPropertyStore()
  const supabase = createClient()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError('You must be logged in to submit a listing')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      // Upload images to Supabase Storage
      const imageUrls: string[] = []

      if (formData.imageFiles && formData.imageFiles.length > 0) {
        for (let i = 0; i < formData.imageFiles.length; i++) {
          const file = formData.imageFiles[i]
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}-${i}.${fileExt}`
          const filePath = `${user.id}/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
            })

          if (uploadError) {
            throw new Error(`Failed to upload image ${i + 1}: ${uploadError.message}`)
          }

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from('property-images').getPublicUrl(filePath)

          imageUrls.push(publicUrl)
        }
      }

      // Create listing
      const { data, error: insertError } = await supabase.from('listings').insert({
        promoter_id: user.id,
        property_type: formData.property_type,
        total_price: formData.total_price,
        total_sqft: formData.total_sqft,
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
        image_urls: imageUrls,
        status: 'PENDING_VERIFICATION',
      }).select().single()

      if (insertError) throw insertError

      // Reset form
      resetForm()

      // Redirect to success page or my listings
      router.push(`/promoter/listings?success=true&id=${data.id}`)
    } catch (err) {
      console.error('Error submitting listing:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit listing')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Review Your Listing</h2>
              <p className="text-gray-600 mt-2">
                Please review all information before submitting your property listing
              </p>
            </div>

            {/* Basic Details */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Basic Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Property Type</div>
                  <div className="font-medium">{formData.property_type}</div>
                </div>
                <div>
                  <div className="text-gray-600">Price Type</div>
                  <div className="font-medium">{formData.price_type}</div>
                </div>
                <div>
                  <div className="text-gray-600">Total Price</div>
                  <div className="font-medium">
                    ₹{formData.total_price.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Area</div>
                  <div className="font-medium">
                    {formData.total_sqft.toLocaleString('en-IN')} sq.ft
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-gray-600">Price per sq.ft</div>
                  <div className="text-lg font-semibold text-green-600">
                    ₹
                    {Math.round(formData.total_price / formData.total_sqft).toLocaleString(
                      'en-IN'
                    )}
                    /sq.ft
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-gray-600">City</div>
                  <div className="font-medium">{formData.city}</div>
                </div>
                <div>
                  <div className="text-gray-600">Locality</div>
                  <div className="font-medium">{formData.locality}</div>
                </div>
                {formData.address && (
                  <div>
                    <div className="text-gray-600">Address</div>
                    <div className="font-medium">{formData.address}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Property Details */}
            {formData.property_type === 'APARTMENT' && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Property Details</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Bedrooms</div>
                    <div className="font-medium">{formData.bedrooms} BHK</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Bathrooms</div>
                    <div className="font-medium">{formData.bathrooms}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Furnishing</div>
                    <div className="font-medium">
                      {formData.furnishing_status?.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {formData.description && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {formData.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {formData.amenities && formData.amenities.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Amenities ({formData.amenities.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity) => (
                    <Badge key={amenity} variant="info">
                      {amenity}
                    </Badge>
                  ))}
                </div>
                {formData.amenities_price && formData.amenities_price > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    Amenities Price: ₹{formData.amenities_price.toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            )}

            {/* Photos */}
            {formData.imageFiles && formData.imageFiles.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Photos ({formData.imageFiles.length})
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {formData.imagePreviewUrls?.slice(0, 4).map((url, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={url}
                        alt={`Property ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                {formData.imageFiles.length > 4 && (
                  <p className="text-sm text-gray-500 mt-2">
                    +{formData.imageFiles.length - 4} more images
                  </p>
                )}
              </div>
            )}

            {/* Agreement Status */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✓</div>
                <div className="flex-1">
                  <div className="font-semibold text-green-800">Commission Agreement Accepted</div>
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
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✕</div>
                  <div className="flex-1">
                    <div className="font-semibold text-red-800">Submission Failed</div>
                    <div className="text-sm text-red-700 mt-1">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* What Happens Next */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="font-semibold text-blue-900 mb-2">What Happens Next?</div>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Your listing will be submitted for admin review</li>
                <li>Our team will verify the information within 24-48 hours</li>
                <li>You'll receive a notification once approved or if changes are needed</li>
                <li>Once approved, your listing will be visible to buyers</li>
                <li>You can track views and unlocks from your dashboard</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <Button type="button" variant="outline" onClick={previousStep} disabled={submitting}>
          ← Back
        </Button>
        <Button
          type="submit"
          size="lg"
          isLoading={submitting}
          disabled={submitting}
          className="min-w-48"
        >
          {submitting ? 'Submitting...' : 'Submit Listing for Review'}
        </Button>
      </div>
    </form>
  )
}
