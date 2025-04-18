-- Create a table to store user device connections
CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  service_uuid TEXT NOT NULL,
  last_connected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_primary BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure we can quickly look up a user's devices
  CONSTRAINT user_device_unique UNIQUE (user_id, device_name)
);

-- Add RLS policies
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own devices
CREATE POLICY "Users can view their own devices"
  ON user_devices
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own devices
CREATE POLICY "Users can insert their own devices"
  ON user_devices
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own devices
CREATE POLICY "Users can update their own devices"
  ON user_devices
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own devices
CREATE POLICY "Users can delete their own devices"
  ON user_devices
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
