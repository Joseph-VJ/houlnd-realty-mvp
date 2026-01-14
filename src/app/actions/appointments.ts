/**
 * Appointment Server Actions
 *
 * Complete appointment booking system for property visits.
 * Supports both online (Supabase) and offline (Prisma) modes.
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import * as jose from 'jose'

const isOfflineMode = process.env.USE_OFFLINE === 'true'

/**
 * Get current user ID from session
 */
async function getCurrentUserId(): Promise<string | null> {
  if (isOfflineMode) {
    const cookieStore = await cookies()
    const token = cookieStore.get('offline_token')?.value
    if (!token) return null

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'offline-test-secret-key')
      const { payload } = await jose.jwtVerify(token, secret)
      return payload.sub as string
    } catch {
      return null
    }
  }

  const supabase: any = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id || null
}

interface AppointmentData {
  scheduledDate: string // ISO date string
  scheduledTime: string // Time in format "HH:MM"
  visitorName: string
  visitorPhone: string
  visitorEmail?: string
  message?: string
}

/**
 * Create a new appointment
 */
export async function createAppointment(
  listingId: string,
  appointmentData: AppointmentData
): Promise<{ success: boolean; error?: string; appointmentId?: string }> {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in to schedule an appointment',
      }
    }

    if (isOfflineMode) {
      // OFFLINE MODE: Use Prisma
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        // Get listing to find promoter ID
        const listing = await prisma.listing.findUnique({
          where: { id: listingId },
          select: { promoterId: true },
        })

        if (!listing) {
          await prisma.$disconnect()
          return {
            success: false,
            error: 'Property not found',
          }
        }

        // Combine date and time into DateTime objects
        const scheduledDateTime = new Date(`${appointmentData.scheduledDate}T${appointmentData.scheduledTime}:00`)
        const scheduledEndTime = new Date(scheduledDateTime)
        scheduledEndTime.setHours(scheduledEndTime.getHours() + 1) // 1 hour appointment

        // Create appointment
        const appointment = await prisma.appointment.create({
          data: {
            listingId,
            customerId: userId,
            promoterId: listing.promoterId,
            scheduledStart: scheduledDateTime,
            scheduledEnd: scheduledEndTime,
            status: 'PENDING',
            customerNotes: appointmentData.message || null,
          },
        })

        await prisma.$disconnect()

        return {
          success: true,
          appointmentId: appointment.id,
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    // ONLINE MODE: Use Supabase
    const supabase: any = await createClient()

    // Get listing to find promoter ID
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('promoter_id')
      .eq('id', listingId)
      .single()

    if (listingError || !listing) {
      return {
        success: false,
        error: 'Property not found',
      }
    }

    const promoterId = (listing as any).promoter_id

    // Combine date and time
    const scheduledDateTime = `${appointmentData.scheduledDate}T${appointmentData.scheduledTime}:00`
    const scheduledStart = new Date(scheduledDateTime)
    const scheduledEnd = new Date(scheduledStart)
    scheduledEnd.setHours(scheduledEnd.getHours() + 1)

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        listing_id: listingId,
        customer_id: userId,
        promoter_id: promoterId,
        scheduled_start: scheduledStart.toISOString(),
        scheduled_end: scheduledEnd.toISOString(),
        status: 'PENDING',
        customer_notes: appointmentData.message || null,
      } as any)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      appointmentId: (data as any)?.id,
    }
  } catch (error) {
    console.error('Create appointment error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create appointment',
    }
  }
}

/**
 * Get customer's appointments
 */
export async function getCustomerAppointments(): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in',
      }
    }

    if (isOfflineMode) {
      // OFFLINE MODE: Use Prisma
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        const appointments = await prisma.appointment.findMany({
          where: { customerId: userId },
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                propertyType: true,
                city: true,
                locality: true,
                imageUrls: true,
              },
            },
            promoter: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phoneE164: true,
              },
            },
          },
          orderBy: { scheduledStart: 'desc' },
        })

        await prisma.$disconnect()

        // Transform to match expected format
        const transformed = appointments.map((apt: any) => ({
          id: apt.id,
          listing_id: apt.listingId,
          customer_id: apt.customerId,
          promoter_id: apt.promoterId,
          scheduled_start: apt.scheduledStart.toISOString(),
          scheduled_end: apt.scheduledEnd.toISOString(),
          status: apt.status,
          customer_notes: apt.customerNotes,
          promoter_notes: apt.promoterNotes,
          created_at: apt.createdAt.toISOString(),
          listing: {
            id: apt.listing.id,
            title: apt.listing.title,
            property_type: apt.listing.propertyType,
            city: apt.listing.city,
            locality: apt.listing.locality,
            image_urls: JSON.parse(apt.listing.imageUrls || '[]'),
          },
          promoter: apt.promoter,
        }))

        return {
          success: true,
          data: transformed,
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    // ONLINE MODE: Use Supabase
    const supabase: any = await createClient()
    const { data, error } = await supabase
      .from('appointments')
      .select(
        `
        *,
        listing:listings(id, title, property_type, city, locality, image_urls),
        promoter:users!promoter_id(id, full_name, email, phone_e164)
      `
      )
      .eq('customer_id', userId)
      .order('scheduled_start', { ascending: false })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      data: data || [],
    }
  } catch (error) {
    console.error('Get customer appointments error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch appointments',
    }
  }
}

