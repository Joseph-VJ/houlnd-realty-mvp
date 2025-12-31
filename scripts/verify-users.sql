-- Verify and insert user data
-- Run this in Supabase SQL Editor

-- First, check if users exist
SELECT id, email, role FROM public.users WHERE email IN ('customer@test.com', 'promoter@test.com', 'admin@test.com');

-- If the above returns no rows, run these INSERTs:
-- (You can run them anyway, they won't fail)

INSERT INTO public.users (id, email, full_name, phone_e164, role, is_verified, created_at)
VALUES 
  ('e326b15f-325a-4cdc-95aa-7efd4419da88', 'customer@test.com', 'Test Customer', '+919876543211', 'CUSTOMER', true, NOW()),
  ('43e5ed4e-4bee-49ad-ac2b-d9a8ecb5acf1', 'promoter@test.com', 'Test Promoter', '+919876543210', 'PROMOTER', true, NOW()),
  ('db584d79-d5de-4163-9f02-53ee5a981a18', 'admin@test.com', 'Test Admin', '+919876543212', 'ADMIN', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Then verify again
SELECT id, email, role FROM public.users WHERE email IN ('customer@test.com', 'promoter@test.com', 'admin@test.com');
