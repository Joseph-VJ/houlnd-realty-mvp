/**
 * Property Detail Page - Enhanced Version
 *
 * Features:
 * - Image carousel with thumbnails
 * - Full property details (bedrooms, bathrooms, city, locality, description)
 * - Price badges: Total price, Price/sqft, Negotiable indicator
 * - Amenities grid with icons
 * - Map showing approximate location
 * - Contact section (gated by unlock)
 * - Save/Unsave property button
 * - Share property button
 * - Uses RPC get_listing_contact to check unlock status
 * - Razorpay integration for contact unlock
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { getListingById } from '@/app/actions/listings'
import { getListingContact, unlockContact } from '@/app/actions/contact'
import {
  checkIfSaved as checkIfListingSaved,
  saveListing,
  unsaveListing,
} from '@/app/actions/savedProperties'
import ScheduleVisitModal from '@/components/appointments/ScheduleVisitModal'

interface Listing {
  id: string
  property_type: string
  total_price: number
  total_sqft: number
  price_per_sqft: number
  price_type: string
  city: string
  locality: string | null
  bedrooms: number | null
  bathrooms: number | null
  description: string | null
  amenities: string[] | null
  amenities_price: number | null
  image_urls: string[]
  status: string
  created_at: string
  promoter_id: string
}

interface ContactInfo {
  unlocked: boolean
  masked_phone: string
  phone_e164?: string
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void }
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayResponse) => void
  prefill: Record<string, unknown>
  notes: Record<string, unknown>
}

interface RazorpayResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

async function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (window.Razorpay) return true

  return new Promise<boolean>((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function PropertyDetailsPage() {
  // Use useParams hook instead of Promise params
  const params = useParams()
  const listingId = params?.id as string || ''

  const router = useRouter()
  const { user } = useAuth()
  const { profile } = useUserProfile(user?.id)

  const [listing, setListing] = useState<Listing | null>(null)
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const [error, setError] = useState('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showScheduleModal, setShowScheduleModal] = useState(false)

  const isOfflineMode = process.env.NEXT_PUBLIC_USE_OFFLINE === 'true'

  useEffect(() => {
    fetchListing()
    fetchContactInfo()
    if (user) {
      checkIfSaved()
    }
  }, [listingId, user])

  const fetchListing = async () => {
    try {
      setLoading(true)

      const result = await getListingById(listingId)

      if (!result.success || !result.data) {
        setError(result.error || 'Property not found')
        return
      }

      const data = result.data as any

      // Only show LIVE listings to customers, or show own listings to promoters
      if (data.status !== 'LIVE' && (!user || data.promoter_id !== user.id)) {
        setError('This property is not available')
        return
      }

      setListing(data)
    } catch (error) {
      console.error('Error fetching listing:', error)
      setError('Failed to load property details')
    } finally {
      setLoading(false)
    }
  }

  const fetchContactInfo = async () => {
    try {
      const result = await getListingContact(listingId)

      if (result.success && result.data) {
        setContactInfo(result.data)
      }
    } catch (error) {
      console.error('Error fetching contact info:', error)
    }
  }

  const checkIfSaved = async () => {
    try {
      if (!user) return

      const result = await checkIfListingSaved(listingId)

      if (result.success) {
        setIsSaved(result.isSaved || false)
      }
    } catch (error) {
      console.error('Error checking saved status:', error)
    }
  }

  const handleSaveToggle = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    // Optimistic update
    setIsSaved(!isSaved)

    try {
      const result = isSaved
        ? await unsaveListing(listingId)
        : await saveListing(listingId)

      if (!result.success) {
        throw new Error(result.error || 'Failed to toggle save')
      }
    } catch (error) {
      console.error('Error toggling save:', error)
      // Revert optimistic update
      setIsSaved(!isSaved)
    }
  }

  const handleUnlock = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    try {
      setUnlocking(true)
      setError('')

      // ALWAYS FREE: Unlock contact to generate leads for sellers
      const result = await unlockContact(listingId)

      if (!result.success) {
        throw new Error(result.error || 'Failed to unlock contact')
      }

      // Successfully unlocked, refresh contact info
      await fetchContactInfo()
      setUnlocking(false)
    } catch (error) {
      console.error('Error unlocking contact:', error)
      setError(error instanceof Error ? error.message : 'Failed to unlock contact')
      setUnlocking(false)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/property/${listingId}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${listing?.property_type} in ${listing?.city}`,
          text: `Check out this property on Houlnd Realty`,
          url,
        })
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-6"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🏠</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{error}</h2>
              <p className="text-gray-900 mb-6">
                This property may have been removed or is not available.
              </p>
              <Link href="/search">
                <Button>Browse Properties</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!listing) return null

  // Safely get images array
  let images: string[] = []
  try {
    if (listing.image_urls) {
      if (typeof listing.image_urls === 'string') {
        images = JSON.parse(listing.image_urls)
      } else if (Array.isArray(listing.image_urls)) {
        images = listing.image_urls
      }
    }
  } catch (e) {
    console.error('Error parsing image_urls:', e)
    images = []
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-2xl font-bold text-blue-600">Houlnd</div>
              <div className="text-sm text-gray-900">Realty</div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/search">
                <Button variant="ghost" size="sm">
                  Back to Search
                </Button>
              </Link>
              {user && profile ? (
                <Link
                  href={
                    profile.role === 'CUSTOMER'
                      ? '/customer/dashboard'
                      : profile.role === 'PROMOTER'
                        ? '/promoter/dashboard'
                        : '/admin/dashboard'
                  }
                >
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button size="sm">Login</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Carousel */}
            <Card className="overflow-hidden">
              <div className="relative h-96 bg-gray-200">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImageIndex]}
                    alt={`${listing.property_type} in ${listing.city}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-900">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🏠</div>
                      <div className="text-lg">No images available</div>
                    </div>
                  </div>
                )}

                {/* Image Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedImageIndex((prev) =>
                          prev === 0 ? images.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg"
                    >
                      ←
                    </button>
                    <button
                      onClick={() =>
                        setSelectedImageIndex((prev) =>
                          prev === images.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg"
                    >
                      →
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImageIndex === index
                          ? 'border-blue-600'
                          : 'border-transparent'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Property Details */}
            <Card>
              <CardContent className="pt-6">
                {/* Title */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {listing.property_type} in {listing.city}
                    </h1>
                    {listing.locality && (
                      <p className="text-lg text-gray-900 mt-1">{listing.locality}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveToggle}
                      className="p-2 rounded-full hover:bg-gray-100"
                      title={isSaved ? 'Unsave' : 'Save'}
                    >
                      {isSaved ? '❤️' : '🤍'}
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-full hover:bg-gray-100"
                      title="Share"
                    >
                      🔗
                    </button>
                  </div>
                </div>

                {/* Price Badges */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                    <div className="text-sm text-gray-800">Total Price</div>
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{listing.total_price.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                    <div className="text-sm text-gray-800">Price per sq.ft</div>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{Math.round(listing.price_per_sqft).toLocaleString('en-IN')}
                    </div>
                  </div>
                  {listing.price_type === 'NEGOTIABLE' && (
                    <div className="flex items-center">
                      <Badge variant="success">Negotiable</Badge>
                    </div>
                  )}
                </div>

                {/* Property Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-900">Area</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {listing.total_sqft.toLocaleString('en-IN')} sq.ft
                    </div>
                  </div>
                  {listing.bedrooms !== null && (
                    <div>
                      <div className="text-sm text-gray-900">Bedrooms</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {listing.bedrooms} BHK
                      </div>
                    </div>
                  )}
                  {listing.bathrooms !== null && (
                    <div>
                      <div className="text-sm text-gray-900">Bathrooms</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {listing.bathrooms}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-900">Price Type</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {listing.price_type}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {listing.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-900 leading-relaxed whitespace-pre-line">
                      {listing.description}
                    </p>
                  </div>
                )}

                {/* Amenities */}
                {listing.amenities && listing.amenities.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {listing.amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="text-xl">✓</div>
                          <div className="text-sm text-gray-900">{amenity}</div>
                        </div>
                      ))}
                    </div>
                    {listing.amenities_price !== null && listing.amenities_price > 0 && (
                      <div className="mt-3 text-sm text-gray-900">
                        Amenities Price: ₹
                        {listing.amenities_price.toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact & Actions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h3>

                {contactInfo?.unlocked ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm text-gray-900 mb-1">Seller Phone</div>
                      <div className="text-xl font-semibold text-gray-900">
                        {contactInfo.phone_e164}
                      </div>
                    </div>

                    <Button className="w-full" size="lg">
                      📞 Call Now
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                      onClick={() => setShowScheduleModal(true)}
                    >
                      📅 Schedule Visit
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="text-sm text-gray-900 mb-1">Seller Phone</div>
                      <div className="text-xl font-semibold text-gray-900">
                        {contactInfo?.masked_phone || '+91******00'}
                      </div>
                      <div className="text-xs text-gray-900 mt-2">
                        Contact details are hidden
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleUnlock}
                      isLoading={unlocking}
                      disabled={unlocking}
                    >
                      🔓 View Seller Contact (FREE)
                    </Button>

                    <div className="text-xs text-gray-900 text-center">
                      100% Free - No charges to connect with sellers
                    </div>
                  </div>
                )}

                {/* Property Meta */}
                <div className="mt-6 pt-6 border-t space-y-2 text-sm text-gray-900">
                  <div>
                    <span className="font-medium">Property ID:</span> {listing.id.slice(0, 8)}
                    ...
                  </div>
                  <div>
                    <span className="font-medium">Listed on:</span>{' '}
                    {new Date(listing.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Schedule Visit Modal */}
      {showScheduleModal && listing && (
        <ScheduleVisitModal
          listingId={listing.id}
          listingTitle={
            listing.description?.split('\n')[0] ||
            `${listing.bedrooms || 0} BHK ${listing.property_type} in ${listing.locality || listing.city}`
          }
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => {
            // Optionally show a success message or redirect
            alert('Visit scheduled successfully! Check your appointments page.')
          }}
        />
      )}
    </div>
  )
}
