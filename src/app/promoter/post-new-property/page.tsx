/**
 * Post New Property Page - 8-Step Form
 *
 * Steps:
 * 1. Basic Details (property type, price, sqft, price type)
 * 2. Location (city, locality, address, coordinates)
 * 3. Property Details (bedrooms, bathrooms, furnishing, description)
 * 4. Amenities (amenities selection, amenities price)
 * 5. Photos (image upload with preview)
 * 6. Availability (time slots for site visits - coming soon)
 * 7. Agreement (commission agreement acceptance)
 * 8. Review & Submit (summary and final submission)
 */

'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { PostPropertyFormSteps } from '@/components/promoter/PostPropertyForm/PostPropertyFormSteps'

export default function PostNewPropertyPage() {
  return (
    <ProtectedRoute requiredRole="PROMOTER">
      <div className="min-h-screen bg-gray-50">
        <PostPropertyFormSteps />
      </div>
    </ProtectedRoute>
  )
}
