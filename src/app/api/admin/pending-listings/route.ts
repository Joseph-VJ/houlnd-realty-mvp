/**
 * API Route: Get Pending Listings for Admin
 *
 * Returns all listings with status PENDING_VERIFICATION
 * Includes promoter information
 * Requires ADMIN role
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireRole, unauthorizedResponse, forbiddenResponse } from '@/lib/apiAuth'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    // Require ADMIN role
    const user = await requireRole(req, 'ADMIN')

    const listings = await prisma.listing.findMany({
      where: {
        status: 'PENDING_VERIFICATION'
      },
      include: {
        promoter: {
          select: {
            fullName: true,
            email: true,
            phoneE164: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform to match expected format
    const transformedListings = listings.map((listing: any) => ({
      id: listing.id,
      property_type: listing.propertyType,
      city: listing.city,
      locality: listing.locality,
      total_price: listing.totalPrice,
      total_sqft: listing.totalSqft,
      price_per_sqft: listing.pricePerSqft,
      price_type: listing.priceType,
      image_urls: JSON.parse(listing.imageUrls || '[]'),
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      description: listing.description,
      created_at: listing.createdAt.toISOString(),
      promoter_id: listing.promoterId,
      promoter: {
        full_name: listing.promoter.fullName,
        email: listing.promoter.email,
        phone_e164: listing.promoter.phoneE164
      }
    }))

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      listings: transformedListings
    })
  } catch (error) {
    await prisma.$disconnect()

    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return unauthorizedResponse(error.message)
      }
      if (error.message.includes('Forbidden')) {
        return forbiddenResponse(error.message)
      }
    }

    console.error('Error fetching pending listings:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch pending listings'
      },
      { status: 500 }
    )
  }
}
