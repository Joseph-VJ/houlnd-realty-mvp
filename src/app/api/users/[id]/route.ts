/**
 * Get User Profile API Endpoint
 * 
 * Returns user profile by ID for offline mode (using Prisma)
 * or falls back to Supabase for online mode.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

const isOfflineMode = process.env.USE_OFFLINE === 'true'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (isOfflineMode) {
      // OFFLINE MODE: Get user from Prisma
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          fullName: true,
          phoneE164: true,
          role: true,
          isVerified: true,
          createdAt: true,
        }
      })

      if (!user) {
        return NextResponse.json({ user: null }, { status: 404 })
      }

      // Map to database.types format
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          full_name: user.fullName,
          phone_e164: user.phoneE164,
          role: user.role,
          is_verified: user.isVerified,
          created_at: user.createdAt.toISOString(),
        }
      })
    } else {
      // ONLINE MODE: Get user from Supabase
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        return NextResponse.json({ user: null }, { status: 404 })
      }

      return NextResponse.json({ user: data })
    }
  } catch (error) {
    console.error('Error getting user profile:', error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
