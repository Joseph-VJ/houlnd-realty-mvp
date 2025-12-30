/**
 * Edit Listing Page
 * Allows promoters to edit their existing property listings
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { usePostPropertyStore } from '@/stores/postPropertyStore'
import { getListing } from '@/app/actions/getListing'
import { PostPropertyFormSteps } from '@/components/promoter/PostPropertyForm/PostPropertyFormSteps'

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [listingId, setListingId] = useState<string | null>(null)
  const { initializeWithListing } = usePostPropertyStore()

  // Unwrap params Promise
  useEffect(() => {
    params.then((p) => setListingId(p.id))
  }, [params])

  useEffect(() => {
    // Wait for params to be unwrapped
    if (!listingId) {
      return
    }

    // Wait for auth to finish loading
    if (authLoading) {
      return
    }

    // Redirect to login if not authenticated
    if (!user) {
      router.push('/login')
      return
    }

    // Load listing data
    const loadListing = async () => {
      try {
        console.log('Loading listing:', listingId)
        const result = await getListing(listingId)
        console.log('Listing result:', result)

        if (!result.success || !result.listing) {
          console.error('Listing load failed:', result.error)
          setError(result.error || 'Failed to load listing')
          setLoading(false)
          return
        }

        // Initialize form with listing data
        console.log('Initializing with listing:', result.listing)
        initializeWithListing(result.listing)
        setLoading(false)
      } catch (err) {
        console.error('Exception loading listing:', err)
        setError(err instanceof Error ? err.message : 'Failed to load listing')
        setLoading(false)
      }
    }

    loadListing()
  }, [user, authLoading, router, listingId, initializeWithListing])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">Loading...</div>
          <p className="text-gray-600">Please wait while we load your listing</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
          <div className="text-2xl font-bold text-red-600 mb-4">Error Loading Listing</div>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => router.push('/promoter/listings')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Listings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PostPropertyFormSteps listingId={listingId!} isEditMode={true} />
    </div>
  )
}
