/**
 * Supabase Middleware Helper
 *
 * This helper is used in Next.js middleware to refresh Supabase auth sessions.
 * It ensures users remain authenticated across page navigations.
 *
 * Usage in middleware.ts:
 * ```ts
 * import { updateSession } from '@/lib/supabase/middleware'
 *
 * export async function middleware(request: NextRequest) {
 *   return await updateSession(request)
 * }
 * ```
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

/**
 * Update the Supabase session in middleware
 *
 * This function:
 * 1. Creates a Supabase client with cookie handling
 * 2. Refreshes the session if needed
 * 3. Updates cookies in the response
 *
 * @param request - Next.js request object
 * @returns NextResponse with updated session cookies
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set cookie in request (for the current request)
          request.cookies.set({
            name,
            value,
            ...options,
          })
          // Set cookie in response (for future requests)
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // Remove cookie from request
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          // Remove cookie from response
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired - this is important for session continuity
  await supabase.auth.getUser()

  return response
}

/**
 * Protect a route by checking if user is authenticated
 *
 * @param request - Next.js request object
 * @param redirectTo - Path to redirect to if not authenticated (default: '/login')
 * @returns NextResponse - Redirects to login if not authenticated, otherwise continues
 */
export async function protectRoute(
  request: NextRequest,
  redirectTo: string = '/login'
): Promise<NextResponse> {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const redirectUrl = new URL(redirectTo, request.url)
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

/**
 * Check user role and redirect if doesn't match
 *
 * @param request - Next.js request object
 * @param allowedRoles - Array of allowed user roles
 * @param redirectTo - Path to redirect to if role doesn't match (default: '/unauthorized')
 * @returns NextResponse - Redirects if role doesn't match, otherwise continues
 */
export async function checkRole(
  request: NextRequest,
  allowedRoles: Array<'CUSTOMER' | 'PROMOTER' | 'ADMIN'>,
  redirectTo: string = '/unauthorized'
): Promise<NextResponse | null> {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Get user profile to check role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !allowedRoles.includes((profile as any).role)) {
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  return null // Continue to the requested page
}
