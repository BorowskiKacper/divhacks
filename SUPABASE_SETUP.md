# Supabase Integration Setup Guide

This guide will help you set up Supabase integration for your creature detection app.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization and enter project details:
   - Name: `divhacks-creature-detection` (or your preferred name)
   - Database Password: Choose a strong password
   - Region: Select the closest region to your users

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - Anon/Public API Key

## 3. Set Up Environment Variables

1. Create a `.env` file in your project root (copy from `.env.example`)
2. Add your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. Set Up the Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `database/schema.sql`
3. Paste and run the SQL to create the `creature_sightings` table

## 5. Configure Row Level Security (Optional)

The schema includes basic RLS policies that allow:
- Anyone to read all sightings
- Anyone to insert/update/delete sightings

For production, you should implement proper user authentication and restrict access based on user IDs.

## 6. Test the Integration

1. Start your Expo development server: `npm start`
2. Take a photo of a creature using the camera feature
3. Check your Supabase dashboard > Table Editor > creature_sightings to see the data

## Database Schema

The `creature_sightings` table includes:

### Basic Sighting Data
- `id`: Unique identifier (UUID)
- `user_id`: User who logged the sighting
- `name`: Common name of the creature
- `type`: Type of creature (Bird, Mammal, etc.)
- `latitude`/`longitude`: Location coordinates
- `timestamp`: When the sighting occurred

### AI Analysis Data
- `confidence`: AI confidence score (0-100)
- `description`: AI-generated description
- `species`: Scientific name if identified
- `creature_type`: Detailed creature type
- `key_characteristics`: Distinctive features
- `rarity`: How common/rare in the area
- `is_animal`: Whether a creature was detected
- `image_uri`: Path to the captured image

### Metadata
- `created_at`: Record creation time
- `updated_at`: Last update time

## Next Steps

1. **User Authentication**: Implement proper user authentication to replace the hardcoded 'you' user ID
2. **Image Storage**: Consider storing images in Supabase Storage instead of local URIs
3. **Data Analytics**: Add queries for creature statistics and trends
4. **Offline Support**: Implement offline data sync for better user experience
