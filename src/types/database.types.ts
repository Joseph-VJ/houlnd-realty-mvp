/**
 * Houlnd Realty Database Types
 *
 * TypeScript type definitions for the Supabase database schema.
 *
 * IMPORTANT: After creating your Supabase project and running migrations,
 * regenerate this file using:
 *
 * ```bash
 * npx supabase gen types typescript --project-id <your-project-id> > src/types/database.types.ts
 * ```
 *
 * Or using the Supabase CLI:
 * ```bash
 * supabase gen types typescript --local > src/types/database.types.ts
 * ```
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          role: 'CUSTOMER' | 'PROMOTER' | 'ADMIN'
          phone_e164: string | null
          email: string | null
          full_name: string | null
          is_blocked: boolean
          blocked_at: string | null
          blocked_reason: string | null
          is_verified: boolean
          verified_at: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          role?: 'CUSTOMER' | 'PROMOTER' | 'ADMIN'
          phone_e164?: string | null
          email?: string | null
          full_name?: string | null
          is_blocked?: boolean
          blocked_at?: string | null
          blocked_reason?: string | null
          is_verified?: boolean
          verified_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          role?: 'CUSTOMER' | 'PROMOTER' | 'ADMIN'
          phone_e164?: string | null
          email?: string | null
          full_name?: string | null
          is_blocked?: boolean
          blocked_at?: string | null
          blocked_reason?: string | null
          is_verified?: boolean
          verified_at?: string | null
        }
      }
      listings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          status: 'DRAFT' | 'PENDING_VERIFICATION' | 'LIVE' | 'REJECTED' | 'INACTIVE' | 'SOLD'
          promoter_id: string
          property_type: 'PLOT' | 'APARTMENT' | 'VILLA' | 'HOUSE' | 'LAND' | 'COMMERCIAL'
          title: string | null
          description: string | null
          total_price: number
          total_sqft: number
          price_type: 'FIXED' | 'NEGOTIABLE'
          city: string | null
          locality: string | null
          address: string | null
          state: string | null
          pin_code: string | null
          latitude: number | null
          longitude: number | null
          bedrooms: number | null
          bathrooms: number | null
          floor_number: number | null
          total_floors: number | null
          furnishing: string | null
          possession_status: string | null
          age_years: number | null
          facing: string | null
          parking_count: number
          amenities_json: Json
          amenities_price: number
          image_urls: string[]
          view_count: number
          save_count: number
          unlock_count: number
          price_per_sqft: number
          reviewed_at: string | null
          reviewed_by: string | null
          rejection_reason: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          status?: 'DRAFT' | 'PENDING_VERIFICATION' | 'LIVE' | 'REJECTED' | 'INACTIVE' | 'SOLD'
          promoter_id: string
          property_type: 'PLOT' | 'APARTMENT' | 'VILLA' | 'HOUSE' | 'LAND' | 'COMMERCIAL'
          title?: string | null
          description?: string | null
          total_price: number
          total_sqft: number
          price_type?: 'FIXED' | 'NEGOTIABLE'
          city?: string | null
          locality?: string | null
          address?: string | null
          state?: string | null
          pin_code?: string | null
          latitude?: number | null
          longitude?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          floor_number?: number | null
          total_floors?: number | null
          furnishing?: string | null
          possession_status?: string | null
          age_years?: number | null
          facing?: string | null
          parking_count?: number
          amenities_json?: Json
          amenities_price?: number
          image_urls?: string[]
          view_count?: number
          save_count?: number
          unlock_count?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          rejection_reason?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          status?: 'DRAFT' | 'PENDING_VERIFICATION' | 'LIVE' | 'REJECTED' | 'INACTIVE' | 'SOLD'
          promoter_id?: string
          property_type?: 'PLOT' | 'APARTMENT' | 'VILLA' | 'HOUSE' | 'LAND' | 'COMMERCIAL'
          title?: string | null
          description?: string | null
          total_price?: number
          total_sqft?: number
          price_type?: 'FIXED' | 'NEGOTIABLE'
          city?: string | null
          locality?: string | null
          address?: string | null
          state?: string | null
          pin_code?: string | null
          latitude?: number | null
          longitude?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          floor_number?: number | null
          total_floors?: number | null
          furnishing?: string | null
          possession_status?: string | null
          age_years?: number | null
          facing?: string | null
          parking_count?: number
          amenities_json?: Json
          amenities_price?: number
          image_urls?: string[]
          view_count?: number
          save_count?: number
          unlock_count?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          rejection_reason?: string | null
          deleted_at?: string | null
        }
      }
      listing_agreement_acceptances: {
        Row: {
          id: string
          created_at: string
          listing_id: string
          accepted_at: string
          ip_address: string | null
          user_agent: string | null
          agreement_version: string
        }
        Insert: {
          id?: string
          created_at?: string
          listing_id: string
          accepted_at?: string
          ip_address?: string | null
          user_agent?: string | null
          agreement_version?: string
        }
        Update: {
          id?: string
          created_at?: string
          listing_id?: string
          accepted_at?: string
          ip_address?: string | null
          user_agent?: string | null
          agreement_version?: string
        }
      }
      unlocks: {
        Row: {
          id: string
          created_at: string
          user_id: string
          listing_id: string
          payment_provider: string | null
          payment_ref: string | null
          unlocked_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          listing_id: string
          payment_provider?: string | null
          payment_ref?: string | null
          unlocked_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          listing_id?: string
          payment_provider?: string | null
          payment_ref?: string | null
          unlocked_at?: string
        }
      }
      payment_orders: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          provider: 'RAZORPAY' | 'DEV'
          status: 'CREATED' | 'INITIATED' | 'PENDING' | 'PAID' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
          user_id: string
          listing_id: string
          amount_paise: number
          currency: string
          provider_order_id: string
          provider_payment_id: string | null
          provider_signature: string | null
          paid_at: string | null
          error_code: string | null
          error_description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          provider: 'RAZORPAY' | 'DEV'
          status?: 'CREATED' | 'INITIATED' | 'PENDING' | 'PAID' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
          user_id: string
          listing_id: string
          amount_paise: number
          currency?: string
          provider_order_id: string
          provider_payment_id?: string | null
          provider_signature?: string | null
          paid_at?: string | null
          error_code?: string | null
          error_description?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          provider?: 'RAZORPAY' | 'DEV'
          status?: 'CREATED' | 'INITIATED' | 'PENDING' | 'PAID' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
          user_id?: string
          listing_id?: string
          amount_paise?: number
          currency?: string
          provider_order_id?: string
          provider_payment_id?: string | null
          provider_signature?: string | null
          paid_at?: string | null
          error_code?: string | null
          error_description?: string | null
        }
      }
      availability_slots: {
        Row: {
          id: string
          created_at: string
          promoter_id: string
          listing_id: string | null
          start_at: string
          end_at: string
          is_booked: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          promoter_id: string
          listing_id?: string | null
          start_at: string
          end_at: string
          is_booked?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          promoter_id?: string
          listing_id?: string | null
          start_at?: string
          end_at?: string
          is_booked?: boolean
        }
      }
      appointments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          listing_id: string
          customer_id: string
          promoter_id: string
          scheduled_start: string
          scheduled_end: string
          status: 'PENDING' | 'CONFIRMED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED'
          customer_notes: string | null
          promoter_notes: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cancellation_reason: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          listing_id: string
          customer_id: string
          promoter_id: string
          scheduled_start: string
          scheduled_end: string
          status?: 'PENDING' | 'CONFIRMED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED'
          customer_notes?: string | null
          promoter_notes?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancellation_reason?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          listing_id?: string
          customer_id?: string
          promoter_id?: string
          scheduled_start?: string
          scheduled_end?: string
          status?: 'PENDING' | 'CONFIRMED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED'
          customer_notes?: string | null
          promoter_notes?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancellation_reason?: string | null
        }
      }
      saved_properties: {
        Row: {
          id: string
          created_at: string
          user_id: string
          listing_id: string
          saved_price: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          listing_id: string
          saved_price?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          listing_id?: string
          saved_price?: number | null
        }
      }
      notifications: {
        Row: {
          id: string
          created_at: string
          user_id: string
          type: string
          title: string
          message: string
          is_read: boolean
          read_at: string | null
          link_url: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          type: string
          title: string
          message: string
          is_read?: boolean
          read_at?: string | null
          link_url?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          is_read?: boolean
          read_at?: string | null
          link_url?: string | null
          metadata?: Json
        }
      }
      activity_logs: {
        Row: {
          id: string
          created_at: string
          user_id: string | null
          action: string
          entity_type: string | null
          entity_id: string | null
          details: Json
        }
        Insert: {
          id?: string
          created_at?: string
          user_id?: string | null
          action: string
          entity_type?: string | null
          entity_id?: string | null
          details?: Json
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string | null
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          details?: Json
        }
      }
    }
    Views: {
      storage_usage_by_user: {
        Row: {
          user_id: string | null
          file_count: number | null
          total_bytes: number | null
          total_mb: number | null
        }
      }
    }
    Functions: {
      get_listing_contact: {
        Args: {
          p_listing_id: string
          p_user_id?: string
        }
        Returns: {
          unlocked: boolean
          masked_phone: string
          phone_e164: string | null
          promoter_name: string
          promoter_email: string | null
        }[]
      }
      create_notification: {
        Args: {
          p_user_id: string
          p_type: string
          p_title: string
          p_message: string
          p_link_url?: string
          p_metadata?: Json
        }
        Returns: string
      }
      mark_all_notifications_read: {
        Args: {
          p_user_id?: string
        }
        Returns: number
      }
      get_unread_notification_count: {
        Args: {
          p_user_id?: string
        }
        Returns: number
      }
      get_user_dashboard_stats: {
        Args: {
          p_user_id?: string
        }
        Returns: Json
      }
      increment_listing_view: {
        Args: {
          p_listing_id: string
        }
        Returns: void
      }
      toggle_saved_property: {
        Args: {
          p_listing_id: string
          p_user_id?: string
        }
        Returns: boolean
      }
      approve_listing: {
        Args: {
          p_listing_id: string
          p_admin_id?: string
        }
        Returns: boolean
      }
      reject_listing: {
        Args: {
          p_listing_id: string
          p_rejection_reason: string
          p_admin_id?: string
        }
        Returns: boolean
      }
      cleanup_old_notifications: {
        Args: {
          p_days_old?: number
        }
        Returns: number
      }
      get_popular_cities: {
        Args: {
          p_limit?: number
        }
        Returns: {
          city: string
          listing_count: number
        }[]
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_promoter: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_customer: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'CUSTOMER' | 'PROMOTER' | 'ADMIN'
      listing_status: 'DRAFT' | 'PENDING_VERIFICATION' | 'LIVE' | 'REJECTED' | 'INACTIVE' | 'SOLD'
      property_type: 'PLOT' | 'APARTMENT' | 'VILLA' | 'HOUSE' | 'LAND' | 'COMMERCIAL'
      price_type: 'FIXED' | 'NEGOTIABLE'
      payment_provider: 'RAZORPAY' | 'DEV'
      payment_status: 'CREATED' | 'INITIATED' | 'PENDING' | 'PAID' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
      appointment_status: 'PENDING' | 'CONFIRMED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED'
    }
  }
}

// Convenience type aliases
export type UserRole = Database['public']['Enums']['user_role']
export type ListingStatus = Database['public']['Enums']['listing_status']
export type PropertyType = Database['public']['Enums']['property_type']
export type PriceType = Database['public']['Enums']['price_type']
export type PaymentProvider = Database['public']['Enums']['payment_provider']
export type PaymentStatus = Database['public']['Enums']['payment_status']
export type AppointmentStatus = Database['public']['Enums']['appointment_status']

export type User = Database['public']['Tables']['users']['Row']
export type Listing = Database['public']['Tables']['listings']['Row']
export type Unlock = Database['public']['Tables']['unlocks']['Row']
export type PaymentOrder = Database['public']['Tables']['payment_orders']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type SavedProperty = Database['public']['Tables']['saved_properties']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

export type InsertUser = Database['public']['Tables']['users']['Insert']
export type InsertListing = Database['public']['Tables']['listings']['Insert']
export type InsertUnlock = Database['public']['Tables']['unlocks']['Insert']
export type InsertPaymentOrder = Database['public']['Tables']['payment_orders']['Insert']
export type InsertAppointment = Database['public']['Tables']['appointments']['Insert']

export type UpdateUser = Database['public']['Tables']['users']['Update']
export type UpdateListing = Database['public']['Tables']['listings']['Update']
export type UpdateAppointment = Database['public']['Tables']['appointments']['Update']
