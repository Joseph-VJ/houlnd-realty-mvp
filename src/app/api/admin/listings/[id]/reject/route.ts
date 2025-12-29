import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireRole, unauthorizedResponse, forbiddenResponse } from '@/lib/apiAuth'

const prisma = new PrismaClient()

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    // Require ADMIN role
    const user = await requireRole(req, 'ADMIN')

    const { id } = await context.params
    const body = await req.json()
    const { rejection_reason } = body

    // Update listing status to REJECTED and record who rejected it
    const listing = await prisma.listing.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: rejection_reason || 'Not specified',
        reviewedAt: new Date(),
        reviewedBy: user.userId
      },
      select: { id: true, status: true, promoterId: true },
    })

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      listing
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

    console.error('Error rejecting listing:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reject listing'
      },
      { status: 500 }
    )
  }
}
