/**
 * Admin Server Actions
 *
 * Administrative operations for listing approval/rejection.
 * Supports both online (Supabase) and offline (Prisma) modes.
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import * as jose from 'jose'

const isOfflineMode = process.env.USE_OFFLINE === 'true'

/**
 * Get current user ID and verify admin role
 */
async function getCurrentAdminUser(): Promise<{ userId: string; error?: string } | { userId?: string; error: string }> {
  if (isOfflineMode) {
    const cookieStore = await cookies()
    const token = cookieStore.get('offline_token')?.value
    if (!token) return { error: 'Not authenticated' }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'offline-test-secret-key')
      const { payload } = await jose.jwtVerify(token, secret)
      const userId = payload.sub as string

      // Verify user is admin
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true }
        })

        await prisma.$disconnect()

        if (!user || user.role !== 'ADMIN') {
          return { error: 'Unauthorized: Admin access required' }
        }

        return { userId }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    } catch {
      return { error: 'Invalid token' }
    }
  }

  // ONLINE MODE: Use Supabase
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify admin role
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || (profile as any).role !== 'ADMIN') {
    return { error: 'Unauthorized: Admin access required' }
  }

  return { userId: user.id }
}

/**
 * Approve a pending listing (set status to LIVE)
 */
export async function approveListing(
  listingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminAuth = await getCurrentAdminUser()

    if ('error' in adminAuth && adminAuth.error) {
      return {
        success: false,
        error: adminAuth.error
      }
    }

    const adminId = adminAuth.userId!

    if (isOfflineMode) {
      // OFFLINE MODE: Use Prisma
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        // Verify listing exists and is pending
        const listing = await prisma.listing.findUnique({
          where: { id: listingId },
          select: { status: true }
        })

        if (!listing) {
          await prisma.$disconnect()
          return {
            success: false,
            error: 'Listing not found'
          }
        }

        if (listing.status !== 'PENDING_VERIFICATION') {
          await prisma.$disconnect()
          return {
            success: false,
            error: `Listing is not pending (current status: ${listing.status})`
          }
        }

        // Approve listing
        await prisma.listing.update({
          where: { id: listingId },
          data: {
            status: 'LIVE',
            reviewedAt: new Date(),
            reviewedBy: adminId,
            rejectionReason: null // Clear any previous rejection reason
          }
        })

        await prisma.$disconnect()

        return {
          success: true
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    // ONLINE MODE: Use Supabase RPC
    const supabase = await createClient()
    const { error } = await supabase.rpc('approve_listing', {
      p_listing_id: listingId,
      p_admin_id: adminId
    } as any)

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true
    }
  } catch (error) {
    console.error('Approve listing error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve listing'
    }
  }
}

/**
 * Reject a pending listing with reason
 */
export async function rejectListing(
  listingId: string,
  rejectionReason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminAuth = await getCurrentAdminUser()

    if ('error' in adminAuth && adminAuth.error) {
      return {
        success: false,
        error: adminAuth.error
      }
    }

    const adminId = adminAuth.userId!

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return {
        success: false,
        error: 'Rejection reason is required'
      }
    }

    if (isOfflineMode) {
      // OFFLINE MODE: Use Prisma
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        // Verify listing exists and is pending
        const listing = await prisma.listing.findUnique({
          where: { id: listingId },
          select: { status: true }
        })

        if (!listing) {
          await prisma.$disconnect()
          return {
            success: false,
            error: 'Listing not found'
          }
        }

        if (listing.status !== 'PENDING_VERIFICATION') {
          await prisma.$disconnect()
          return {
            success: false,
            error: `Listing is not pending (current status: ${listing.status})`
          }
        }

        // Reject listing
        await prisma.listing.update({
          where: { id: listingId },
          data: {
            status: 'REJECTED',
            reviewedAt: new Date(),
            reviewedBy: adminId,
            rejectionReason: rejectionReason.trim()
          }
        })

        await prisma.$disconnect()

        return {
          success: true
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    // ONLINE MODE: Use Supabase RPC
    const supabase = await createClient()
    const { error } = await supabase.rpc('reject_listing', {
      p_listing_id: listingId,
      p_admin_id: adminId,
      p_rejection_reason: rejectionReason.trim()
    } as any)

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true
    }
  } catch (error) {
    console.error('Reject listing error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reject listing'
    }
  }
}

/**
 * Get all pending listings (admin only)
 */
