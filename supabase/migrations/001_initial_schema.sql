-- =====================================================
-- Houlnd Realty - Initial Database Schema
-- =====================================================
-- This migration creates all tables, enums, indexes, and triggers
-- for the Houlnd Realty real estate marketplace platform.
--
-- Execute this in Supabase SQL Editor after creating your project.
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('CUSTOMER', 'PROMOTER', 'ADMIN');
CREATE TYPE listing_status AS ENUM ('DRAFT', 'PENDING_VERIFICATION', 'LIVE', 'REJECTED', 'INACTIVE', 'SOLD');
CREATE TYPE property_type AS ENUM ('PLOT', 'APARTMENT', 'VILLA', 'HOUSE', 'LAND', 'COMMERCIAL');
CREATE TYPE price_type AS ENUM ('FIXED', 'NEGOTIABLE');
CREATE TYPE payment_provider AS ENUM ('RAZORPAY', 'DEV');
CREATE TYPE payment_status AS ENUM ('CREATED', 'INITIATED', 'PENDING', 'PAID', 'SUCCESS', 'FAILED', 'REFUNDED');
CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED');

-- =====================================================
-- TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
-- Stores additional profile information for all users
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- User role
  role user_role NOT NULL DEFAULT 'CUSTOMER',

  -- Profile information
  phone_e164 TEXT UNIQUE,  -- Phone in E.164 format (e.g., +919876543210)
  email TEXT UNIQUE,
  full_name TEXT,

  -- Account status
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  blocked_at TIMESTAMPTZ,
  blocked_reason TEXT,

  -- Verification
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,

  CONSTRAINT phone_or_email_required CHECK (phone_e164 IS NOT NULL OR email IS NOT NULL)
);

COMMENT ON TABLE public.users IS 'User profiles extending Supabase auth.users with role and additional information';
COMMENT ON COLUMN public.users.phone_e164 IS 'Phone number in E.164 format for international consistency';

-- Listings table (property listings)
-- Core table for all property listings posted by promoters
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Status and ownership
  status listing_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  promoter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Basic property details
  property_type property_type NOT NULL,
  title TEXT,
  description TEXT,
  total_price INTEGER NOT NULL CHECK (total_price > 0),  -- Price in INR paise (1 INR = 100 paise) for precision
  total_sqft INTEGER NOT NULL CHECK (total_sqft > 0),
  price_type price_type NOT NULL DEFAULT 'FIXED',

  -- Location details
  city TEXT,
  locality TEXT,
  address TEXT,
  state TEXT,
  pin_code TEXT,
  latitude NUMERIC(10, 7),   -- Lat/Lng for map display
  longitude NUMERIC(10, 7),

  -- Property-specific details (applicable based on property_type)
  bedrooms INTEGER CHECK (bedrooms >= 0),
  bathrooms INTEGER CHECK (bathrooms >= 0),
  floor_number INTEGER,
  total_floors INTEGER,
  furnishing TEXT,  -- 'UNFURNISHED', 'SEMI_FURNISHED', 'FULLY_FURNISHED'
  possession_status TEXT,  -- 'READY_TO_MOVE', 'UNDER_CONSTRUCTION'
  age_years INTEGER CHECK (age_years >= 0),
  facing TEXT,  -- 'NORTH', 'SOUTH', 'EAST', 'WEST', etc.
  parking_count INTEGER DEFAULT 0,

  -- Amenities
  amenities_json JSONB DEFAULT '[]'::jsonb,  -- Array of amenity names
  amenities_price INTEGER DEFAULT 0,  -- Additional price for amenities in INR paise

  -- Images (array of Supabase Storage URLs)
  image_urls TEXT[] DEFAULT '{}',

  -- Engagement metrics
  view_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,
  unlock_count INTEGER DEFAULT 0,

  -- Admin review
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.users(id),
  rejection_reason TEXT,

  -- Soft delete
  deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE public.listings IS 'Property listings posted by promoters';
