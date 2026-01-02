-- Debug users in the database
-- Run this in Supabase SQL Editor

SELECT 
  id,
  email,
  role,
  is_active,
  created_at
FROM public.user_profiles
ORDER BY created_at DESC;
