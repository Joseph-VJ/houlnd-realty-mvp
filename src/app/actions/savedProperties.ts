/**
 * Saved Properties Server Actions
 *
 * Supports both online (Supabase) and offline (Prisma) modes.
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import * as jose from 'jose'

const isOfflineMode = process.env.USE_OFFLINE === 'true'

/**
 * Get current user ID from session
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
 * Check if a listing is saved by the current user
 */
export async function checkIfSaved(
  listingId: string
): Promise<{ success: boolean; isSaved?: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return {
        success: true,
        isSaved: false,
      }
    }

    if (isOfflineMode) {
      // OFFLINE MODE: Use Prisma
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        const saved = await prisma.savedProperty.findFirst({
          where: {
            userId,
            listingId,
          },
        })

        await prisma.$disconnect()

        return {
          success: true,
          isSaved: !!saved,
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    // ONLINE MODE: Use Supabase
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('saved_properties')
      .select('id')
      .eq('user_id', userId)
      .eq('listing_id', listingId)
      .single()

    if (error && error.code !== 'PGRST116') {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      isSaved: !!data,
    }
  } catch (error) {
    console.error('Check if saved error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check saved status',
    }
  }
}

/**
 * Save a listing
 */
export async function saveListing(
  listingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in to save properties',
      }
    }

    if (isOfflineMode) {
      // OFFLINE MODE: Use Prisma
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        // Check if already saved
        const existing = await prisma.savedProperty.findFirst({
          where: {
            userId,
            listingId,
          },
        })

        if (existing) {
          await prisma.$disconnect()
          return { success: true } // Already saved
        }

        // Create saved property
        await prisma.savedProperty.create({
          data: {
            userId,
            listingId,
          },
        })

        await prisma.$disconnect()

        return { success: true }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    // ONLINE MODE: Use Supabase
    const supabase = await createClient()
    const { error } = await supabase.from('saved_properties').insert({
      user_id: userId,
      listing_id: listingId,
    } as any)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Save listing error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save listing',
    }
  }
}

/**
 * Get saved listing IDs for the current user (for quick lookup)
 */
export async function getSavedListingIds(): Promise<{
  success: boolean
  data?: string[]
  error?: string
}> {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return {
        success: true,
        data: [],  // Not logged in, return empty array
      }
    }

    if (isOfflineMode) {
      // OFFLINE MODE: Use Prisma
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        const savedProperties = await prisma.savedProperty.findMany({
          where: { userId },
          select: { listingId: true },
        })

        await prisma.$disconnect()

        return {
          success: true,
          data: savedProperties.map((sp: any) => sp.listingId),
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    // ONLINE MODE: Use Supabase
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('saved_properties')
      .select('listing_id')
      .eq('user_id', userId)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      data: data?.map((sp: any) => sp.listing_id) || [],
    }
  } catch (error) {
    console.error('Get saved listing IDs error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch saved listing IDs',
    }
  }
}

/**
 * Get all saved properties for the current user
 */
export async function getSavedProperties(): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in to view saved properties',
      }
    }

    if (isOfflineMode) {
      // OFFLINE MODE: Use Prisma
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        const savedProperties = await prisma.savedProperty.findMany({
          where: {
            userId,
          },
          include: {
            listing: {
              include: {
                promoter: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phoneE164: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        await prisma.$disconnect()

        // Transform to match expected format
        const transformedData = savedProperties.map((saved: any) => ({
          id: saved.id,
          user_id: saved.userId,
          listing_id: saved.listingId,
          created_at: saved.createdAt.toISOString(),
          listing: {
            id: saved.listing.id,
            property_type: saved.listing.propertyType,
            city: saved.listing.city || '',
            locality: saved.listing.locality,
            total_price: saved.listing.totalPrice,
            total_sqft: saved.listing.totalSqft,
            price_per_sqft: saved.listing.pricePerSqft,
            price_type: saved.listing.priceType,
            image_urls: JSON.parse(saved.listing.imageUrls || '[]'),
            bedrooms: saved.listing.bedrooms,
            bathrooms: saved.listing.bathrooms,
            title: saved.listing.title,
            status: saved.listing.status,
            created_at: saved.listing.createdAt.toISOString(),
            promoter_id: saved.listing.promoterId,
            promoter: saved.listing.promoter,
          },
        }))

        return {
          success: true,
          data: transformedData,
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    // ONLINE MODE: Use Supabase
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('saved_properties')
      .select(
        `
        *,
        listing:listings(
          *,
          promoter:users!promoter_id(id, full_name, email, phone_e164)
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      data: data || [],
    }
  } catch (error) {
    console.error('Get saved properties error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch saved properties',
    }
  }
}

/**
 * Unsave a listing
 */
export async function unsaveListing(
  listingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in',
      }
    }

    if (isOfflineMode) {
      // OFFLINE MODE: Use Prisma
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        await prisma.savedProperty.deleteMany({
          where: {
            userId,
            listingId,
          },
        })

        await prisma.$disconnect()

        return { success: true }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    // ONLINE MODE: Use Supabase
    const supabase = await createClient()
    const { error } = await supabase
      .from('saved_properties')
      .delete()
      .eq('user_id', userId)
      .eq('listing_id', listingId)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Unsave listing error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to unsave listing',
    }
  }
}
