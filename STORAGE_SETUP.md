# Supabase Storage Setup for Animal Images

This guide explains how to set up the Supabase Storage bucket for storing animal images captured by users.

## Prerequisites

- A Supabase project with the `users` and `creature_sightings` tables already set up
- Supabase credentials configured in your `.env` file or `config/supabase.ts`

## Step 1: Create the Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Enter the following details:
   - **Name**: `animals`
   - **Public bucket**: ✅ Check this box (so images can be accessed via public URLs)
   - **File size limit**: Set to your preference (e.g., 5MB)
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/webp`

5. Click **Create bucket**

## Step 2: Set Up Storage Policies

To allow users to upload and read images, you need to set up Row Level Security (RLS) policies:

### Policy 1: Allow Public Read Access

```sql
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'animals');
```

### Policy 2: Allow Authenticated Users to Upload

```sql
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'animals' 
  AND auth.role() = 'authenticated'
);
```

### Policy 3: Allow Users to Delete Their Own Images

```sql
CREATE POLICY "Allow users to delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'animals' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Step 3: Verify the Setup

1. In your Supabase dashboard, go to **Storage** > **animals**
2. You should see an empty bucket
3. The bucket should be marked as **Public**

## How It Works

When a user takes a picture of an animal:

1. The image is captured using the device camera
2. The image is uploaded to the `animals` bucket in Supabase Storage
3. Images are organized by user ID: `{userId}/{timestamp}.{ext}`
4. A public URL is generated and stored in the `creature_sightings.image_uri` column
5. The image can be accessed by anyone with the public URL

## File Structure in the Bucket

```
animals/
├── {user_id_1}/
│   ├── 1234567890.jpg
│   ├── 1234567891.jpg
│   └── ...
├── {user_id_2}/
│   ├── 1234567892.jpg
│   └── ...
└── ...
```

## Testing

To test the image upload functionality:

1. Run your app
2. Go to the "Spot" tab
3. Take a picture of an animal
4. Log the sighting
5. Check your Supabase Storage bucket to see the uploaded image
6. Verify that the `image_uri` in the `creature_sightings` table contains the public URL

## Troubleshooting

### Images not uploading?

- Check that your Supabase credentials are correctly configured
- Verify that the `animals` bucket exists and is public
- Check the console logs for error messages
- Ensure the storage policies are correctly set up

### Images not displaying?

- Verify that the bucket is set to **Public**
- Check that the `image_uri` in the database contains a valid URL
- Test the URL directly in a browser

### Permission errors?

- Make sure the storage policies are correctly configured
- Verify that users are authenticated before uploading
- Check that the bucket name in the code matches the actual bucket name

## Code Implementation

The image upload functionality is implemented in:

- **`services/supabaseService.ts`**: Contains the `uploadImage()` method
- **`app/(tabs)/explore.tsx`**: Captures the photo and passes it to the service
- **`contexts/SightingsContext.tsx`**: Handles the sighting creation flow

The upload process:
1. Uses the Fetch API to read the image file as an ArrayBuffer
2. Uploads the ArrayBuffer directly to Supabase Storage
3. Returns the public URL
4. Stores the URL in the database

### Technical Details

The implementation uses a universal approach that works in both web and React Native/Expo:

```typescript
// Fetch the image and convert to ArrayBuffer
const response = await fetch(imageUri);
const arrayBuffer = await response.arrayBuffer();

// Upload ArrayBuffer to Supabase Storage
const { data, error } = await supabase.storage
  .from('animals')
  .upload(fileName, arrayBuffer, {
    contentType: contentType,
    upsert: false,
  });

// Get public URL
const { data: publicUrlData } = supabase.storage
  .from('animals')
  .getPublicUrl(fileName);
```

This approach:
- ✅ Works in both web browsers and React Native/Expo
- ✅ No deprecated dependencies or APIs
- ✅ Uses ArrayBuffer (supported everywhere)
- ✅ Properly handles content types (JPEG, PNG, WebP, HEIC, etc.)
- ✅ Compatible with Supabase JS v2+ API
- ✅ Clean error handling and logging
