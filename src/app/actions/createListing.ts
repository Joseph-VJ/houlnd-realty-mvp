/**
 * Create Listing Server Action
 *
 * Supports both online (Supabase) and offline (Prisma) modes.
 * Handles property submission with image uploads.
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import * as jose from 'jose'

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
async function uploadImages(imageFiles: File[], userId: string): Promise<string[]> {
  if (isOfflineMode) {
    // OFFLINE MODE: Return mock image URLs
    return imageFiles.map((file, i) => {
      const ext = file.name.split('.').pop()
      return `/mock-uploads/${userId}/${Date.now()}-${i}.${ext}`
    })
  }

  // ONLINE MODE: Upload to Supabase Storage
  const supabase = await createClient()
  const imageUrls: string[] = []

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i]
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${i}.${fileExt}`
    const filePath = `${userId}/${fileName}`

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
  imageFiles: File[]
): Promise<{ success: boolean; listingId?: string; error?: string }> {
  try {
    // Get current user
    const userId = await getCurrentUserId()

    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in to submit a listing',
      }
    }

    // Upload images
    const imageUrls = await uploadImages(imageFiles, userId)

    if (isOfflineMode) {
      // OFFLINE MODE: Use Prisma
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
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

        await prisma.$disconnect()

        return {
          success: true,
          listingId: listing.id,
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
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
    const { error: agreementError } = await supabase
      .from('listing_agreement_acceptances')
      .insert({
        listing_id: (data as any)?.id,
        accepted_at: new Date().toISOString(),
      })

    if (agreementError) {
      throw agreementError
    }

    return {
      success: true,
      listingId: (data as any)?.id,
    }
  } catch (error) {
    console.error('Error creating listing:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit listing',
    }
  }
}
