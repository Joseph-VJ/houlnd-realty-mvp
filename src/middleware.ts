/**
 * Next.js Middleware
 *
 * This middleware runs on every request to:
 * 1. Refresh Supabase auth sessions
 * 2. Enforce role-based access control (RBAC) on protected routes
 *
 * SECURITY: Server-side route protection prevents unauthorized access
 * even if client-side protections are bypassed.
 */

import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { offlineVerifyToken } from '@/lib/offlineAuth'
import { createClient } from '@/lib/supabase/server'

const isOfflineMode = process.env.USE_OFFLINE === 'true'

/**
 * Get authenticated user and role from session
 */
async function getAuthenticatedUser(request: NextRequest): Promise<{ userId: string; role: string } | null> {
  if (isOfflineMode) {
    // Offline mode: Verify JWT token
    const token = request.cookies.get('offline_token')?.value
    if (!token) return null

    const { valid, payload } = await offlineVerifyToken(token)
    if (!valid || !payload) return null

    return {
      userId: payload.sub as string,
      role: payload.role as string,
    }
  } else {
    // Online mode: Check Supabase session
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return null

      // Get user role from database
      const { data: profile } = await (supabase.from('users') as any).select('role').eq('id', user.id).single()

      if (!profile) return null

      return {
        userId: user.id,
        role: profile.role,
      }
    } catch {
      return null
    }
  }
}

export async function middleware(request: NextRequest) {
  // First, update the session (refresh tokens if needed)
  const response = await updateSession(request)

  const { pathname } = request.nextUrl

  // Define protected route patterns and required roles
  const protectedRoutes: { pattern: RegExp; requiredRole: string }[] = [
    { pattern: /^\/admin($|\/)/, requiredRole: 'ADMIN' },
    { pattern: /^\/promoter($|\/)/, requiredRole: 'PROMOTER' },
    { pattern: /^\/customer($|\/)/, requiredRole: 'CUSTOMER' },
  ]

  // Check if current path matches any protected route
  for (const { pattern, requiredRole } of protectedRoutes) {
    if (pattern.test(pathname)) {
      const user = await getAuthenticatedUser(request)

      // Not authenticated - redirect to login
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirect', pathname)
        return NextResponse.redirect(url)
      }

      // Authenticated but wrong role - redirect to unauthorized
      if (user.role !== requiredRole) {
        const url = request.nextUrl.clone()
        url.pathname = '/unauthorized'
        return NextResponse.redirect(url)
      }

      // Authorized - allow access
      break
    }
  }

  return response
}

/**
 * Configure which routes the middleware should run on
 *
 * This matcher ensures middleware runs on all routes except:
 * - Static files (_next/static)
 * - Image optimization files (_next/image)
 * - Favicon
 * - Other static assets (svg, png, jpg, jpeg, gif, webp)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static assets (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
