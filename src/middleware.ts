/**
 * Next.js Middleware
 *
 * This middleware runs on every request to refresh Supabase auth sessions.
 * It ensures users remain authenticated as they navigate through the app.
 *
 * The middleware also handles route protection for authenticated-only pages.
 */

import { updateSession } from '@/lib/supabase/middleware'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Update Supabase session
  return await updateSession(request)
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
