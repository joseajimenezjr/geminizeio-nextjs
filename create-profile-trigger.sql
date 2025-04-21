-- Run this SQL in the Supabase SQL Editor to create a trigger for automatic profile creation

-- Create or replace the function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."Profiles" (
    id, 
    email, 
    first_name,
    last_name,
    phone_number,
    vehicle_name,
    vehicle_type,
    vehicle_year,
    membership_plan_id,
    accessories,
    group_ids,
    accessoryLimit
  ) VALUES (
    NEW.id, 
    NEW.email,
    '', -- first_name
    '', -- last_name
    '', -- phone_number
    'My Vehicle', -- vehicle_name
    '', -- vehicle_type
    '', -- vehicle_year
    'free', -- membership_plan_id
    '[]'::jsonb, -- accessories
    '[]'::jsonb, -- group_ids
    4 -- accessoryLimit
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If the profile already exists, do nothing
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
