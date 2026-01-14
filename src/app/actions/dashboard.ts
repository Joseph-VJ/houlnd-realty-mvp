/**
 * Dashboard Server Actions
 *
 * Provides dashboard statistics for all user roles.
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
 * Get dashboard stats for customer users
 */
export async function getCustomerDashboardStats(): Promise<{
  success: boolean
  data?: {
    saved_properties_count: number
    unlocked_contacts_count: number
    active_appointments_count: number
  }
  error?: string
}> {
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
        // Get saved properties count
        const savedCount = await prisma.savedProperty.count({
          where: { userId },
        })

        // Get unlocked contacts count
        const unlockedCount = await prisma.unlock.count({
          where: { userId },
        })

        // Get active appointments count (optional, if appointments table exists)
        let appointmentsCount = 0
        try {
          appointmentsCount = await prisma.appointment.count({
            where: {
              customerId: userId,
              status: {
                in: ['PENDING', 'ACCEPTED'],
              },
            },
          })
        } catch {
          // Appointment table might not exist yet
          appointmentsCount = 0
        }

        await prisma.$disconnect()

        return {
          success: true,
          data: {
            saved_properties_count: savedCount,
            unlocked_contacts_count: unlockedCount,
            active_appointments_count: appointmentsCount,
          },
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    // ONLINE MODE: Use Supabase RPC
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_user_dashboard_stats', {
      p_user_id: userId,
    } as any)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      data: data?.[0] || {
        saved_properties_count: 0,
        unlocked_contacts_count: 0,
        active_appointments_count: 0,
      },
    }
  } catch (error) {
    console.error('Get customer dashboard stats error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats',
    }
  }
}

/**
 * Get dashboard stats for promoter users
 */
export async function getPromoterDashboardStats(): Promise<{
  success: boolean
  data?: {
    total_listings: number
    live_listings: number
    pending_listings: number
    total_views: number
    total_unlocks: number
    active_appointments_count?: number
  }
  error?: string
}> {
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
        // Get total listings
        const totalListings = await prisma.listing.count({
          where: { promoterId: userId },
        })

        // Get LIVE listings
        const liveListings = await prisma.listing.count({
          where: {
            promoterId: userId,
            status: 'LIVE',
          },
        })

        // Get pending listings
        const pendingListings = await prisma.listing.count({
          where: {
            promoterId: userId,
            status: 'PENDING_VERIFICATION',
          },
        })

        // Get total unlocks for this promoter's properties
        const listings = await prisma.listing.findMany({
          where: { promoterId: userId },
          select: { id: true },
        })

        const listingIds = listings.map((l: any) => l.id)

        const totalUnlocks = await prisma.unlock.count({
          where: {
            listingId: {
              in: listingIds,
            },
          },
        })

        await prisma.$disconnect()

        return {
          success: true,
          data: {
            total_listings: totalListings,
            live_listings: liveListings,
            pending_listings: pendingListings,
            total_views: 0, // Not implemented yet
            total_unlocks: totalUnlocks,
          },
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    // ONLINE MODE: Use Supabase RPC
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_promoter_dashboard_stats', {
      p_user_id: userId,
    } as any)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      data: data?.[0] || {
        total_listings: 0,
        live_listings: 0,
        pending_listings: 0,
        total_views: 0,
        total_unlocks: 0,
      },
    }
  } catch (error) {
    console.error('Get promoter dashboard stats error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats',
    }
  }
}

/**
 * Get dashboard stats for admin users
 */
export async function getAdminDashboardStats(): Promise<{
  success: boolean
  data?: {
    total_users: number
    total_promoters: number
    total_customers: number
    pending_listings: number
    live_listings: number
    total_unlocks: number
    total_revenue: number
  }
  error?: string
}> {
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
        // Get total users
        const totalUsers = await prisma.user.count()

        // Get total promoters
        const totalPromoters = await prisma.user.count({
          where: { role: 'PROMOTER' },
        })

        // Get total customers
        const totalCustomers = await prisma.user.count({
          where: { role: 'CUSTOMER' },
        })

        // Get pending listings
        const pendingListings = await prisma.listing.count({
          where: { status: 'PENDING_VERIFICATION' },
        })

        // Get LIVE listings
        const liveListings = await prisma.listing.count({
          where: { status: 'LIVE' },
        })

        // Get total unlocks
        const totalUnlocks = await prisma.unlock.count()

        await prisma.$disconnect()

        return {
          success: true,
          data: {
            total_users: totalUsers,
            total_promoters: totalPromoters,
            total_customers: totalCustomers,
            pending_listings: pendingListings,
            live_listings: liveListings,
            total_unlocks: totalUnlocks,
            total_revenue: 0, // Not implemented yet
          },
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    // ONLINE MODE: Use Supabase RPC
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_user_dashboard_stats', {
      p_user_id: userId,
    } as any)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      data: data?.[0] || {
        total_users: 0,
        total_promoters: 0,
        total_customers: 0,
        pending_listings: 0,
        live_listings: 0,
        total_unlocks: 0,
        total_revenue: 0,
      },
    }
  } catch (error) {
    console.error('Get admin dashboard stats error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats',
    }
  }
}

/**
 * Get recent activity logs (admin only)
 */
export async function getRecentActivity(limit: number = 10): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in',
      }
    }

    if (isOfflineMode) {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        const activities = await prisma.activityLog.findMany({
          take: limit,
          orderBy: { createdAt: 'desc' },
        })

        await prisma.$disconnect()

        return {
          success: true,
          data: activities.map((a: any) => ({
            id: a.id,
            created_at: a.createdAt.toISOString(),
            action_type: a.action,
            description: a.details || a.action
          })),
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return {
      success: true,
      data: data || [],
    }
  } catch (error) {
    console.error('Get recent activity error:', error)
    return {
      success: false,
      error: 'Failed to fetch recent activity',
    }
  }
}

/**
 * Get recent unlocks for a promoter
 */
export async function getRecentUnlocks(limit: number = 5): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in',
      }
    }

    if (isOfflineMode) {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        const unlocks = await prisma.unlock.findMany({
          where: { listing: { promoterId: userId } },
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { fullName: true, phoneE164: true } },
            listing: { select: { id: true, propertyType: true, city: true } },
          },
        })

        await prisma.$disconnect()

        return {
          success: true,
          data: unlocks.map((u: any) => ({
            id: u.id,
            created_at: u.createdAt.toISOString(),
            customer_name: u.user.fullName || 'Unknown',
            customer_phone: u.user.phoneE164 || '',
            listing_title: `${u.listing.propertyType} in ${u.listing.city}`,
            listing_id: u.listing.id,
          })),
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('unlocks')
      .select(`
        id,
        created_at,
        users:user_id (full_name, phone_e164),
        listings:listing_id (id, property_type, city)
      `)
      .eq('listings.promoter_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return {
      success: true,
      data: (data || []).map((u: any) => ({
        id: u.id,
        created_at: u.created_at,
        customer_name: u.users?.full_name || 'Unknown',
        customer_phone: u.users?.phone_e164 || '',
        listing_title: `${u.listings?.property_type} in ${u.listings?.city}`,
        listing_id: u.listings?.id || '',
      })),
    }
  } catch (error) {
    console.error('Get recent unlocks error:', error)
    return {
      success: false,
      error: 'Failed to fetch recent unlocks',
    }
  }
}
