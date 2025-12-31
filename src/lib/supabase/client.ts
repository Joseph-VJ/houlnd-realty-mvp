/**
 * Supabase Browser Client
 *
 * This client is used in Client Components (components with 'use client' directive).
 * It creates a Supabase client that uses cookies for authentication state.
 *
 * Usage:
 * ```tsx
 * 'use client'
 *
 * import { createClient } from '@/lib/supabase/client'
 *
 * export function MyComponent() {
 *   const supabase = createClient()
 *
 *   const handleQuery = async () => {
 *     const { data } = await supabase.from('listings').select('*')
 *     console.log(data)
 *   }
 *
 *   return <button onClick={handleQuery}>Query</button>
 * }
 * ```
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

/**
 * Create a Supabase client for use in the browser (Client Components)
 *
 * @returns Supabase browser client instance
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    // Return a mock client that won't crash
    return createBrowserClient<Database>(
      'https://placeholder.supabase.co',
      'placeholder-key'
    )
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

/**
 * Singleton instance of the Supabase browser client
 * Use this for better performance if you don't need to create multiple clients
 */
let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getClient() {
  if (!client) {
    client = createClient()
  }
  return client
}