COMMENT ON COLUMN public.listings.total_price IS 'Total property price in INR paise (multiply by 100 from rupees)';
COMMENT ON COLUMN public.listings.image_urls IS 'Array of Supabase Storage public URLs for property images';

-- Add computed column for price per sqft (CRITICAL for primary USP)
ALTER TABLE public.listings
ADD COLUMN price_per_sqft NUMERIC GENERATED ALWAYS AS (
  CASE
    WHEN total_sqft > 0 THEN (total_price::numeric / total_sqft::numeric)
    ELSE 0
  END
) STORED;

COMMENT ON COLUMN public.listings.price_per_sqft IS 'Computed column: price per square foot in INR paise (auto-calculated)';

-- Listing Agreement Acceptances
-- Tracks commission agreement acceptance by promoters
CREATE TABLE public.listing_agreement_acceptances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  listing_id UUID NOT NULL UNIQUE REFERENCES public.listings(id) ON DELETE CASCADE,

  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  agreement_version TEXT DEFAULT '1.0'
);

COMMENT ON TABLE public.listing_agreement_acceptances IS 'Records commission agreement acceptance for each listing';

-- Unlocks table
-- Tracks which customers have unlocked (paid to view) which listings
CREATE TABLE public.unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,

  -- Payment tracking
  payment_provider TEXT,
  payment_ref TEXT,  -- Reference to payment_orders or external payment ID
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, listing_id)  -- One unlock per user per listing
);

COMMENT ON TABLE public.unlocks IS 'Tracks customer contact unlocks (paid access to promoter contact)';

-- Payment Orders
-- Tracks all payment transactions (Razorpay or DEV mode)
CREATE TABLE public.payment_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  provider payment_provider NOT NULL,
  status payment_status NOT NULL DEFAULT 'CREATED',

  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,

  -- Amount details
  amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),  -- Amount in paise
  currency TEXT NOT NULL DEFAULT 'INR',

  -- Provider-specific details (Razorpay)
  provider_order_id TEXT UNIQUE NOT NULL,
  provider_payment_id TEXT,
  provider_signature TEXT,

  -- Payment completion
  paid_at TIMESTAMPTZ,

  -- Error tracking
  error_code TEXT,
  error_description TEXT
);

COMMENT ON TABLE public.payment_orders IS 'All payment transactions for contact unlocks';
COMMENT ON COLUMN public.payment_orders.amount_paise IS 'Payment amount in paise (1 INR = 100 paise)';

-- Availability Slots
-- Promoter availability for property site visits
CREATE TABLE public.availability_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  promoter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,  -- Optional: slot for specific listing

  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,

  is_booked BOOLEAN DEFAULT FALSE,

  CHECK (end_at > start_at)
);

COMMENT ON TABLE public.availability_slots IS 'Promoter availability windows for customer site visits';

-- Appointments
-- Scheduled site visits between customers and promoters
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  promoter_id UUID NOT NULL REFERENCES public.users(id),  -- Denormalized for easier queries

  -- Appointment timing
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,

  -- Status
  status appointment_status NOT NULL DEFAULT 'PENDING',

  -- Notes
  customer_notes TEXT,
  promoter_notes TEXT,

  -- Cancellation/rescheduling
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES public.users(id),
  cancellation_reason TEXT,

  CHECK (scheduled_end > scheduled_start)
);

COMMENT ON TABLE public.appointments IS 'Scheduled property site visit appointments';

-- Saved Properties
-- Customer's saved/bookmarked listings
CREATE TABLE public.saved_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,

  -- Track price at time of save (to detect price drops)
  saved_price INTEGER,

  UNIQUE(user_id, listing_id)
);

COMMENT ON TABLE public.saved_properties IS 'Customer bookmarked/saved property listings';
COMMENT ON COLUMN public.saved_properties.saved_price IS 'Price when saved, used to detect price drops';

-- Notifications
-- In-app notifications for users
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Notification content
  type TEXT NOT NULL,  -- 'LISTING_APPROVED', 'LISTING_REJECTED', 'CONTACT_UNLOCKED', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Read status
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  -- Optional link
  link_url TEXT,

  -- Optional metadata (JSON)
  metadata JSONB DEFAULT '{}'::jsonb
);