export async function getPendingListings(): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    const adminAuth = await getCurrentAdminUser()

    if ('error' in adminAuth && adminAuth.error) {
      return {
        success: false,
        error: adminAuth.error
      }
    }

    if (isOfflineMode) {
      // OFFLINE MODE: Use Prisma
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        const listings = await prisma.listing.findMany({
          where: {
            status: 'PENDING_VERIFICATION'
          },
          include: {
            promoter: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phoneE164: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        })

        await prisma.$disconnect()

        // Transform to match expected format
        const transformedListings = listings.map((listing: any) => ({
          id: listing.id,
          property_type: listing.propertyType,
          city: listing.city || '',
          locality: listing.locality,
          total_price: listing.totalPrice,
          total_sqft: listing.totalSqft,
          price_per_sqft: listing.pricePerSqft,
          price_type: listing.priceType,
          image_urls: JSON.parse(listing.imageUrls || '[]'),
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          description: listing.description,
          title: listing.title,
          status: listing.status,
          created_at: listing.createdAt.toISOString(),
          promoter_id: listing.promoterId,
          promoter: {
            full_name: listing.promoter.fullName,
            email: listing.promoter.email,
            phone_e164: listing.promoter.phoneE164
          }
        }))

        return {
          success: true,
          data: transformedListings
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    // ONLINE MODE: Use Supabase
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        promoter:users!promoter_id (
          full_name,
          email,
          phone_e164
        )
      `)
      .eq('status', 'PENDING_VERIFICATION')
      .order('created_at', { ascending: false })

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      data: data || []
    }
  } catch (error) {
    console.error('Get pending listings error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch pending listings'
    }
  }
}

/**
 * Get current user ID from session (for promoter)
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
 * Get recent unlocks for a promoter's listings
 */
export async function getPromoterRecentUnlocks(): Promise<{
  success: boolean
  data?: Array<{
    id: string
    created_at: string
    customer_name: string
    customer_phone: string
    listing_title: string
    listing_id: string
  }>
  error?: string
}> {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return {
        success: false,
        error: 'Not authenticated'
      }
    }

    if (isOfflineMode) {
      // OFFLINE MODE: Use Prisma
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        // Get promoter's listings first
        const listings = await prisma.listing.findMany({
          where: { promoterId: userId },
          select: { id: true, propertyType: true, city: true }
        })

        const listingIds = listings.map((l: { id: string }) => l.id)

        if (listingIds.length === 0) {
          await prisma.$disconnect()
          return {
            success: true,
            data: []
          }
        }

        // Get recent unlocks for those listings
        const unlocks = await prisma.unlock.findMany({
          where: {
            listingId: {
              in: listingIds
            }
          },
          include: {
            user: {
              select: {
                fullName: true,
                phoneE164: true
              }
            },
            listing: {
              select: {
                id: true,
                propertyType: true,
                city: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        })

        await prisma.$disconnect()

        // Transform data
        const formattedUnlocks = unlocks.map((unlock: any) => ({
          id: unlock.id,
          created_at: unlock.createdAt.toISOString(),
          customer_name: unlock.user.fullName || 'Unknown',
          customer_phone: unlock.user.phoneE164 || '',
          listing_title: `${unlock.listing.propertyType} in ${unlock.listing.city || 'Unknown'}`,
          listing_id: unlock.listing.id
        }))

        return {
          success: true,
          data: formattedUnlocks
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    // ONLINE MODE: Use Supabase
    const supabase = await createClient()

    // Get promoter's listings first
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id, property_type, city')
      .eq('promoter_id', userId)

    if (listingsError) {
      return {
        success: false,
        error: listingsError.message
      }
    }

    const listingIds = (listings || []).map((l: { id: string }) => l.id)

    if (listingIds.length === 0) {
      return {
        success: true,
        data: []
      }
    }

    // Get recent unlocks
    const { data: unlocks, error: unlocksError } = await supabase
      .from('unlocks')
      .select(`
        id,
        created_at,
        users:user_id (full_name, phone_e164),
        listings:listing_id (id, property_type, city)
      `)
      .in('listing_id', listingIds)
      .order('created_at', { ascending: false })
      .limit(5)

    if (unlocksError) {
      return {
        success: false,
        error: unlocksError.message
      }
    }

    // Transform data
    const formattedUnlocks = (unlocks || []).map((unlock: any) => ({
      id: unlock.id,
      created_at: unlock.created_at,
      customer_name: unlock.users?.full_name || 'Unknown',
      customer_phone: unlock.users?.phone_e164 || '',
      listing_title: `${unlock.listings?.property_type} in ${unlock.listings?.city || 'Unknown'}`,
      listing_id: unlock.listings?.id || ''
    }))

    return {
      success: true,
      data: formattedUnlocks
    }
  } catch (error) {
    console.error('Get promoter recent unlocks error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch recent unlocks'
    }
  }
}

/**
 * Get promoter's own listings (supports filtering by status)
 */
export async function getPromoterListings(statusFilter?: string): Promise<{
  success: boolean
  data?: Array<{
    id: string
    property_type: string
    city: string
    total_price: number
    total_sqft: number
    price_per_sqft: number
    status: string
    image_urls: string[]
    bedrooms: number | null
    rejection_reason: string | null
    view_count: number
    unlock_count: number
    created_at: string
  }>
  error?: string
}> {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return {
        success: false,
        error: 'Not authenticated'
      }
    }

    if (isOfflineMode) {
      // OFFLINE MODE: Use Prisma
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        const where: any = { promoterId: userId }

        // Filter by status if provided
        if (statusFilter && statusFilter !== 'ALL') {
          where.status = statusFilter
        }

        const listings = await prisma.listing.findMany({
          where,
          orderBy: { createdAt: 'desc' }
        })

        await prisma.$disconnect()

        // Transform to match expected format
        const transformedListings = listings.map((listing: any) => ({
          id: listing.id,
          property_type: listing.propertyType,
          city: listing.city || '',
          total_price: listing.totalPrice,
          total_sqft: listing.totalSqft,
          price_per_sqft: listing.pricePerSqft,
          status: listing.status,
          image_urls: JSON.parse(listing.imageUrls || '[]'),
          bedrooms: listing.bedrooms,
          rejection_reason: listing.rejectionReason,
          view_count: listing.viewCount || 0,
          unlock_count: listing.unlockCount || 0,
          created_at: listing.createdAt.toISOString()
        }))

        return {
          success: true,
          data: transformedListings
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    // ONLINE MODE: Use Supabase
    const supabase = await createClient()

    let query = supabase
      .from('listings')
      .select('*')
      .eq('promoter_id', userId)
      .order('created_at', { ascending: false })

    // Filter by status if provided
    if (statusFilter && statusFilter !== 'ALL') {
      query = query.eq('status', statusFilter)
    }

    const { data, error } = await query

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      data: data || []
    }
  } catch (error) {
    console.error('Get promoter listings error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch listings'
    }
  }
}
