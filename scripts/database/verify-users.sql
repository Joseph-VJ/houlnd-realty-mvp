-- Verify users exist and have correct roles
-- Run this in Supabase SQL Editor

-- Check all user profiles
SELECT * FROM public.user_profiles;

-- Check auth users
SELECT id, email, created_at FROM auth.users;

-- Verify role distribution
SELECT role, COUNT(*) as count 
FROM public.user_profiles 
GROUP BY role;
