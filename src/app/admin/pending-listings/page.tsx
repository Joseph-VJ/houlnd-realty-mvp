/**
 * Admin Pending Listings Page
 *
 * Features:
 * - List all PENDING_VERIFICATION listings
 * - Property cards with images and full details
 * - Approve button → Sets status to LIVE, sends notification to promoter
 * - Reject button → Modal for rejection reason, sends notification
 * - View full property details
 * - Promoter information
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { getPendingListings, approveListing, rejectListing } from '@/app/actions/admin'

interface PendingListing {
  id: string
  property_type: string
  city: string
  locality: string | null
  total_price: number
  total_sqft: number
  price_per_sqft: number
  price_type: string
  image_urls: string[]
  bedrooms: number | null
  bathrooms: number | null
  description: string | null
  created_at: string
  promoter_id: string
  promoter: {
    full_name: string | null
    email: string | null
    phone_e164: string | null
  }
}

export default function AdminPendingListingsPage() {
  const { user } = useAuth()
  const [listings, setListings] = useState<PendingListing[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectListingId, setRejectListingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    if (!user) return
    fetchPendingListings()
  }, [user])

  const fetchPendingListings = async () => {
    try {
      setLoading(true)

      const result = await getPendingListings()

      if (result.success && result.data) {
        setListings(result.data as any[])
      } else {
        console.error('Error fetching pending listings:', result.error)
      }
    } catch (error) {
      console.error('Error fetching pending listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (listingId: string) => {
    try {
      setProcessingId(listingId)

      const result = await approveListing(listingId)

      if (!result.success) throw new Error(result.error)

      // Remove from list
      setListings((prev) => prev.filter((l) => l.id !== listingId))
    } catch (error) {
      console.error('Error approving listing:', error)
      alert('Failed to approve listing. Please try again.')
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectClick = (listingId: string) => {
    setRejectListingId(listingId)
    setRejectModalOpen(true)
  }

  const handleRejectConfirm = async () => {
    if (!rejectListingId || !rejectionReason.trim()) {
      alert('Please provide a rejection reason.')
      return
    }

    try {
      setProcessingId(rejectListingId)

      const result = await rejectListing(rejectListingId, rejectionReason.trim())

      if (!result.success) throw new Error(result.error)

      // Remove from list
      setListings((prev) => prev.filter((l) => l.id !== rejectListingId))

      // Close modal and reset
      setRejectModalOpen(false)
      setRejectListingId(null)
      setRejectionReason('')
    } catch (error) {
      console.error('Error rejecting listing:', error)
      alert('Failed to reject listing. Please try again.')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
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
                <Badge variant="danger" className="ml-4">Admin</Badge>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/admin/dashboard">
                  <Button variant="ghost" size="sm">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Pending Listings</h1>
            <p className="text-gray-600 mt-2">
              Review and approve property listings waiting for verification
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : listings.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-16">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    All caught up!
                  </h3>
                  <p className="text-gray-600">
                    There are no pending listings to review at the moment.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {listings.map((listing) => {
                const promoter = listing.promoter as any

                return (
                  <Card key={listing.id} className="overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                      {/* Image */}
                      <div className="md:col-span-1">
                        <div className="relative h-48 bg-gray-200 rounded-lg overflow-hidden">
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
                        </div>
                        {listing.image_urls && listing.image_urls.length > 1 && (
                          <div className="text-xs text-gray-500 mt-2 text-center">
                            +{listing.image_urls.length - 1} more images
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="md:col-span-2">
                        {/* Title */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {listing.property_type} in {listing.city}
                            </h3>
                            {listing.locality && (
                              <p className="text-sm text-gray-600 mt-1">{listing.locality}</p>
                            )}
                          </div>
                          <Badge variant="warning">Pending</Badge>
                        </div>

                        {/* Price Info */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-600">Total Price</div>
                            <div className="text-lg font-semibold">
                              ₹{listing.total_price.toLocaleString('en-IN')}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Price/sq.ft</div>
                            <div className="text-lg font-semibold text-blue-600">
                              ₹{Math.round(listing.price_per_sqft).toLocaleString('en-IN')}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Area</div>
                            <div className="text-base font-medium">
                              {listing.total_sqft.toLocaleString('en-IN')} sq.ft
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Price Type</div>
                            <div className="text-base font-medium">{listing.price_type}</div>
                          </div>
                        </div>

                        {/* Additional Details */}
                        {(listing.bedrooms || listing.bathrooms) && (
                          <div className="flex gap-4 mb-4 text-sm text-gray-600">
                            {listing.bedrooms && <div>🛏️ {listing.bedrooms} BHK</div>}
                            {listing.bathrooms && <div>🚿 {listing.bathrooms} Bath</div>}
                          </div>
                        )}

                        {/* Description */}
                        {listing.description && (
                          <div className="mb-4">
                            <div className="text-sm text-gray-600 mb-1">Description</div>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {listing.description}
                            </p>
                          </div>
                        )}

                        {/* Promoter Info */}
                        <div className="border-t pt-4 mb-4">
                          <div className="text-sm text-gray-600 mb-2">Promoter Details</div>
                          <div className="space-y-1 text-sm">
                            <div>
                              <span className="font-medium">Name:</span> {promoter?.full_name || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Email:</span> {promoter?.email || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Phone:</span> {promoter?.phone_e164 || 'N/A'}
                            </div>
                          </div>
                        </div>

                        {/* Submission Date */}
                        <div className="text-xs text-gray-500 mb-4">
                          Submitted on {new Date(listing.created_at).toLocaleString()}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <Link href={`/property/${listing.id}`} target="_blank">
                            <Button variant="outline" size="sm">
                              View Full Details
                            </Button>
                          </Link>
                          <Button
                            onClick={() => handleApprove(listing.id)}
                            disabled={processingId === listing.id}
                            isLoading={processingId === listing.id}
                            size="sm"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleRejectClick(listing.id)}
                            disabled={processingId === listing.id}
                            size="sm"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Reject Listing
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting this listing. This will be sent to the promoter.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                rows={4}
                placeholder="e.g., Images are unclear, missing property details, incorrect pricing..."
              />
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectModalOpen(false)
                    setRejectListingId(null)
                    setRejectionReason('')
                  }}
                  disabled={processingId !== null}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleRejectConfirm}
                  disabled={!rejectionReason.trim() || processingId !== null}
                  isLoading={processingId !== null}
                >
                  Confirm Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </ProtectedRoute>
  )
}
