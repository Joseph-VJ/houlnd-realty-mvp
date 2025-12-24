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
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'

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
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    fetchSavedProperties()
  }, [user])

  const fetchSavedProperties = async () => {
    if (!user) return

    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('saved_properties')
        .select(`
          id,
          listing_id,
          created_at,
          listings (
            id,
            property_type,
            city,
            locality,
            total_price,
            total_sqft,
            price_per_sqft,
            image_urls,
            bedrooms,
            bathrooms
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setSavedProperties(data || [])
    } catch (error) {
      console.error('Error fetching saved properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnsave = async (savedPropertyId: string, listingId: string) => {
    try {
      setUnsavingId(listingId)

      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .eq('id', savedPropertyId)

      if (error) throw error

      // Remove from local state
      setSavedProperties(prev => prev.filter(sp => sp.id !== savedPropertyId))
    } catch (error) {
      console.error('Error unsaving property:', error)
    } finally {
      setUnsavingId(null)
    }
  }

  return (
    <ProtectedRoute requiredRole="CUSTOMER">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-blue-600">Houlnd</div>
                  <div className="text-sm text-gray-500">Realty</div>
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/customer/dashboard" className="text-gray-700 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/search">
                  <Button size="sm">Search Properties</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Saved Properties</h1>
            <p className="text-gray-600 mt-2">Your favorite properties in one place</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : savedProperties.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved properties yet</h3>
              <p className="text-gray-600 mb-6">
                Start browsing properties and save your favorites by clicking the heart icon.
              </p>
              <Link href="/search">
                <Button>Browse Properties</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProperties.map((savedProp) => {
                const listing = savedProp.listing as any

                return (
                  <Card key={savedProp.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Image */}
                    <div className="relative h-48 bg-gray-200">
                      {listing.image_urls && listing.image_urls.length > 0 ? (
                        <img
                          src={listing.image_urls[0]}
                          alt={`${listing.property_type} in ${listing.city}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <div className="text-4xl mb-2">🏠</div>
                            <div className="text-sm">No image</div>
                          </div>
                        </div>
                      )}
                      {/* Unsave Button */}
                      <button
                        onClick={() => handleUnsave(savedProp.id, listing.id)}
                        disabled={unsavingId === listing.id}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                        title="Remove from saved"
                      >
                        {unsavingId === listing.id ? (
                          <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-red-600 rounded-full"></div>
                        ) : (
                          <span className="text-xl">❤️</span>
                        )}
                      </button>
                    </div>

                    <CardContent className="pt-4">
                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {listing.property_type} in {listing.city}
                      </h3>
                      {listing.locality && (
                        <p className="text-sm text-gray-600 mb-3">{listing.locality}</p>
                      )}

                      {/* Price Badge */}
                      <div className="mb-3">
                        <Badge variant="info" className="text-base px-3 py-1">
                          ₹{Math.round(listing.price_per_sqft).toLocaleString('en-IN')}/sq.ft
                        </Badge>
                      </div>

                      {/* Details */}
                      <div className="space-y-1 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Price:</span>
                          <span className="font-medium">₹{listing.total_price.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Area:</span>
                          <span className="font-medium">{listing.total_sqft.toLocaleString('en-IN')} sq.ft</span>
                        </div>
                        {listing.bedrooms && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Bedrooms:</span>
                            <span className="font-medium">{listing.bedrooms} BHK</span>
                          </div>
                        )}
                        {listing.bathrooms && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Bathrooms:</span>
                            <span className="font-medium">{listing.bathrooms}</span>
                          </div>
                        )}
                      </div>

                      {/* Saved Date */}
                      <div className="text-xs text-gray-500 mb-4">
                        Saved on {new Date(savedProp.created_at).toLocaleDateString()}
                      </div>

                      {/* View Button */}
                      <Link href={`/property/${listing.id}`}>
                        <Button className="w-full">View Details</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
