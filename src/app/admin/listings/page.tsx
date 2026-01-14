/**
 * Admin All Listings Page
 *
 * Comprehensive listings management interface for admins.
 * Features:
 * - View all properties (all statuses)
 * - Filter by status (All, Live, Pending, Rejected, Draft)
 * - Search by property type, city, locality
 * - Pagination support (20 per page)
 * - View promoter details
 * - Quick actions (View, Change Status)
 */

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getAllListings } from '@/app/actions/listings'

interface Listing {
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
  title: string | null
  status: string
  created_at: string
  promoter_id: string
  promoter: {
    id: string
    fullName?: string
    full_name?: string
    email: string
    phoneE164?: string
    phone_e164?: string
  }
}

export default function AdminListingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [activeStatus, setActiveStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Status filter options
  const statusFilters = [
    { value: 'all', label: 'All', color: 'bg-gray-100 text-gray-800' },
    { value: 'LIVE', label: 'Live', color: 'bg-green-100 text-green-800' },
    { value: 'PENDING_VERIFICATION', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 'DRAFT', label: 'Draft', color: 'bg-gray-100 text-gray-600' }
  ]

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Fetch listings when filters or page change
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchListings()
    }
  }, [user, activeStatus, searchQuery, currentPage])

  const fetchListings = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await getAllListings(
        activeStatus,
        currentPage,
        20,
        searchQuery || undefined
      )

      if (result.success && result.data) {
        setListings(result.data)
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages)
          setTotalCount(result.pagination.total)
        }
      } else {
        setError(result.error || 'Failed to load listings')
      }
    } catch (err) {
      setError('An error occurred while loading listings')
      console.error('Fetch listings error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchInput)
    setCurrentPage(1) // Reset to first page on new search
  }

  const handleStatusChange = (status: string) => {
    setActiveStatus(status)
    setCurrentPage(1) // Reset to first page on filter change
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'LIVE':
        return 'bg-green-100 text-green-800'
      case 'PENDING_VERIFICATION':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lac`
    }
    return `₹${price.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (authLoading || (user?.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Listings</h1>
              <p className="text-gray-600 mt-1">
                Manage all property listings ({totalCount} total)
              </p>
            </div>
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-full font-bold hover:bg-gray-50 transition-all hover:scale-105">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Status Filter Tabs */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleStatusChange(filter.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeStatus === filter.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search by property type, city, locality, or title..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400"
            />
            <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/30 hover:scale-105">
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('')
                  setSearchQuery('')
                  setCurrentPage(1)
                }}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-bold hover:bg-gray-50 transition-all hover:scale-105"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">Loading listings...</p>
          </div>
        )}

        {/* Listings Grid */}
        {!loading && listings.length === 0 && (
          <div className="bg-white rounded-lg border p-12 text-center">
            <p className="text-gray-600">No listings found</p>
            {searchQuery && (
              <p className="text-gray-500 text-sm mt-2">
                Try adjusting your search or filters
              </p>
            )}
          </div>
        )}

        {!loading && listings.length > 0 && (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-lg border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex gap-6">
                    {/* Property Image */}
                    <div className="flex-shrink-0">
                      <div className="relative w-48 h-36 rounded-lg overflow-hidden bg-gray-100">
                        {listing.image_urls && listing.image_urls[0] ? (
                          <Image
                            src={listing.image_urls[0]}
                            alt={listing.title || listing.property_type}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {listing.title || `${listing.property_type} in ${listing.city}`}
                          </h3>
                          <p className="text-gray-600">
                            {listing.locality && `${listing.locality}, `}{listing.city}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                            listing.status
                          )}`}
                        >
                          {listing.status}
                        </span>
                      </div>

                      {/* Property Stats */}
                      <div className="grid grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-700 mb-1">Total Price</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatPrice(listing.total_price)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-700 mb-1">Area</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {listing.total_sqft} sqft
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-700 mb-1">Bedrooms</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {listing.bedrooms || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-700 mb-1">Bathrooms</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {listing.bathrooms || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Promoter Details */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700 mb-1">Promoter</p>
                        <p className="font-medium text-gray-900">
                          {listing.promoter.fullName || listing.promoter.full_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {listing.promoter.email}
                        </p>
                        {(listing.promoter.phoneE164 || listing.promoter.phone_e164) && (
                          <p className="text-sm text-gray-600">
                            {listing.promoter.phoneE164 || listing.promoter.phone_e164}
                          </p>
                        )}
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Posted: {formatDate(listing.created_at)}</span>
                        <span>•</span>
                        <span>ID: {listing.id.substring(0, 8)}...</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex flex-col gap-2">
                      <Link href={`/property/${listing.id}`} className="w-full px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-full font-bold hover:bg-gray-50 transition-all hover:scale-105 text-center">
                        View Details
                      </Link>
                      {listing.status === 'PENDING_VERIFICATION' && (
                        <Link href="/admin/pending-listings" className="w-full px-6 py-2.5 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/30 hover:scale-105 text-center">
                          Review
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Page {currentPage} of {totalPages} ({totalCount} total listings)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-full font-bold hover:bg-gray-50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-full font-bold hover:bg-gray-50 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
