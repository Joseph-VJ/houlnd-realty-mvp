/**
 * Supabase Server Client
 *
 * This client is used in Server Components, Route Handlers, and Server Actions.
 * It creates a Supabase client that uses cookies for authentication state
 * with proper cookie handling for the server environment.
 *
 * Usage in Server Component:
 * ```tsx
 * import { createClient } from '@/lib/supabase/server'
 *
 * export default async function MyServerComponent() {
 *   const supabase = await createClient()
 *   const { data } = await supabase.from('listings').select('*')
 *
 *   return <div>{JSON.stringify(data)}</div>
 * }
 * ```
 *
 * Usage in Route Handler:
 * ```ts
 * import { createClient } from '@/lib/supabase/server'
 *
 * export async function GET(request: Request) {
 *   const supabase = await createClient()
 *   const { data } = await supabase.from('listings').select('*')
 *
 *   return Response.json(data)
 * }
 * ```
 *
 * Usage in Server Action:
 * ```ts
 * 'use server'
 *
 * import { createClient } from '@/lib/supabase/server'
 *
 * export async function myAction() {
 *   const supabase = await createClient()
 *   const { data } = await supabase.from('listings').select('*')
 *   return data
 * }
 * ```
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

/**
 * Create a Supabase client for use in Server Components, Route Handlers, and Server Actions
 *
 * @returns Promise<SupabaseClient> - Supabase server client instance
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            // console.error('Error setting cookie:', error)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `remove` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            // console.error('Error removing cookie:', error)
          }
        },
      },
    }
  )
}

/**
 * Create a Supabase admin client with service role key
 * WARNING: This client bypasses Row Level Security (RLS)
 * Only use this for admin operations that require elevated permissions
 *
 * @returns SupabaseClient - Supabase admin client instance
 */
export async function createAdminClient() {
  const cookieStore = await cookies()

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Ignore cookie setting errors in server components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Ignore cookie removal errors in server components
          }
        },
      },
    }
  )
}
