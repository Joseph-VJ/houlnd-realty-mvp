/**
 * Get Dashboard Stats Server Action
 * Uses Prisma database only
 */

'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import * as jose from 'jose'

interface DashboardStats {
  total_users: number
  total_promoters: number
  total_customers: number
  pending_listings: number
  live_listings: number
  total_unlocks: number
  total_revenue: number
}

/**
 * Get current user ID from session
 */
async function getCurrentUserId(): Promise<string | null> {
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

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<{
  success: boolean
  stats?: DashboardStats
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

    // Use Prisma to count stats
    const [
      totalUsers,
      totalPromoters,
      totalCustomers,
      pendingListings,
      liveListings,
      totalUnlocks,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'PROMOTER' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.listing.count({ where: { status: 'PENDING_VERIFICATION' } }),
      prisma.listing.count({ where: { status: 'LIVE' } }),
      prisma.unlock.count(),
    ])

    // Calculate total revenue (sum of all payment amounts in paise)
    const payments = await prisma.paymentOrder.findMany({
      where: { status: 'PAID' },
      select: { amountPaise: true },
    })
    const totalRevenue = payments.reduce((sum: number, payment: { amountPaise: number }) => sum + payment.amountPaise, 0)

    return {
      success: true,
      stats: {
        total_users: totalUsers,
        total_promoters: totalPromoters,
        total_customers: totalCustomers,
        pending_listings: pendingListings,
        live_listings: liveListings,
        total_unlocks: totalUnlocks,
        total_revenue: totalRevenue,
      },
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stats',
    }
  }
}