/**
 * Get promoter's appointments (for their properties)
 */
export async function getPromoterAppointments(): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in',
      }
    }

    if (isOfflineMode) {
      // OFFLINE MODE: Use Prisma
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        const appointments = await prisma.appointment.findMany({
          where: { promoterId: userId },
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                propertyType: true,
                city: true,
                locality: true,
                imageUrls: true,
              },
            },
            customer: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phoneE164: true,
              },
            },
          },
          orderBy: { scheduledStart: 'desc' },
        })

        await prisma.$disconnect()

        // Transform to match expected format
        const transformed = appointments.map((apt: any) => ({
          id: apt.id,
          listing_id: apt.listingId,
          customer_id: apt.customerId,
          promoter_id: apt.promoterId,
          scheduled_start: apt.scheduledStart.toISOString(),
          scheduled_end: apt.scheduledEnd.toISOString(),
          status: apt.status,
          customer_notes: apt.customerNotes,
          promoter_notes: apt.promoterNotes,
          created_at: apt.createdAt.toISOString(),
          listing: {
            id: apt.listing.id,
            title: apt.listing.title,
            property_type: apt.listing.propertyType,
            city: apt.listing.city,
            locality: apt.listing.locality,
            image_urls: JSON.parse(apt.listing.imageUrls || '[]'),
          },
          customer: apt.customer,
        }))

        return {
          success: true,
          data: transformed,
        }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    // ONLINE MODE: Use Supabase
    const supabase: any = await createClient()
    const { data, error } = await supabase
      .from('appointments')
      .select(
        `
        *,
        listing:listings(id, title, property_type, city, locality, image_urls),
        customer:users!customer_id(id, full_name, email, phone_e164)
      `
      )
      .eq('promoter_id', userId)
      .order('scheduled_start', { ascending: false })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      data: data || [],
    }
  } catch (error) {
    console.error('Get promoter appointments error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch appointments',
    }
  }
}

/**
 * Update appointment status (Accept/Reject by promoter)
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: 'ACCEPTED' | 'REJECTED',
  promoterNotes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in',
      }
    }

    if (isOfflineMode) {
      // OFFLINE MODE: Use Prisma
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        // Verify the appointment belongs to this promoter
        const appointment = await prisma.appointment.findUnique({
          where: { id: appointmentId },
        })

        if (!appointment) {
          await prisma.$disconnect()
          return {
            success: false,
            error: 'Appointment not found',
          }
        }

        if (appointment.promoterId !== userId) {
          await prisma.$disconnect()
          return {
            success: false,
            error: 'You can only update your own appointments',
          }
        }

        // Update the appointment
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: {
            status,
            promoterNotes: promoterNotes || null,
          },
        })

        await prisma.$disconnect()

        return { success: true }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    // ONLINE MODE: Use Supabase
    const supabase: any = await createClient()

    // Verify ownership
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('promoter_id')
      .eq('id', appointmentId)
      .single()

    if (fetchError || !appointment) {
      return {
        success: false,
        error: 'Appointment not found',
      }
    }

    if ((appointment as any).promoter_id !== userId) {
      return {
        success: false,
        error: 'You can only update your own appointments',
      }
    }

    // Update status
    const updateData: any = {
      status,
      promoter_notes: promoterNotes || null,
    }
    const { error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Update appointment status error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update appointment',
    }
  }
}

/**
 * Cancel appointment (by customer)
 */
export async function cancelAppointment(
  appointmentId: string,
  cancellationReason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in',
      }
    }

    if (isOfflineMode) {
      // OFFLINE MODE: Use Prisma
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      try {
        // Verify the appointment belongs to this customer
        const appointment = await prisma.appointment.findUnique({
          where: { id: appointmentId },
        })

        if (!appointment) {
          await prisma.$disconnect()
          return {
            success: false,
            error: 'Appointment not found',
          }
        }

        if (appointment.customerId !== userId) {
          await prisma.$disconnect()
          return {
            success: false,
            error: 'You can only cancel your own appointments',
          }
        }

        // Update the appointment
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
            cancelledBy: userId,
            cancellationReason: cancellationReason || null,
          },
        })

        await prisma.$disconnect()

        return { success: true }
      } catch (error) {
        await prisma.$disconnect()
        throw error
      }
    }

    // ONLINE MODE: Use Supabase
    const supabase: any = await createClient()

    // Verify ownership
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('customer_id')
      .eq('id', appointmentId)
      .single()

    if (fetchError || !appointment) {
      return {
        success: false,
        error: 'Appointment not found',
      }
    }

    if ((appointment as any).customer_id !== userId) {
      return {
        success: false,
        error: 'You can only cancel your own appointments',
      }
    }

    // Cancel appointment
    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'CANCELLED',
        cancelled_at: new Date().toISOString(),
        cancelled_by: userId,
        cancellation_reason: cancellationReason || null,
      } as any)
      .eq('id', appointmentId)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Cancel appointment error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel appointment',
    }
  }
}
