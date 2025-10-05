-- Create the creature_sightings table
CREATE TABLE IF NOT EXISTS creature_sightings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  
  -- AI Analysis data
  confidence INTEGER DEFAULT 0,
  description TEXT,
  species TEXT,
  creature_type TEXT,
  key_characteristics TEXT,
  rarity TEXT,
  is_animal BOOLEAN DEFAULT false,
  image_uri TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_creature_sightings_user_id ON creature_sightings(user_id);
CREATE INDEX IF NOT EXISTS idx_creature_sightings_timestamp ON creature_sightings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_creature_sightings_location ON creature_sightings(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_creature_sightings_type ON creature_sightings(type);
CREATE INDEX IF NOT EXISTS idx_creature_sightings_rarity ON creature_sightings(rarity);

-- Enable Row Level Security (RLS)
ALTER TABLE creature_sightings ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Allow users to read all sightings (for now - you can restrict this later)
CREATE POLICY "Allow read access to all sightings" ON creature_sightings
  FOR SELECT USING (true);

-- Allow users to insert their own sightings
CREATE POLICY "Allow users to insert their own sightings" ON creature_sightings
  FOR INSERT WITH CHECK (true);

-- Allow users to update their own sightings
CREATE POLICY "Allow users to update their own sightings" ON creature_sightings
  FOR UPDATE USING (true);

-- Allow users to delete their own sightings
CREATE POLICY "Allow users to delete their own sightings" ON creature_sightings
  FOR DELETE USING (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_creature_sightings_updated_at
  BEFORE UPDATE ON creature_sightings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();