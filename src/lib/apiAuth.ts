/**
 * Secure API Authentication Helper
 *
 * This module provides secure authentication for API routes.
 * It verifies JWT tokens cryptographically instead of trusting client-provided user IDs.
 *
 * SECURITY: Never trust x-user-id headers or any client-provided authentication data.
 * Always verify tokens cryptographically using the JWT secret.
 */

import * as jose from 'jose'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

const isOfflineMode = process.env.NEXT_PUBLIC_USE_OFFLINE === 'true'

// JWT secret for offline mode
const JWT_SECRET_STRING = process.env.JWT_SECRET || 'offline-test-secret-key'
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING)

export interface AuthenticatedUser {
  userId: string
  role: string
  email?: string
}

/**
 * Require authentication for API routes
 * Verifies JWT token from cookie and returns authenticated user
 *
 * @param req - Next.js Request object
 * @returns Authenticated user object with userId and role
 * @throws Error if authentication fails
 */
export async function requireAuth(req: Request): Promise<AuthenticatedUser> {
  if (isOfflineMode) {
    return await requireAuthOffline(req)
  } else {
    return await requireAuthOnline(req)
  }
}

/**
 * Require authentication with specific role
 *
 * @param req - Next.js Request object
 * @param requiredRole - Required role (ADMIN, PROMOTER, CUSTOMER)
 * @returns Authenticated user object
 * @throws Error if authentication fails or role doesn't match
 */
export async function requireRole(req: Request, requiredRole: string): Promise<AuthenticatedUser> {
  const user = await requireAuth(req)

  if (user.role !== requiredRole) {
    throw new Error(`Forbidden: ${requiredRole} access required`)
  }

  return user
}

/**
 * Offline mode authentication (JWT from cookie)
 */
async function requireAuthOffline(req: Request): Promise<AuthenticatedUser> {
  const cookieStore = await cookies()
  const token = cookieStore.get('offline_token')?.value

  if (!token) {
    throw new Error('Unauthorized: No authentication token')
  }

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)

    if (!payload.sub || !payload.role) {
      throw new Error('Unauthorized: Invalid token payload')
    }

    return {
      userId: payload.sub as string,
      role: payload.role as string,
      email: payload.email as string | undefined,
    }
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      throw new Error('Unauthorized: Token expired')
    }
    throw new Error('Unauthorized: Invalid token')
  }
}

/**
 * Online mode authentication (Supabase session)
 */
async function requireAuthOnline(req: Request): Promise<AuthenticatedUser> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required')
  }

  // Get user role from database
  const { data: profile, error: profileError } = await (supabase
    .from('users') as any)
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw new Error('Unauthorized: User profile not found')
  }

  return {
    userId: user.id,
    role: profile.role,
    email: user.email,
  }
}

/**
 * Optional authentication - returns null if not authenticated
 * Useful for endpoints that work differently for authenticated vs anonymous users
 */
export async function optionalAuth(req: Request): Promise<AuthenticatedUser | null> {
  try {
    return await requireAuth(req)
  } catch {
    return null
  }
}

/**
 * Helper to create standardized error responses
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return Response.json({ error: message }, { status: 401 })
}

export function forbiddenResponse(message: string = 'Forbidden') {
  return Response.json({ error: message }, { status: 403 })
}
