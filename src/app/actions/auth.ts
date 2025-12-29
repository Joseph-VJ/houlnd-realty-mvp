/**
 * Authentication Server Actions
 *
 * This file contains all server-side authentication actions.
 * These functions run on the server and handle:
 * - User registration (with profile creation)
 * - User login (email/password)
 * - User logout
 * - OTP sending (for phone verification)
 * - OTP verification
 *
 * All actions return a consistent response format:
 * - success: boolean
 * - error?: string
 * - data?: any
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { offlineSignUp, offlineSignIn, offlineSignOut, offlineGetUser } from '@/lib/offlineAuth'
import { cookies } from 'next/headers'

interface ActionResponse<T = unknown> {
  success: boolean
  error?: string
  data?: T
}

// Check if offline mode is enabled
const isOfflineMode = process.env.USE_OFFLINE === 'true'

/**
 * Sign up a new user with email/password
 *
 * This creates both:
 * 1. Auth user (in auth.users table)
 * 2. User profile (in public.users table)
 *
 * @param email - User's email address
 * @param password - User's password (min 6 characters)
 * @param role - User role (CUSTOMER or PROMOTER)
 * @param fullName - User's full name
 * @param phone - User's phone number (E.164 format recommended)
 */
export async function signUp(
  email: string,
  password: string,
  role: 'CUSTOMER' | 'PROMOTER',
  fullName: string,
  phone?: string
): Promise<ActionResponse<{ userId: string }>> {
  try {
    // OFFLINE MODE: Use SQLite and JWT
    if (isOfflineMode) {
      const result = await offlineSignUp(email, password, fullName, role)
      
      if (result.error) {
        return { success: false, error: result.error.message }
      }

      if (result.data) {
        // Set cookie for offline auth
        const cookieStore = await cookies()
        cookieStore.set('offline_token', result.data.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })

        return {
          success: true,
          data: { userId: result.data.user.id }
        }
      }

      return { success: false, error: 'Failed to create user' }
    }

    // ONLINE MODE: Use Supabase
    const supabase = await createClient()

    // Create auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_e164: phone,
        },
      },
    })

    if (signUpError) {
      return { success: false, error: signUpError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user account' }
    }

    // Create user profile in public.users table
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      email,
      phone_e164: phone || null,
      full_name: fullName,
      role,
    } as any)

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return {
        success: false,
        error: 'Account created but profile setup failed. Please contact support.',
      }
    }

    return {
      success: true,
      data: { userId: authData.user.id },
    }
  } catch (error) {
    console.error('Sign up error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Sign in an existing user with email/password
 *
 * @param email - User's email address
 * @param password - User's password
 */
export async function signIn(
  email: string,
  password: string
): Promise<ActionResponse<{ userId: string; role: string }>> {
  try {
    // OFFLINE MODE: Use SQLite and JWT
    if (isOfflineMode) {
      const result = await offlineSignIn(email, password)
      
      if (result.error) {
        return { success: false, error: result.error.message }
      }

      if (result.data) {
        // Set cookie for offline auth
        const cookieStore = await cookies()
        cookieStore.set('offline_token', result.data.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })

        revalidatePath('/', 'layout')

        return {
          success: true,
          data: {
            userId: result.data.user.id,
            role: result.data.user.role
          }
        }
      }

      return { success: false, error: 'Login failed' }
    }

    // ONLINE MODE: Use Supabase
    const supabase = await createClient()

    const { data: authData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (signInError) {
      return { success: false, error: signInError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Login failed' }
    }

    // Fetch user profile to get role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError)
      return {
        success: false,
        error: 'Login successful but failed to fetch user profile',
      }
    }

    revalidatePath('/', 'layout')

    return {
      success: true,
      data: {
        userId: authData.user.id,
        role: (profile as any).role,
      },
    }
  } catch (error) {
    console.error('Sign in error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<ActionResponse> {
  try {
    // OFFLINE MODE: Clear cookie
    if (isOfflineMode) {
      const cookieStore = await cookies()
      cookieStore.delete('offline_token')
      
      revalidatePath('/', 'layout')
      redirect('/login')
    }

    // ONLINE MODE: Use Supabase
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/login')
  } catch (error) {
    console.error('Sign out error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Send OTP to phone number for verification
 *
 * Note: Requires Supabase Phone Auth to be configured with an SMS provider (Twilio, etc.)
 *
 * @param phone - Phone number in E.164 format (e.g., +919876543210)
 */
export async function sendOtp(phone: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        channel: 'sms',
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data: { message: 'OTP sent successfully' },
    }
  } catch (error) {
    console.error('Send OTP error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send OTP',
    }
  }
}

/**
 * Verify OTP sent to phone number
 *
 * @param phone - Phone number in E.164 format
 * @param otp - 6-digit OTP code
 */
export async function verifyOtp(
  phone: string,
  otp: string
): Promise<ActionResponse<{ userId: string }>> {
  try {
    const supabase = await createClient()

    const { data: authData, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (!authData.user) {
      return { success: false, error: 'OTP verification failed' }
    }

    return {
      success: true,
      data: { userId: authData.user.id },
    }
  } catch (error) {
    console.error('Verify OTP error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'OTP verification failed',
    }
  }
}

/**
 * Get the current authenticated user's profile
 *
 * This is a convenience function for server components/actions
 */
export async function getCurrentUserProfile(): Promise<
  ActionResponse<{
    id: string
    email: string | null
    phone_e164: string | null
    full_name: string | null
    role: 'CUSTOMER' | 'PROMOTER' | 'ADMIN'
  }>
> {
  try {
    // OFFLINE MODE: Get user from JWT token
    if (isOfflineMode) {
      const cookieStore = await cookies()
      const token = cookieStore.get('offline_token')?.value

      if (!token) {
        return { success: false, error: 'Not authenticated' }
      }

      const result = await offlineGetUser(token)

      if (!result.data.user) {
        return { success: false, error: 'Not authenticated' }
      }

      // Get full user profile from Prisma
      const { PrismaClient } = require('@prisma/client')
      const prisma = new PrismaClient()

      try {
        const profile = await prisma.user.findUnique({
          where: { id: result.data.user.id }
        })

        if (!profile) {
          return { success: false, error: 'Profile not found' }
        }

        return {
          success: true,
          data: {
            id: profile.id,
            email: profile.email,
            phone_e164: profile.phoneE164,
            full_name: profile.fullName,
            role: profile.role as 'CUSTOMER' | 'PROMOTER' | 'ADMIN'
          }
        }
      } finally {
        await prisma.$disconnect()
      }
    }

    // ONLINE MODE: Use Supabase
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return { success: false, error: 'Profile not found' }
    }

    return {
      success: true,
      data: profile,
    }
  } catch (error) {
    console.error('Get current user profile error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch profile',
    }
  }
}
