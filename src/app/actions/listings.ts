/**
 * Listing Server Actions
 *
 * This file contains all server-side listing/property actions.
 * Supports both online (Supabase) and offline (Prisma) modes.
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import * as jose from 'jose'

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
  status: string
}

interface SearchFilters {
  minPpsf?: string
  maxPpsf?: string
  city?: string
  propertyType?: string
  bedrooms?: string
  minPrice?: string
  maxPrice?: string
  sortBy?: string
}

const isOfflineMode = process.env.USE_OFFLINE === 'true'

/**
 * Search/fetch listings with filters
 */
export async function searchListings(filters: SearchFilters) {
  try {
    if (isOfflineMode) {
      // OFFLINE MODE: Use Prisma
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        // Build where clause
        const where: any = {
          status: 'LIVE'
        }

        if (filters.city) {
          where.city = filters.city
        }

        if (filters.propertyType) {
          where.propertyType = filters.propertyType
        }

        if (filters.bedrooms) {
          where.bedrooms = parseInt(filters.bedrooms)
        }

        if (filters.minPpsf || filters.maxPpsf) {
          where.pricePerSqft = {}
          if (filters.minPpsf) {
            where.pricePerSqft.gte = parseFloat(filters.minPpsf)
          }
          if (filters.maxPpsf) {
            where.pricePerSqft.lte = parseFloat(filters.maxPpsf)
          }
        }

        if (filters.minPrice || filters.maxPrice) {
          where.totalPrice = {}
          if (filters.minPrice) {
            where.totalPrice.gte = parseFloat(filters.minPrice)
          }
          if (filters.maxPrice) {
            where.totalPrice.lte = parseFloat(filters.maxPrice)
          }
        }

        // Build orderBy
        let orderBy: any = { createdAt: 'desc' } // default: newest first

        if (filters.sortBy === 'price_asc') {
          orderBy = { totalPrice: 'asc' }
        } else if (filters.sortBy === 'price_desc') {
          orderBy = { totalPrice: 'desc' }
        } else if (filters.sortBy === 'ppsf_asc') {
          orderBy = { pricePerSqft: 'asc' }
        } else if (filters.sortBy === 'ppsf_desc') {
          orderBy = { pricePerSqft: 'desc' }
        }

        const listings = await prisma.listing.findMany({
          where,
          orderBy,
          take: 100 // limit results
        })

        await prisma.$disconnect()

        // Transform to match expected format
        const transformedListings = listings.map((listing: any) => ({
          id: listing.id,
          property_type: listing.propertyType,
          city: listing.city || '',
          locality: listing.locality,
          total_price: listing.totalPrice,
          total_sqft: listing.totalSqft,
          price_per_sqft: listing.pricePerSqft,
          image_urls: JSON.parse(listing.imageUrls || '[]'),
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          created_at: listing.createdAt.toISOString(),
          status: listing.status
        }))

        return {
          success: true,
          data: transformedListings
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    // ONLINE MODE: Use Supabase
    const supabase = await createClient()

    let query = supabase
      .from('listings')
      .select('*')
      .eq('status', 'LIVE')

    // Apply filters
    if (filters.minPpsf) {
      query = query.gte('price_per_sqft', parseFloat(filters.minPpsf))
    }
    if (filters.maxPpsf) {
      query = query.lte('price_per_sqft', parseFloat(filters.maxPpsf))
    }
    if (filters.city) {
      query = query.eq('city', filters.city)
    }
    if (filters.propertyType) {
      query = query.eq('property_type', filters.propertyType)
    }
    if (filters.bedrooms) {
      query = query.eq('bedrooms', parseInt(filters.bedrooms))
    }
    if (filters.minPrice) {
      query = query.gte('total_price', parseFloat(filters.minPrice))
    }
    if (filters.maxPrice) {
      query = query.lte('total_price', parseFloat(filters.maxPrice))
    }

    // Apply sorting
    if (filters.sortBy === 'price_asc') {
      query = query.order('total_price', { ascending: true })
    } else if (filters.sortBy === 'price_desc') {
      query = query.order('total_price', { ascending: false })
    } else if (filters.sortBy === 'ppsf_asc') {
      query = query.order('price_per_sqft', { ascending: true })
    } else if (filters.sortBy === 'ppsf_desc') {
      query = query.order('price_per_sqft', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false }) // newest first
    }

    const { data, error } = await query.limit(100)

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      data: data || []
    }
  } catch (error) {
    console.error('Search listings error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search listings'
    }
  }
}
/**
 * Get listings for a specific promoter
 */
export async function getPromoterListings() {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const token = cookieStore.get('offline_token')?.value
    
    let userId: string | null = null

    if (isOfflineMode) {
      if (token) {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'offline-test-secret-key')
        const { payload } = await jose.jwtVerify(token, secret)
        userId = payload.sub as string
      }
    } else {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id || null
    }

    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    if (isOfflineMode) {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        const listings = await prisma.listing.findMany({
          where: { promoterId: userId },
          orderBy: { createdAt: 'desc' }
        })

        await prisma.$disconnect()

        return {
          success: true,
          data: listings.map((l: any) => ({
            id: l.id,
            property_type: l.propertyType,
            city: l.city || '',
            locality: l.locality,
            total_price: l.totalPrice,
            total_sqft: l.totalSqft,
            price_per_sqft: l.pricePerSqft,
            status: l.status,
            created_at: l.createdAt.toISOString(),
            image_urls: JSON.parse(l.imageUrls || '[]'),
            view_count: l.viewCount,
            unlock_count: l.unlockCount,
            save_count: l.saveCount
          }))
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('promoter_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error in getPromoterListings:', error)
    return { success: false, error: 'Failed to fetch listings' }
  }
}
/**
 * Get single listing by ID
 */
