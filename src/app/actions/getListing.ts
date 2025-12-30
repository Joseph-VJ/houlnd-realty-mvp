/**
 * Get Listing Server Action
 * Fetches a single listing by ID for editing
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
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
 * Get a listing by ID
 */
export async function getListing(listingId: string): Promise<{
  success: boolean
  listing?: any
  error?: string
}> {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in to view this listing',
      }
    }

    if (isOfflineMode) {
      // OFFLINE MODE: Use Prisma
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
      })

      if (!listing) {
        return {
          success: false,
          error: 'Listing not found',
        }
      }

      // Check if user owns this listing
      if (listing.promoterId !== userId) {
        return {
          success: false,
          error: 'You do not have permission to edit this listing',
        }
      }

      // Parse JSON fields
      const amenities = listing.amenitiesJson ? JSON.parse(listing.amenitiesJson) : null
      const imageUrls = listing.imageUrls ? JSON.parse(listing.imageUrls) : []

      return {
        success: true,
        listing: {
          ...listing,
          amenities,
          image_urls: imageUrls,
        },
      }
    }

    // ONLINE MODE: Use Supabase
    const supabase = await createClient()

    const { data: listing, error: fetchError } = await (supabase
      .from('listings') as any)
      .select('*')
      .eq('id', listingId)
      .single()

    if (fetchError || !listing) {
      return {
        success: false,
        error: 'Listing not found',
      }
    }

    // Check if user owns this listing
    if (listing.promoter_id !== userId) {
      return {
        success: false,
        error: 'You do not have permission to edit this listing',
      }
    }

    return {
      success: true,
      listing,
    }
  } catch (error) {
    console.error('Error fetching listing:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch listing',
    }
  }
}
