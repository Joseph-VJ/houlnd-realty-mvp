-- Enable Row Level Security and create policies for users table
-- Run this in Supabase SQL Editor

-- Enable RLS on users table (if not already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;

-- Policy 1: Allow authenticated users to read their own profile
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid()::text = id);

-- Policy 2: Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid()::text = id);

-- Policy 3: Allow authenticated users to insert their own profile (for registration)
CREATE POLICY "Enable insert for authenticated users only"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = id);