COMMENT ON TABLE public.notifications IS 'In-app notifications for users';
COMMENT ON COLUMN public.notifications.type IS 'Notification type for frontend rendering';

-- Activity Logs (optional, for admin auditing)
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,  -- 'LISTING_APPROVED', 'USER_BLOCKED', etc.
  entity_type TEXT,  -- 'LISTING', 'USER', 'APPOINTMENT', etc.
  entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb
);

COMMENT ON TABLE public.activity_logs IS 'Audit log of significant actions in the system';

-- =====================================================
-- INDEXES
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_phone ON public.users(phone_e164) WHERE phone_e164 IS NOT NULL;
CREATE INDEX idx_users_email ON public.users(email) WHERE email IS NOT NULL;

-- Listings indexes (CRITICAL for performance)
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_promoter ON public.listings(promoter_id);
CREATE INDEX idx_listings_city ON public.listings(city) WHERE city IS NOT NULL;
CREATE INDEX idx_listings_property_type ON public.listings(property_type);
CREATE INDEX idx_listings_created_desc ON public.listings(created_at DESC);
CREATE INDEX idx_listings_price_per_sqft ON public.listings(price_per_sqft) WHERE status = 'LIVE';  -- PRIMARY USP
CREATE INDEX idx_listings_total_price ON public.listings(total_price) WHERE status = 'LIVE';
CREATE INDEX idx_listings_bedrooms ON public.listings(bedrooms) WHERE bedrooms IS NOT NULL;

-- Composite index for common search queries
CREATE INDEX idx_listings_search ON public.listings(status, city, property_type, price_per_sqft)
WHERE status = 'LIVE' AND deleted_at IS NULL;

-- Unlocks indexes
CREATE INDEX idx_unlocks_user ON public.unlocks(user_id);
CREATE INDEX idx_unlocks_listing ON public.unlocks(listing_id);

-- Payment Orders indexes
CREATE INDEX idx_payment_orders_user ON public.payment_orders(user_id, created_at DESC);
CREATE INDEX idx_payment_orders_listing ON public.payment_orders(listing_id, created_at DESC);
CREATE INDEX idx_payment_orders_provider_order_id ON public.payment_orders(provider_order_id);

-- Appointments indexes
CREATE INDEX idx_appointments_listing ON public.appointments(listing_id, scheduled_start);
CREATE INDEX idx_appointments_customer ON public.appointments(customer_id, scheduled_start);
CREATE INDEX idx_appointments_promoter ON public.appointments(promoter_id, scheduled_start);
CREATE INDEX idx_appointments_status ON public.appointments(status, scheduled_start);

-- Availability Slots indexes
CREATE INDEX idx_availability_promoter ON public.availability_slots(promoter_id, start_at);
CREATE INDEX idx_availability_listing ON public.availability_slots(listing_id) WHERE listing_id IS NOT NULL;

-- Saved Properties indexes
CREATE INDEX idx_saved_properties_user ON public.saved_properties(user_id, created_at DESC);
CREATE INDEX idx_saved_properties_listing ON public.saved_properties(listing_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read, created_at DESC) WHERE is_read = FALSE;

-- Activity Logs indexes
CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id, created_at DESC);
CREATE INDEX idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_orders_updated_at BEFORE UPDATE ON public.payment_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment unlock_count on listings
CREATE OR REPLACE FUNCTION increment_listing_unlock_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.listings
  SET unlock_count = unlock_count + 1
  WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_unlock_count AFTER INSERT ON public.unlocks
  FOR EACH ROW EXECUTE FUNCTION increment_listing_unlock_count();

-- Function to update read_at timestamp when notification is marked as read
CREATE OR REPLACE FUNCTION update_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
    NEW.read_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notification_read_at BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION update_notification_read_at();

-- =====================================================
-- INITIAL DATA (optional)
-- =====================================================

-- No initial data for production.
-- For development, you can insert test data here or via separate seed script.

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON SCHEMA public IS 'Houlnd Realty application schema';
