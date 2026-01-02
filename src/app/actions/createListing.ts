/**
 * Create Listing Server Action
 *
 * Supports both online (Supabase) and offline (Prisma) modes.
 * Handles property submission with image uploads.
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import * as jose from 'jose'
import type { Database } from '@/types/database.types'

interface PropertyFormData {
  property_type: string
  total_price: number
  total_sqft: number
  price_type: string
  city: string
  locality: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  bedrooms: number | null
  bathrooms: number | null
  furnishing_status: string | null
  description: string | null
  amenities: string[] | null
  amenities_price: number | null
}

const isOfflineMode = process.env.USE_OFFLINE === 'true'

/**
 * Upload images to storage (Supabase or local mock)
 */
async function uploadImages(
  imageData: Array<{ name: string; type: string; data: string }>,
  userId: string
): Promise<string[]> {
  if (isOfflineMode) {
    // OFFLINE MODE: Return base64 data URLs (stores images directly in DB)
    console.log(`[OFFLINE MODE] Storing ${imageData.length} images as base64 data URLs`)
    return imageData.map((file) => file.data)
  }

  // ONLINE MODE: Upload to Supabase Storage
  const supabase = await createClient()
  const imageUrls: string[] = []

  for (let i = 0; i < imageData.length; i++) {
    const { name, type, data } = imageData[i]

    // Convert base64 to Buffer
    const base64Data = data.split(',')[1] // Remove "data:image/xxx;base64," prefix
    
    if (!base64Data) {
      throw new Error(`Invalid image data format for image ${i + 1}`)
    }
    
    const buffer = Buffer.from(base64Data, 'base64')

    // Use appropriate file extension based on actual content type
    const fileExt = type === 'image/png' ? 'png' : 'jpg'
    const fileName = `${Date.now()}-${i}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, buffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: type,
        })

      if (uploadError) {
        console.error(`Upload error for image ${i + 1}:`, uploadError)
        throw new Error(`Failed to upload image ${i + 1}: ${uploadError.message}`)
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('property-images').getPublicUrl(filePath)

      imageUrls.push(publicUrl)
    } catch (uploadError) {
      // If storage bucket doesn't exist or other error, fall back to base64 in online mode
      console.warn(`Storage upload failed for image ${i + 1}, using base64 fallback:`, uploadError)
      imageUrls.push(data) // Use base64 data URL as fallback
    }
  }

  return imageUrls
}

/**
 * Get current user ID from session
 */
async function getCurrentUserId(): Promise<string | null> {
  if (isOfflineMode) {
    // OFFLINE MODE: Get user from JWT token
    const cookieStore = await cookies()
    const token = cookieStore.get('offline_token')?.value

    if (!token) return null

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'offline-test-secret-key')
      const { payload } = await jose.jwtVerify(token, secret)
      return payload.sub as string
    } catch {
      return null
    }
  }

  // ONLINE MODE: Get user from Supabase session
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user?.id || null
}

/**
 * Create a new property listing
 */
export async function createListing(
  formData: PropertyFormData,
  imageData: Array<{ name: string; type: string; data: string }>
): Promise<{ success: boolean; listingId?: string; error?: string }> {
  try {
    // Validate input
    if (!formData || !imageData || imageData.length === 0) {
      return {
        success: false,
        error: 'Missing required data. Please ensure all fields are filled and at least one image is uploaded.',
      }
    }

    if (imageData.length < 3) {
      return {
        success: false,
        error: 'Please upload at least 3 images of your property.',
      }
    }

    // Get current user
    const userId = await getCurrentUserId()

    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in to submit a listing. Please log in and try again.',
      }
    }

    // Upload images with better error handling
    let imageUrls: string[]
    try {
      imageUrls = await uploadImages(imageData, userId)
      console.log(`Successfully processed ${imageUrls.length} images`)
    } catch (uploadError) {
      console.error('Image upload error:', uploadError)
      return {
        success: false,
        error: uploadError instanceof Error 
          ? `Image upload failed: ${uploadError.message}` 
          : 'Failed to upload images. Please try again with smaller image files.',
      }
    }

    if (isOfflineMode) {
      // OFFLINE MODE: Use Prisma
      const listing = await prisma.listing.create({
        data: {
          promoterId: userId,
          propertyType: formData.property_type,
          totalPrice: formData.total_price,
          totalSqft: formData.total_sqft,
          priceType: formData.price_type,
          city: formData.city,
          locality: formData.locality,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          furnishing: formData.furnishing_status,
          description: formData.description,
          amenitiesJson: formData.amenities ? JSON.stringify(formData.amenities) : null,
          amenitiesPrice: formData.amenities_price,
          imageUrls: JSON.stringify(imageUrls),
          status: 'PENDING_VERIFICATION',
          pricePerSqft: formData.total_price / formData.total_sqft,
        },
      })

      // Create agreement acceptance record (2% commission)
      await prisma.agreementAcceptance.create({
        data: {
          listingId: listing.id,
          acceptedAt: new Date(),
        },
      })

      return {
        success: true,
        listingId: listing.id,
      }
    }

    // ONLINE MODE: Use Supabase
    const supabase = await createClient()

    const { data, error: insertError } = await supabase
      .from('listings')
      .insert({
        promoter_id: userId,
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
      } as any)
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Create agreement acceptance record (2% commission)
    const agreementData: Database['public']['Tables']['listing_agreement_acceptances']['Insert'] = {
      listing_id: (data as any)?.id,
      accepted_at: new Date().toISOString(),
      agreement_version: '1.0',
    }

    const { error: agreementError } = await (supabase
      .from('listing_agreement_acceptances') as any)
      .insert(agreementData)

    if (agreementError) {
      throw agreementError
    }

    return {
      success: true,
      listingId: (data as any)?.id,
    }
  } catch (error) {
    console.error('Error creating listing:', error)
    
    // Provide user-friendly error messages
    if (error instanceof Error) {
      if (error.message.includes('Bucket not found')) {
        return {
          success: false,
          error: 'Image storage is not configured. Your listing has been saved but images could not be uploaded. Please contact support.',
        }
      }
      if (error.message.includes('Network')) {
        return {
          success: false,
          error: 'Network error. Please check your internet connection and try again.',
        }
      }
      return {
        success: false,
        error: `Submission failed: ${error.message}`,
      }
    }
    
    return {
      success: false,
      error: 'An unexpected error occurred while submitting your listing. Please try again.',
    }
  }
}
