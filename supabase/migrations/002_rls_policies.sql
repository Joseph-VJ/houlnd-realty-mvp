-- =====================================================
-- Houlnd Realty - Row Level Security (RLS) Policies
-- =====================================================
-- This migration creates all RLS policies to secure data access
-- based on user roles and ownership.
--
-- Execute this AFTER 001_initial_schema.sql
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_agreement_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS FOR RLS POLICIES
-- =====================================================

-- Function to check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is a promoter
CREATE OR REPLACE FUNCTION is_promoter()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'PROMOTER'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is a customer
CREATE OR REPLACE FUNCTION is_customer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'CUSTOMER'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile (except role and blocked status)
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Prevent users from changing their own role or blocked status
    role = (SELECT role FROM public.users WHERE id = auth.uid()) AND
    is_blocked = (SELECT is_blocked FROM public.users WHERE id = auth.uid())
  );

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can update any user
CREATE POLICY "Admins can update any user"
  ON public.users FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Allow user profile creation during registration (via service role or trigger)
CREATE POLICY "Allow profile creation on signup"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- LISTINGS TABLE POLICIES
-- =====================================================

-- Anyone (authenticated) can view LIVE listings
CREATE POLICY "Anyone can view LIVE listings"
  ON public.listings FOR SELECT
  TO authenticated
  USING (status = 'LIVE' AND deleted_at IS NULL);

-- Promoters can view their own listings (any status)
CREATE POLICY "Promoters can view their own listings"
  ON public.listings FOR SELECT
  TO authenticated
  USING (promoter_id = auth.uid());

-- Admins can view all listings
CREATE POLICY "Admins can view all listings"
  ON public.listings FOR SELECT
  TO authenticated
  USING (is_admin());

-- Promoters can create listings
CREATE POLICY "Promoters can create listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (
    promoter_id = auth.uid() AND
    is_promoter()
  );

-- Promoters can update their own PENDING/REJECTED/DRAFT listings
CREATE POLICY "Promoters can update their own pending/rejected/draft listings"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (
    promoter_id = auth.uid() AND
    status IN ('DRAFT', 'PENDING_VERIFICATION', 'REJECTED')
  )
  WITH CHECK (
    promoter_id = auth.uid() AND
    status IN ('DRAFT', 'PENDING_VERIFICATION', 'REJECTED')
  );

-- Admins can update any listing (for approval/rejection)
CREATE POLICY "Admins can update any listing"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Promoters can soft-delete their own listings
CREATE POLICY "Promoters can delete their own listings"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (promoter_id = auth.uid())
  WITH CHECK (promoter_id = auth.uid());

-- =====================================================
-- LISTING AGREEMENT ACCEPTANCES POLICIES
-- =====================================================

-- Promoters can view their own agreement acceptances
CREATE POLICY "Promoters can view their own agreement acceptances"
  ON public.listing_agreement_acceptances FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id AND promoter_id = auth.uid()
    )
  );

-- Admins can view all agreement acceptances
CREATE POLICY "Admins can view all agreement acceptances"
  ON public.listing_agreement_acceptances FOR SELECT
  TO authenticated
  USING (is_admin());

-- Promoters can create agreement acceptances for their listings
CREATE POLICY "Promoters can create agreement acceptances"
  ON public.listing_agreement_acceptances FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id AND promoter_id = auth.uid()
    )
  );

-- =====================================================
-- UNLOCKS TABLE POLICIES
-- =====================================================

-- Users can view their own unlocks
CREATE POLICY "Users can view their own unlocks"
  ON public.unlocks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Promoters can view unlocks for their listings
CREATE POLICY "Promoters can view unlocks for their listings"
  ON public.unlocks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = unlocks.listing_id AND promoter_id = auth.uid()
    )
  );

-- Admins can view all unlocks
CREATE POLICY "Admins can view all unlocks"
  ON public.unlocks FOR SELECT
  TO authenticated
  USING (is_admin());

-- Users can create unlocks (after successful payment)
CREATE POLICY "Users can create unlocks"
  ON public.unlocks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- PAYMENT ORDERS POLICIES
-- =====================================================

-- Users can view their own payment orders
CREATE POLICY "Users can view their own payment orders"
  ON public.payment_orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create payment orders
CREATE POLICY "Users can create payment orders"
  ON public.payment_orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own payment orders (for payment status updates)
CREATE POLICY "Users can update their own payment orders"
  ON public.payment_orders FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can view all payment orders
CREATE POLICY "Admins can view all payment orders"
  ON public.payment_orders FOR SELECT
  TO authenticated
  USING (is_admin());

