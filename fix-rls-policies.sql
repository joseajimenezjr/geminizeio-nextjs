-- Run this SQL in the Supabase SQL Editor to check and fix RLS policies

-- Check if RLS is enabled on the Profiles table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'Profiles';

-- Check existing RLS policies
SELECT * 
FROM pg_policies 
WHERE tablename = 'Profiles';

-- Create or fix the insert policy for Profiles
CREATE POLICY IF NOT EXISTS "Users can insert their own profile" 
ON public."Profiles" 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create or fix the select policy for Profiles
CREATE POLICY IF NOT EXISTS "Users can view their own profile" 
ON public."Profiles" 
FOR SELECT 
USING (auth.uid() = id);

-- Create or fix the update policy for Profiles
CREATE POLICY IF NOT EXISTS "Users can update their own profile" 
ON public."Profiles" 
FOR UPDATE 
USING (auth.uid() = id);
