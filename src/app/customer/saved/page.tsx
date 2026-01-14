/**
 * Saved Properties Page (Customer)
 *
 * Features:
 * - Grid of saved property cards (same design as search results)
 * - Unsave button (heart icon toggle)
 * - Empty state if no saved properties
 * - Link to search page
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { getSavedProperties, unsaveListing } from '@/app/actions/savedProperties'

interface SavedProperty {
  id: string
  listing_id: string
  listing: {
    id: string
    property_type: string
    city: string
    locality: string | null
    total_price: number
    total_sqft: number
    price_per_sqft: number
    image_urls: string[]
    bedrooms: number | null
    bathrooms: number | null
  }
  created_at: string
}

export default function SavedPropertiesPage() {
  const { user } = useAuth()
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [unsavingId, setUnsavingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    fetchSavedProperties()
  }, [user])

  const fetchSavedProperties = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const result = await getSavedProperties()

      if (result.success && result.data) {
        setSavedProperties(result.data)
      } else {
        setError(result.error || 'Failed to load saved properties')
      }
    } catch (err) {
      console.error('Error fetching saved properties:', err)
      setError('An error occurred while loading saved properties')
    } finally {
      setLoading(false)
    }
  }

  const handleUnsave = async (savedPropertyId: string, listingId: string) => {
    try {
      setUnsavingId(listingId)
      setError(null)

      const result = await unsaveListing(listingId)

      if (result.success) {
        // Remove from local state
        setSavedProperties(prev => prev.filter(sp => sp.listing_id !== listingId))
      } else {
        setError(result.error || 'Failed to unsave property')
      }
    } catch (err) {
      console.error('Error unsaving property:', err)
      setError('An error occurred while unsaving the property')
    } finally {
      setUnsavingId(null)
    }
  }

  return (
    <ProtectedRoute requiredRole="CUSTOMER">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white rounded-sm transform rotate-45"></div>
                  </div>
                  <span className="text-xl font-bold text-gray-900">Houlnd Realty</span>
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/customer/dashboard" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
                  Dashboard
                </Link>
                <Link href="/search">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-medium transition-all shadow-sm text-sm">
                    Search Properties
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">Saved Properties</h1>
            <p className="text-lg text-gray-600">Your favorite properties in one place</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : savedProperties.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No saved properties yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start browsing properties and save your favorites by clicking the heart icon.
              </p>
              <Link href="/search">
                <button className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-bold transition-all shadow-sm">
                  Browse Properties
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProperties.map((savedProp) => {
                const listing = savedProp.listing as any

                return (
                  <div key={savedProp.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden group">
                    {/* Image */}
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                      {listing.image_urls && listing.image_urls.length > 0 ? (
                        <img
                          src={listing.image_urls[0]}
                          alt={`${listing.property_type} in ${listing.city}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <div className="text-sm font-medium">No image</div>
                          </div>
                        </div>
                      )}
                      {/* Unsave Button */}
                      <button
                        onClick={() => handleUnsave(savedProp.id, listing.id)}
                        disabled={unsavingId === listing.id}
                        className="absolute top-3 right-3 p-2.5 bg-white rounded-full shadow-lg hover:scale-110 transition-all disabled:opacity-50"
                        title="Remove from saved"
                      >
                        {unsavingId === listing.id ? (
                          <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-red-600 rounded-full"></div>
                        ) : (
                          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        )}
                      </button>
                    </div>

                    <div className="p-5">
                      {/* Title */}
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {listing.property_type} in {listing.city}
                      </h3>
                      {listing.locality && (
                        <p className="text-sm text-gray-600 mb-3">{listing.locality}</p>
                      )}

                      {/* Price Badge */}
                      <div className="mb-4">
                        <span className="inline-block bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                          ₹{Math.round(listing.price_per_sqft).toLocaleString('en-IN')}/sq.ft
                        </span>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">Total Price:</span>
                          <span className="font-bold text-gray-900">₹{listing.total_price.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">Area:</span>
                          <span className="font-bold text-gray-900">{listing.total_sqft.toLocaleString('en-IN')} sq.ft</span>
                        </div>
                        {listing.bedrooms && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 font-medium">Bedrooms:</span>
                            <span className="font-bold text-gray-900">{listing.bedrooms} BHK</span>
                          </div>
                        )}
                        {listing.bathrooms && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 font-medium">Bathrooms:</span>
                            <span className="font-bold text-gray-900">{listing.bathrooms}</span>
                          </div>
                        )}
                      </div>

                      {/* Saved Date */}
                      <div className="text-xs text-gray-500 mb-4 font-medium">
                        Saved on {new Date(savedProp.created_at).toLocaleDateString()}
                      </div>

                      {/* View Button */}
                      <Link href={`/property/${listing.id}`}>
                        <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-bold transition-all shadow-sm">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