-- =====================================================
-- AVAILABILITY SLOTS POLICIES
-- =====================================================

-- Anyone can view availability slots (for scheduling appointments)
CREATE POLICY "Anyone can view availability slots"
  ON public.availability_slots FOR SELECT
  TO authenticated
  USING (TRUE);

-- Promoters can create their own availability slots
CREATE POLICY "Promoters can create availability slots"
  ON public.availability_slots FOR INSERT
  TO authenticated
  WITH CHECK (promoter_id = auth.uid() AND is_promoter());

-- Promoters can update their own availability slots
CREATE POLICY "Promoters can update their own availability slots"
  ON public.availability_slots FOR UPDATE
  TO authenticated
  USING (promoter_id = auth.uid())
  WITH CHECK (promoter_id = auth.uid());

-- Promoters can delete their own availability slots
CREATE POLICY "Promoters can delete their own availability slots"
  ON public.availability_slots FOR DELETE
  TO authenticated
  USING (promoter_id = auth.uid());

-- =====================================================
-- APPOINTMENTS POLICIES
-- =====================================================

-- Customers can view their own appointments
CREATE POLICY "Customers can view their own appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

-- Promoters can view appointments for their listings
CREATE POLICY "Promoters can view appointments for their listings"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (promoter_id = auth.uid());

-- Admins can view all appointments
CREATE POLICY "Admins can view all appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (is_admin());

-- Customers can create appointments for listings they've unlocked
CREATE POLICY "Customers can create appointments"
  ON public.appointments FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id = auth.uid() AND
    -- Verify customer has unlocked the listing
    EXISTS (
      SELECT 1 FROM public.unlocks
      WHERE user_id = auth.uid() AND listing_id = appointments.listing_id
    )
  );

-- Customers can update their own appointments (reschedule, cancel)
CREATE POLICY "Customers can update their own appointments"
  ON public.appointments FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- Promoters can update appointments for their listings (confirm, cancel)
CREATE POLICY "Promoters can update appointments for their listings"
  ON public.appointments FOR UPDATE
  TO authenticated
  USING (promoter_id = auth.uid())
  WITH CHECK (promoter_id = auth.uid());

-- =====================================================
-- SAVED PROPERTIES POLICIES
-- =====================================================

-- Users can view their own saved properties
CREATE POLICY "Users can view their own saved properties"
  ON public.saved_properties FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can save properties
CREATE POLICY "Users can save properties"
  ON public.saved_properties FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can delete their saved properties (unsave)
CREATE POLICY "Users can delete their saved properties"
  ON public.saved_properties FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Service role can create notifications (via RPC functions or triggers)
-- Note: No explicit policy needed as service role bypasses RLS

-- =====================================================
-- ACTIVITY LOGS POLICIES
-- =====================================================

-- Only admins can view activity logs
CREATE POLICY "Admins can view all activity logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (is_admin());

-- Service role can create activity logs
-- Note: No explicit policy needed as service role bypasses RLS

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table permissions to authenticated users
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.listings TO authenticated;
GRANT ALL ON public.listing_agreement_acceptances TO authenticated;
GRANT ALL ON public.unlocks TO authenticated;
GRANT ALL ON public.payment_orders TO authenticated;
GRANT ALL ON public.availability_slots TO authenticated;
GRANT ALL ON public.appointments TO authenticated;
GRANT ALL ON public.saved_properties TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT SELECT ON public.activity_logs TO authenticated;

-- Grant sequence permissions (for auto-increment if any)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES (for testing RLS policies)
-- =====================================================

-- Uncomment and run these queries to test RLS policies
-- Replace 'USER_ID' with actual user UUID

/*
-- Test as a customer
SET ROLE authenticated;
SET request.jwt.claims.sub TO 'CUSTOMER_USER_ID';

-- Should return only LIVE listings
SELECT * FROM public.listings;

-- Should return only own saved properties
SELECT * FROM public.saved_properties;

-- Test as a promoter
SET request.jwt.claims.sub TO 'PROMOTER_USER_ID';

-- Should return own listings + LIVE listings
SELECT * FROM public.listings;

-- Should return unlocks for own listings
SELECT * FROM public.unlocks;

-- Test as an admin
SET request.jwt.claims.sub TO 'ADMIN_USER_ID';

-- Should return all listings
SELECT * FROM public.listings;

-- Should return all users
SELECT * FROM public.users;
*/

-- =====================================================
-- END OF RLS POLICIES
-- =====================================================

COMMENT ON SCHEMA public IS 'Houlnd Realty schema with RLS policies enabled';
