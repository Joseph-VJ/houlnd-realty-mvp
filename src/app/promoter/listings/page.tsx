/**
 * My Listings Page (Promoter)
 *
 * Features:
 * - Tabs: All, Pending, Live, Rejected
 * - Property cards: Image, title, price, sqft, status badge, view/unlock counts
 * - Actions dropdown: Edit (if PENDING/REJECTED), View details, View inquiries
 * - If REJECTED, show rejection reason
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge, getListingStatusBadge } from '@/components/ui/Badge'
import { getPromoterListings } from '@/app/actions/listings'

type ListingStatus = 'ALL' | 'PENDING_VERIFICATION' | 'LIVE' | 'REJECTED'

interface Listing {
  id: string
  property_type: string
  city: string
  total_price: number
  total_sqft: number
  price_per_sqft: number
  status: string
  image_urls: string[]
  bedrooms: number | null
  rejection_reason: string | null
  view_count: number
  unlock_count: number
  created_at: string
}

export default function MyListingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<ListingStatus>('ALL')
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchListings = async () => {
      try {
        setLoading(true)

        const result = await getPromoterListings()

        if (result.success && result.data) {
          let data = result.data as any[]
          
          // Filter by status if not "ALL"
          if (activeTab !== 'ALL') {
            data = data.filter(l => l.status === activeTab)
          }

          setListings(data)
        }
      } catch (error) {
        console.error('Error fetching listings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [user, activeTab])

  const tabs = [
    { key: 'ALL' as ListingStatus, label: 'All' },
    { key: 'PENDING_VERIFICATION' as ListingStatus, label: 'Pending' },
    { key: 'LIVE' as ListingStatus, label: 'Live' },
    { key: 'REJECTED' as ListingStatus, label: 'Rejected' },
  ]

  return (
    <ProtectedRoute requiredRole="PROMOTER">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-blue-600">Houlnd</div>
                  <div className="text-sm text-gray-500 font-medium">Realty</div>
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/promoter/dashboard" className="text-gray-700 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/promoter/post-new-property">
                  <Button size="sm">Post New Property</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-600 mt-2">Manage all your property listings</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'ALL'
                  ? "You haven't posted any properties yet."
                  : `You don't have any ${activeTab.toLowerCase().replace('_', ' ')} listings.`}
              </p>
              <Link href="/promoter/post-new-property">
                <Button>Post Your First Property</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge variant={getListingStatusBadge(listing.status)}>
                        {listing.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="pt-4">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {listing.property_type} in {listing.city}
                    </h3>

                    {/* Details */}
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Price:</span>
                        <span className="font-medium">₹{listing.total_price.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sq.ft:</span>
                        <span className="font-medium">{listing.total_sqft.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Price/sq.ft:</span>
                        <span className="font-medium text-blue-600">
                          ₹{Math.round(listing.price_per_sqft).toLocaleString('en-IN')}
                        </span>
                      </div>
                      {listing.bedrooms && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Bedrooms:</span>
                          <span className="font-medium">{listing.bedrooms} BHK</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 mb-4 text-sm text-gray-600">
                      <div>👁️ {listing.view_count || 0} views</div>
                      <div>🔓 {listing.unlock_count || 0} unlocks</div>
                    </div>

                    {/* Rejection Reason */}
                    {listing.status === 'REJECTED' && listing.rejection_reason && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-xs font-medium text-red-800 mb-1">Rejection Reason:</div>
                        <div className="text-sm text-red-700">{listing.rejection_reason}</div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/property/${listing.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      {(listing.status === 'PENDING_VERIFICATION' || listing.status === 'REJECTED') && (
                        <Link href={`/promoter/listings/${listing.id}/edit`} className="flex-1">
                          <Button size="sm" className="w-full">
                            Edit
                          </Button>
                        </Link>
                      )}
                      {listing.unlock_count > 0 && (
                        <Link href={`/promoter/listings/${listing.id}/inquiries`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Inquiries ({listing.unlock_count})
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
