/**
 * Contact Management Server Actions
 *
 * Supports both online (Supabase) and offline (Prisma) modes.
 * In offline mode, contact unlock is FREE (no payment required) for testing.
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import * as jose from 'jose'

interface ContactInfo {
  unlocked: boolean
  masked_phone: string
  phone_e164?: string
}

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

  const supabase: any = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id || null
}

/**
 * Get contact info for a listing (checks if unlocked)
 */
export async function getListingContact(
  listingId: string
): Promise<{ success: boolean; data?: ContactInfo; error?: string }> {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      // Not logged in
      return {
        success: true,
        data: {
          unlocked: false,
          masked_phone: '+91******00',
        },
      }
    }

    if (isOfflineMode) {
      // OFFLINE MODE: Check if user has unlocked this listing
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        // Check for unlock record
        const unlock = await prisma.unlock.findFirst({
          where: {
            userId,
            listingId,
          },
        })

        if (unlock) {
          // User has unlocked - get full contact
          const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            include: {
              promoter: {
                select: {
                  phoneE164: true,
                },
              },
            },
          })

          await prisma.$disconnect()

          return {
            success: true,
            data: {
              unlocked: true,
              masked_phone: listing?.promoter?.phoneE164 || '+91******00',
              phone_e164: listing?.promoter?.phoneE164 || undefined,
            },
          }
        }

        // Not unlocked - show masked
        await prisma.$disconnect()

        return {
          success: true,
          data: {
            unlocked: false,
            masked_phone: '+91******00',
          },
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    // ONLINE MODE: Use Supabase RPC
    const supabase: any = await createClient()
    const { data, error } = await supabase.rpc('get_listing_contact', {
      p_listing_id: listingId,
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
      data: data as ContactInfo,
    }
  } catch (error) {
    console.error('Get listing contact error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get contact info',
    }
  }
}

/**
 * Unlock contact (ALWAYS FREE to generate leads for sellers)
 */
export async function unlockContact(
  listingId: string
): Promise<{ success: boolean; alreadyUnlocked?: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in to unlock contact',
      }
    }

    if (isOfflineMode) {
      // OFFLINE MODE: FREE unlock
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        // Check if already unlocked
        const existing = await prisma.unlock.findFirst({
          where: {
            userId,
            listingId,
          },
        })

        if (existing) {
          await prisma.$disconnect()
          return {
            success: true,
            alreadyUnlocked: true,
          }
        }

        // Create unlock record (FREE - generates leads for sellers)
        await prisma.unlock.create({
          data: {
            userId,
            listingId,
          },
        })

        // Increment unlock count on listing for analytics
        await prisma.listing.update({
          where: { id: listingId },
          data: { unlockCount: { increment: 1 } },
        })

        await prisma.$disconnect()

        return {
          success: true,
          alreadyUnlocked: false,
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    // ONLINE MODE: Also FREE (same logic with Supabase)
    const supabase: any = await createClient()

    // Check if already unlocked
    const { data: existing } = await supabase
      .from('unlocks')
      .select('id')
      .eq('user_id', userId)
      .eq('listing_id', listingId)
      .single()

    if (existing) {
      return {
        success: true,
        alreadyUnlocked: true,
      }
    }

    // Create unlock record (FREE - generates leads for sellers)
    const { error } = await supabase.from('unlocks').insert({
      user_id: userId,
      listing_id: listingId,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    // Increment unlock count on listing for analytics
    const { error: updateError } = await supabase.rpc('increment_listing_unlock_count', {
      listing_id_param: listingId,
    })

    if (updateError) {
      console.error('Failed to increment unlock count:', updateError)
      // Don't fail the request, just log the error
    }

    return {
      success: true,
      alreadyUnlocked: false,
    }
  } catch (error) {
    console.error('Unlock contact error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to unlock contact',
    }
  }
}
