/**
 * Get Current User API Endpoint
 * 
 * Returns the current authenticated user from JWT token (offline mode)
 * or from Supabase session (online mode).
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { offlineGetUser } from '@/lib/offlineAuth'
import { createClient } from '@/lib/supabase/server'

const isOfflineMode = process.env.USE_OFFLINE === 'true'

export async function GET() {
  try {
    if (isOfflineMode) {
      // OFFLINE MODE: Get user from JWT token
      const cookieStore = await cookies()
      const token = cookieStore.get('offline_token')?.value

      if (!token) {
        return NextResponse.json({ user: null })
      }

      const result = await offlineGetUser(token)
      
      if (result.error || !result.data?.user) {
        return NextResponse.json({ user: null })
      }

      return NextResponse.json({ user: result.data.user })
    } else {
      // ONLINE MODE: Get user from Supabase
      const supabase: any = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        return NextResponse.json({ user: null })
      }

      // Get user profile for role
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          role: (profile as any)?.role || 'CUSTOMER'
        }
      })
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return NextResponse.json({ user: null })
  }
}
