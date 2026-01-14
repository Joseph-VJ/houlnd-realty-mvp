/**
 * Property Search Page
 *
 * Features:
 * - PRIMARY USP: Sq.ft price filter (min/max range)
 * - Additional filters: City, Property Type, Bedrooms, Total Price Range
 * - Property cards with images, details, save button
 * - Sorting: Newest, Price (low to high, high to low), Price/sqft
 * - Responsive grid layout
 * - Clear filters button
 * - Only shows LIVE listings
 */

'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { searchListings, getPopularCities } from '@/app/actions/listings'
import { saveListing, unsaveListing, getSavedListingIds } from '@/app/actions/savedProperties'

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
  created_at: string
}

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'ppsf_asc' | 'ppsf_desc'

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  // Filter states
  const [minPpsf, setMinPpsf] = useState(searchParams.get('minPpsf') || '')
  const [maxPpsf, setMaxPpsf] = useState(searchParams.get('maxPpsf') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || '')
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  // Data states
  const [listings, setListings] = useState<Listing[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [savedPropertyIds, setSavedPropertyIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchCities()
    if (user) {
      fetchSavedProperties()
    }
  }, [user])

  useEffect(() => {
    fetchListings()
  }, [minPpsf, maxPpsf, city, propertyType, bedrooms, minPrice, maxPrice, sortBy])

  const fetchCities = async () => {
    try {
      const result = await getPopularCities()
      if (result.success && result.data) {
        setCities(result.data)
      }
    } catch (error) {
      console.error('Error fetching cities:', error)
    }
  }

  const fetchSavedProperties = async () => {
    if (!user) return

    try {
      const result = await getSavedListingIds()

      if (result.success && result.data) {
        setSavedPropertyIds(new Set(result.data))
      }
    } catch (error) {
      console.error('Error fetching saved properties:', error)
      // Continue without saved properties if there's an error
    }
  }

  const fetchListings = async () => {
    try {
      setLoading(true)

      const result = await searchListings({
        minPpsf,
        maxPpsf,
        city,
        propertyType,
        bedrooms,
        minPrice,
        maxPrice,
        sortBy
      })

      if (result.success && result.data) {
        setListings(result.data)
      } else {
        console.error('Error fetching listings:', result.error)
        setListings([])
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
      setListings([])
    } finally {
      setLoading(false)
    }
  }

  const handleSaveToggle = async (listingId: string) => {
    if (!user) {
      router.push('/login?redirectedFrom=/search')
      return
    }

    try {
      const isSaved = savedPropertyIds.has(listingId)

      if (isSaved) {
        // Unsave using server action
        const result = await unsaveListing(listingId)

        if (result.success) {
          setSavedPropertyIds((prev) => {
            const newSet = new Set(prev)
            newSet.delete(listingId)
            return newSet
          })
        } else {
          console.error('Error unsaving:', result.error)
        }
      } else {
        // Save using server action
        const result = await saveListing(listingId)

        if (result.success) {
          setSavedPropertyIds((prev) => new Set(prev).add(listingId))
        } else {
          console.error('Error saving:', result.error)
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error)
    }
  }

  const clearFilters = () => {
    setMinPpsf('')
    setMaxPpsf('')
    setCity('')
    setPropertyType('')
    setBedrooms('')
    setMinPrice('')
    setMaxPrice('')
    setSortBy('newest')
  }

  const hasFilters =
    minPpsf || maxPpsf || city || propertyType || bedrooms || minPrice || maxPrice

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">Search Properties</h1>
        <p className="text-lg text-gray-600">
          Find your perfect property with transparent price per square foot
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900">Filters</h3>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-5">
              {/* PRIMARY USP: Sq.ft Price */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  💰 Price per Sq.ft
                </label>
                <div className="space-y-3">
                  <input
                    type="number"
                    value={minPpsf}
                    onChange={(e) => setMinPpsf(e.target.value)}
                    placeholder="Min ₹/sq.ft"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400"
                  />
                  <input
                    type="number"
                    value={maxPpsf}
                    onChange={(e) => setMaxPpsf(e.target.value)}
                    placeholder="Max ₹/sq.ft"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                >
                  <option value="">All Cities</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                >
                  <option value="">All Types</option>
                  <option value="PLOT">Plot</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="VILLA">Villa</option>
                  <option value="HOUSE">House</option>
                  <option value="LAND">Land</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Bedrooms
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                >
                  <option value="">Any</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4 BHK</option>
                    <option value="5">5+ BHK</option>
                  </select>
                </div>

                {/* Total Price Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Price
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min Price"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder:text-gray-400"
                    />
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max Price"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {/* Sort and Count */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              {loading ? 'Loading...' : `${listings.length} properties found`}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="ppsf_asc">₹/sq.ft: Low to High</option>
              <option value="ppsf_desc">₹/sq.ft: High to Low</option>
            </select>
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="text-center py-16">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-700 mb-6">
                  Try adjusting your filters to see more results.
                </p>
                {hasFilters && (
                  <button onClick={clearFilters} className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/30 hover:scale-105">
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div key={listing.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden group">
                  {/* Image */}
                  <div className="relative h-52 bg-gray-200">
                    {listing.image_urls && listing.image_urls.length > 0 ? (
                      <img
                        src={listing.image_urls[0]}
                        alt={`${listing.property_type} in ${listing.city}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <div className="text-5xl mb-2">🏠</div>
                          <div className="text-sm font-medium">No image</div>
                        </div>
                      </div>
                    )}
                    {/* Save Button */}
                    <button
                      onClick={() => handleSaveToggle(listing.id)}
                      className="absolute top-3 right-3 p-2.5 bg-white rounded-full shadow-lg hover:scale-110 transition-all"
                      title={savedPropertyIds.has(listing.id) ? 'Remove from saved' : 'Save property'}
                    >
                      <span className="text-xl">
                        {savedPropertyIds.has(listing.id) ? '❤️' : '🤍'}
                      </span>
                    </button>
                  </div>

                  <div className="p-5">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {listing.property_type} in {listing.city}
                    </h3>
                    {listing.locality && (
                      <p className="text-sm text-gray-600 mb-3 font-medium">{listing.locality}</p>
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
                        <span className="font-bold text-gray-900">
                          ₹{listing.total_price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">Area:</span>
                        <span className="font-bold text-gray-900">
                          {listing.total_sqft.toLocaleString('en-IN')} sq.ft
                        </span>
                      </div>
                      {listing.bedrooms && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">Bedrooms:</span>
                          <span className="font-bold text-gray-900">{listing.bedrooms} BHK</span>
                        </div>
                      )}
                    </div>

                    {/* View Button */}
                    <Link href={`/property/${listing.id}`}>
                      <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-bold transition-all shadow-sm">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function SearchPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white rounded-sm transform rotate-45"></div>
              </div>
              <span className="text-xl font-bold text-gray-900">Houlnd Realty</span>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/customer/dashboard" className="text-gray-700 hover:text-gray-900">
                    Dashboard
                  </Link>
                  <Link href="/customer/saved" className="text-gray-700 hover:text-gray-900">
                    Saved
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full font-medium transition-all">
                    Login
                  </Link>
                  <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/30">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<div className="flex justify-center py-20">Loading search...</div>}>
          <SearchContent />
        </Suspense>
      </main>
    </div>
  )
}
