-- Check RLS status and fix it
-- Run this in Supabase SQL Editor

-- Check if RLS is enabled
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'users';

-- Force disable RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Also disable for all other tables that might have RLS
ALTER TABLE public.listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.unlocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_agreement_acceptances DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'users';
