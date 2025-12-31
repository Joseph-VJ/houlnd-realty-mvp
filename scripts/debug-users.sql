-- Check what users exist in Supabase Auth
-- Run this in Supabase SQL Editor

-- Check auth.users table
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;

-- Check public.users table  
SELECT id, email, role FROM public.users WHERE email IN ('customer@test.com', 'promoter@test.com', 'admin@test.com');

-- Check if IDs match between auth.users and public.users
SELECT 
  au.id as auth_id,
  au.email as auth_email,
  pu.id as profile_id,
  pu.email as profile_email,
  pu.role
FROM auth.users au
LEFT JOIN public.users pu ON au.id::text = pu.id
WHERE au.email IN ('customer@test.com', 'promoter@test.com', 'admin@test.com');
