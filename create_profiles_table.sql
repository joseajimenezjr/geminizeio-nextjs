-- Create the Profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public."Profiles" (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT,
  firstName TEXT,
  lastName TEXT,
  phoneNumber TEXT,
  vehicleName TEXT DEFAULT 'My Vehicle',
  vehicleType TEXT,
  vehicleYear TEXT,
  membershipPlanID TEXT,
  devices JSONB DEFAULT '[]'::jsonb,
  groups JSONB DEFAULT '[]'::jsonb
);

-- Set up RLS (Row Level Security)
ALTER TABLE public."Profiles" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'Profiles' 
    AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile" 
      ON public."Profiles" 
      FOR SELECT 
      USING (auth.uid() = id);
  END IF;
END
$$;

-- Create policy to allow users to update their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'Profiles' 
    AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile" 
      ON public."Profiles" 
      FOR UPDATE 
      USING (auth.uid() = id);
  END IF;
END
$$;

-- Create policy to allow users to insert their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'Profiles' 
    AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile" 
      ON public."Profiles" 
      FOR INSERT 
      WITH CHECK (auth.uid() = id);
  END IF;
END
$$;

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column
DROP TRIGGER IF EXISTS set_updated_at ON public."Profiles";
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public."Profiles"
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."Profiles" (id, email, devices, groups)
  VALUES (
    NEW.id, 
    NEW.email,
    '[
      {"id": 1, "deviceName": "Light Bar", "deviceType": "light", "deviceSupportStatus": false},
      {"id": 2, "deviceName": "Spot Lights", "deviceType": "light", "deviceSupportStatus": false},
      {"id": 3, "deviceName": "Rock Lights", "deviceType": "light", "deviceSupportStatus": false},
      {"id": 4, "deviceName": "Winch", "deviceType": "utility", "deviceSupportStatus": false}
    ]'::jsonb,
    '[
      {"id": "1", "name": "Exterior Lights", "active": false, "devices": ["1", "2"]},
      {"id": "2", "name": "Interior Lights", "active": false, "devices": ["3"]},
      {"id": "3", "name": "Utility", "active": false, "devices": ["4"]}
    ]'::jsonb
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If the profile already exists, do nothing
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
