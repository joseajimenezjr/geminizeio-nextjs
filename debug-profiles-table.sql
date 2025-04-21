-- Run this in the Supabase SQL Editor to check the Profiles table structure

-- Get table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_schema = 'public' 
  AND table_name = 'Profiles'
ORDER BY 
  ordinal_position;

-- Check RLS policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM 
  pg_policies
WHERE 
  tablename = 'Profiles';

-- Check if there are any triggers on the table
SELECT 
  trigger_name, 
  event_manipulation, 
  action_statement
FROM 
  information_schema.triggers
WHERE 
  event_object_table = 'Profiles';

-- Create a manual profile for testing
INSERT INTO "Profiles" (
  id, 
  email,
  -- Add other columns as needed based on your table structure
  accessories,
  groups
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Replace with a test UUID
  'test@example.com',
  '[]'::jsonb,
  '[]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