export async function getListingById(listingId: string) {
  try {
    if (isOfflineMode) {
      // OFFLINE MODE: Use Prisma
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        const listing = await prisma.listing.findUnique({
          where: { id: listingId },
          include: {
            promoter: {
              select: {
                id: true,
                fullName: true,
                phoneE164: true
              }
            }
          }
        })

        await prisma.$disconnect()

        if (!listing) {
          return {
            success: false,
            error: 'Property not found'
          }
        }

        // Transform to match expected format
        const transformed = {
          id: listing.id,
          property_type: listing.propertyType,
          city: listing.city || '',
          locality: listing.locality,
          total_price: listing.totalPrice,
          total_sqft: listing.totalSqft,
          price_per_sqft: listing.pricePerSqft,
          price_type: listing.priceType,
          image_urls: JSON.parse(listing.imageUrls || '[]'),
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          description: listing.description,
          amenities: listing.amenitiesJson ? JSON.parse(listing.amenitiesJson) : null,
          amenities_price: listing.amenitiesPrice,
          furnishing: listing.furnishing,
          possession_status: listing.possessionStatus,
          age_years: listing.ageYears,
          parking_count: listing.parkingCount,
          title: listing.title,
          status: listing.status,
          created_at: listing.createdAt.toISOString(),
          promoter_id: listing.promoterId,
          promoter: listing.promoter
        }

        return {
          success: true,
          data: transformed
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    // ONLINE MODE: Use Supabase
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        promoter:users!promoter_id(id, full_name, phone_e164)
      `)
      .eq('id', listingId)
      .single()

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    if (!data) {
      return {
        success: false,
        error: 'Property not found'
      }
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Get listing by ID error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch property'
    }
  }
}

/**
 * Get all listings (admin only) with filters and pagination
 */
export async function getAllListings(
  status?: string,
  page: number = 1,
  limit: number = 20,
  searchQuery?: string
) {
  try {
    if (isOfflineMode) {
      // OFFLINE MODE: Use Prisma
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        // Build where clause
        const where: any = {}

        // Filter by status if provided
        if (status && status !== 'all') {
          where.status = status
        }

        // Search query (property type, city, locality)
        if (searchQuery) {
          where.OR = [
            { propertyType: { contains: searchQuery, mode: 'insensitive' } },
            { city: { contains: searchQuery, mode: 'insensitive' } },
            { locality: { contains: searchQuery, mode: 'insensitive' } },
            { title: { contains: searchQuery, mode: 'insensitive' } }
          ]
        }

        // Get total count for pagination
        const totalCount = await prisma.listing.count({ where })

        // Get paginated listings with promoter details
        const listings = await prisma.listing.findMany({
          where,
          include: {
            promoter: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phoneE164: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        })

        await prisma.$disconnect()

        // Transform to match expected format
        const transformedListings = listings.map((listing: any) => ({
          id: listing.id,
          property_type: listing.propertyType,
          city: listing.city || '',
          locality: listing.locality,
          total_price: listing.totalPrice,
          total_sqft: listing.totalSqft,
          price_per_sqft: listing.pricePerSqft,
          price_type: listing.priceType,
          image_urls: JSON.parse(listing.imageUrls || '[]'),
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          title: listing.title,
          status: listing.status,
          created_at: listing.createdAt.toISOString(),
          promoter_id: listing.promoterId,
          promoter: listing.promoter
        }))

        return {
          success: true,
          data: transformedListings,
          pagination: {
            total: totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit)
          }
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    // ONLINE MODE: Use Supabase
    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('listings')
      .select(`
        *,
        promoter:users!promoter_id(id, full_name, email, phone_e164)
      `, { count: 'exact' })

    // Filter by status
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Search query
    if (searchQuery) {
      query = query.or(`property_type.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,locality.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to).order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  } catch (error) {
    console.error('Get all listings error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch listings'
    }
  }
}

/**
 * Get popular cities (for filter dropdown)
 */
export async function getPopularCities() {
  try {
    if (isOfflineMode) {
      // OFFLINE MODE: Use Prisma
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        const cities = await prisma.listing.groupBy({
          by: ['city'],
          where: {
            status: 'LIVE',
            city: {
              not: null
            }
          },
          _count: true,
          orderBy: {
            _count: {
              city: 'desc'
            }
          },
          take: 20
        })

        await prisma.$disconnect()

        return {
          success: true,
          data: cities.map((c: any) => c.city).filter(Boolean)
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    // ONLINE MODE: Use Supabase RPC
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_popular_cities')

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      data: (data as any)?.map((c: any) => c.city) || []
    }
  } catch (error) {
    console.error('Get popular cities error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch cities',
      data: []
    }
  }
}
