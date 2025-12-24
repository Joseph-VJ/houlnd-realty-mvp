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

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'

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

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const supabase = createClient()

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
      const { data, error } = await supabase.rpc('get_popular_cities')
      if (error) throw error
      setCities(data?.map((c: any) => c.city) || [])
    } catch (error) {
      console.error('Error fetching cities:', error)
    }
  }

  const fetchSavedProperties = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('saved_properties')
        .select('listing_id')
        .eq('user_id', user.id)

      if (error) throw error

      setSavedPropertyIds(new Set(data?.map((sp: { listing_id: string }) => sp.listing_id) || []))
    } catch (error) {
      console.error('Error fetching saved properties:', error)
    }
  }

  const fetchListings = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('listings')
        .select('*')
        .eq('status', 'LIVE')

      // Apply filters
      if (minPpsf) {
        query = query.gte('price_per_sqft', parseFloat(minPpsf))
      }
      if (maxPpsf) {
        query = query.lte('price_per_sqft', parseFloat(maxPpsf))
      }
      if (city) {
        query = query.eq('city', city)
      }
      if (propertyType) {
        query = query.eq('property_type', propertyType)
      }
      if (bedrooms) {
        query = query.eq('bedrooms', parseInt(bedrooms))
      }
      if (minPrice) {
        query = query.gte('total_price', parseFloat(minPrice))
      }
      if (maxPrice) {
        query = query.lte('total_price', parseFloat(maxPrice))
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'price_asc':
          query = query.order('total_price', { ascending: true })
          break
        case 'price_desc':
          query = query.order('total_price', { ascending: false })
          break
        case 'ppsf_asc':
          query = query.order('price_per_sqft', { ascending: true })
          break
        case 'ppsf_desc':
          query = query.order('price_per_sqft', { ascending: false })
          break
      }

      const { data, error } = await query

      if (error) throw error

      setListings(data || [])
    } catch (error) {
      console.error('Error fetching listings:', error)
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
        // Unsave
        const { error } = await supabase
          .from('saved_properties')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId)

        if (error) throw error

        setSavedPropertyIds((prev) => {
          const newSet = new Set(prev)
          newSet.delete(listingId)
          return newSet
        })
      } else {
        // Save
        const { error } = await supabase
          .from('saved_properties')
          .insert({ user_id: user.id, listing_id: listingId })

        if (error) throw error

        setSavedPropertyIds((prev) => new Set(prev).add(listingId))
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-2xl font-bold text-blue-600">Houlnd</div>
              <div className="text-sm text-gray-500">Realty</div>
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
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Search Properties</h1>
          <p className="text-gray-600 mt-2">
            Find your perfect property with transparent price per square foot
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* PRIMARY USP: Sq.ft Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      💰 Price per Sq.ft (PRIMARY FILTER)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="number"
                        value={minPpsf}
                        onChange={(e) => setMinPpsf(e.target.value)}
                        placeholder="Min ₹/sq.ft"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={maxPpsf}
                        onChange={(e) => setMaxPpsf(e.target.value)}
                        placeholder="Max ₹/sq.ft"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type
                    </label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrooms
                    </label>
                    <select
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Price
                    </label>
                    <div className="space-y-2">
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="Min Price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="Max Price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-16">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No properties found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your filters to see more results.
                    </p>
                    {hasFilters && (
                      <Button onClick={clearFilters}>Clear All Filters</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                      {/* Save Button */}
                      <button
                        onClick={() => handleSaveToggle(listing.id)}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                        title={savedPropertyIds.has(listing.id) ? 'Remove from saved' : 'Save property'}
                      >
                        <span className="text-xl">
                          {savedPropertyIds.has(listing.id) ? '❤️' : '🤍'}
                        </span>
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
                          <span className="font-medium">
                            ₹{listing.total_price.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Area:</span>
                          <span className="font-medium">
                            {listing.total_sqft.toLocaleString('en-IN')} sq.ft
                          </span>
                        </div>
                        {listing.bedrooms && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Bedrooms:</span>
                            <span className="font-medium">{listing.bedrooms} BHK</span>
                          </div>
                        )}
                      </div>

                      {/* View Button */}
                      <Link href={`/property/${listing.id}`}>
                        <Button className="w-full">View Details</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
