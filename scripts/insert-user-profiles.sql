-- Insert user profiles into public.users table
-- Run this in Supabase SQL Editor

-- First, delete all test data (in correct order due to foreign keys)
DELETE FROM public.listings WHERE promoter_id IN (
  SELECT id FROM public.users WHERE email IN ('customer@test.com', 'promoter@test.com', 'admin@test.com')
);
DELETE FROM public.users WHERE email IN ('customer@test.com', 'promoter@test.com', 'admin@test.com');

-- Customer profile
INSERT INTO public.users (id, email, full_name, phone_e164, role, is_verified, created_at)
VALUES (
  'e326b15f-325a-4cdc-95aa-7efd4419da88',
  'customer@test.com',
  'Test Customer',
  '+919876543211',
  'CUSTOMER',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone_e164 = EXCLUDED.phone_e164,
  role = EXCLUDED.role,
  is_verified = EXCLUDED.is_verified;

-- Promoter profile
INSERT INTO public.users (id, email, full_name, phone_e164, role, is_verified, created_at)
VALUES (
  '43e5ed4e-4bee-49ad-ac2b-d9a8ecb5acf1',
  'promoter@test.com',
  'Test Promoter',
  '+919876543210',
  'PROMOTER',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone_e164 = EXCLUDED.phone_e164,
  role = EXCLUDED.role,
  is_verified = EXCLUDED.is_verified;

-- Admin profile
INSERT INTO public.users (id, email, full_name, phone_e164, role, is_verified, created_at)
VALUES (
  'db584d79-d5de-4163-9f02-53ee5a981a18',
  'admin@test.com',
  'Test Admin',
  '+919876543212',
  'ADMIN',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone_e164 = EXCLUDED.phone_e164,
  role = EXCLUDED.role,
  is_verified = EXCLUDED.is_verified;
