
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
 * Get all pending listings for admin approval
 */
export async function getPendingListings() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return { success: false, error: 'Unauthorized' }

    if (isOfflineMode) {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        const listings = await prisma.listing.findMany({
          where: { status: 'PENDING_VERIFICATION' },
          include: {
            promoter: {
              select: {
                fullName: true,
                email: true,
                phoneE164: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })

        await prisma.$disconnect()

        return {
          success: true,
          data: listings.map((l: any) => ({
            id: l.id,
            property_type: l.propertyType,
            city: l.city || '',
            locality: l.locality,
            total_price: l.totalPrice,
            total_sqft: l.totalSqft,
            price_per_sqft: l.pricePerSqft,
            price_type: l.priceType,
            image_urls: JSON.parse(l.imageUrls || '[]'),
            bedrooms: l.bedrooms,
            bathrooms: l.bathrooms,
            description: l.description,
            created_at: l.createdAt.toISOString(),
            promoter_id: l.promoterId,
            promoter: {
              full_name: l.promoter.fullName,
              email: l.promoter.email,
              phone_e164: l.promoter.phoneE164
            }
          }))
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

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

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error in getPendingListings:', error)
    return { success: false, error: 'Failed to fetch pending listings' }
  }
}

/**
 * Approve a listing
 */
export async function approveListing(listingId: string) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return { success: false, error: 'Unauthorized' }

    if (isOfflineMode) {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        await prisma.listing.update({
          where: { id: listingId },
          data: { 
            status: 'LIVE',
            reviewedAt: new Date(),
            reviewedBy: userId
          }
        })

        // Create activity log
        await prisma.activityLog.create({
          data: {
            userId,
            action: 'APPROVE_LISTING',
            entityType: 'LISTING',
            entityId: listingId,
            details: `Admin approved listing ${listingId}`
          }
        })

        await prisma.$disconnect()
        return { success: true }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    const supabase = await createClient()
    const { error } = await supabase.rpc('approve_listing', {
      p_listing_id: listingId,
      p_admin_id: userId
    } as any)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error in approveListing:', error)
    return { success: false, error: 'Failed to approve listing' }
  }
}

/**
 * Reject a listing
 */
export async function rejectListing(listingId: string, reason: string) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return { success: false, error: 'Unauthorized' }

    if (isOfflineMode) {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        await prisma.listing.update({
          where: { id: listingId },
          data: { 
            status: 'REJECTED',
            rejectionReason: reason,
            reviewedAt: new Date(),
            reviewedBy: userId
          }
        })

        // Create activity log
        await prisma.activityLog.create({
          data: {
            userId,
            action: 'REJECT_LISTING',
            entityType: 'LISTING',
            entityId: listingId,
            details: `Admin rejected listing ${listingId} for reason: ${reason}`
          }
        })

        await prisma.$disconnect()
        return { success: true }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    const supabase = await createClient()
    const { error } = await supabase.rpc('reject_listing', {
      p_listing_id: listingId,
      p_admin_id: userId,
      p_reason: reason
    } as any)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error in rejectListing:', error)
    return { success: false, error: 'Failed to reject listing' }
  }
}

/**
 * Get all users for admin management
 */
export async function getUsers() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return { success: false, error: 'Unauthorized' }

    if (isOfflineMode) {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        const users = await prisma.user.findMany({
          orderBy: { createdAt: 'desc' }
        })

        await prisma.$disconnect()

        return {
          success: true,
          data: users.map((u: any) => ({
            id: u.id,
            email: u.email,
            full_name: u.fullName,
            phone_e164: u.phoneE164,
            role: u.role,
            created_at: u.createdAt.toISOString()
          }))
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error in getUsers:', error)
    return { success: false, error: 'Failed to fetch users' }
  }
}
