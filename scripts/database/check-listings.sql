-- Check listings in the database
-- Run this in Supabase SQL Editor

SELECT 
  id,
  title,
  status,
  property_type,
  listing_type,
  price,
  created_at
FROM public.listings
ORDER BY created_at DESC;
