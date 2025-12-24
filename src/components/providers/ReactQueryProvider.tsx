/**
 * React Query Provider
 *
 * This component wraps the application with React Query's QueryClientProvider.
 * React Query provides data fetching, caching, and state management for server state.
 *
 * Features:
 * - Automatic caching and invalidation
 * - Background refetching
 * - Error and loading states
 * - Devtools in development mode
 */

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Queries will be cached for 5 minutes by default
            staleTime: 5 * 60 * 1000,
            // Queries will be garbage collected after 10 minutes of being unused
            gcTime: 10 * 60 * 1000,
            // Retry failed queries 1 time
            retry: 1,
            // Don't refetch on window focus in development
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show devtools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
