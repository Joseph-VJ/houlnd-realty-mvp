/**
 * Update Listing Server Action
 * Updates an existing property listing
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
 * Upload new images to storage
 */
async function uploadImages(
  imageData: Array<{ name: string; type: string; data: string }>,
  userId: string
): Promise<string[]> {
  if (isOfflineMode) {
    // OFFLINE MODE: Return base64 data URLs (stores images directly in DB)
    return imageData.map((file) => file.data)
  }

  const supabase = await createClient()
  const imageUrls: string[] = []

  for (let i = 0; i < imageData.length; i++) {
    const { name, type, data } = imageData[i]

    const base64Data = data.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')

    const fileExt = type === 'image/png' ? 'png' : 'jpg'
    const fileName = `${Date.now()}-${i}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: type,
      })

    if (uploadError) {
      throw new Error(`Failed to upload image ${i + 1}: ${uploadError.message}`)
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('property-images').getPublicUrl(filePath)

    imageUrls.push(publicUrl)
  }

  return imageUrls
}

/**
 * Get current user ID
 */
async function getCurrentUserId(): Promise<string | null> {
  if (isOfflineMode) {
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

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user?.id || null
}

/**
 * Update an existing listing
 */
export async function updateListing(
  listingId: string,
  formData: PropertyFormData,
  newImageData: Array<{ name: string; type: string; data: string }>,
  existingImageUrls: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in to update a listing',
      }
    }

    // Upload new images
    const newImageUrls = newImageData.length > 0 ? await uploadImages(newImageData, userId) : []

    // Combine existing and new image URLs
    const allImageUrls = [...existingImageUrls, ...newImageUrls]

    if (isOfflineMode) {
      // OFFLINE MODE: Use Prisma
      // Check ownership
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
      })

      if (!listing || listing.promoterId !== userId) {
        return {
          success: false,
          error: 'Listing not found or you do not have permission to edit it',
        }
      }

      await prisma.listing.update({
        where: { id: listingId },
        data: {
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
          imageUrls: JSON.stringify(allImageUrls),
          pricePerSqft: formData.total_price / formData.total_sqft,
        },
      })

      return {
        success: true,
      }
    }

    // ONLINE MODE: Use Supabase
    const supabase = await createClient()

    // Check ownership
    const { data: listing, error: fetchError } = await (supabase
      .from('listings') as any)
      .select('promoter_id')
      .eq('id', listingId)
      .single()

    if (fetchError || !listing || listing.promoter_id !== userId) {
      return {
        success: false,
        error: 'Listing not found or you do not have permission to edit it',
      }
    }

    const { error: updateError } = await (supabase
      .from('listings') as any)
      .update({
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
        image_urls: allImageUrls,
      })
      .eq('id', listingId)

    if (updateError) {
      throw updateError
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error updating listing:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update listing',
    }
  }
}
