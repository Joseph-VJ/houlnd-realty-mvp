-- =====================================================
-- Houlnd Realty - Supabase Storage Setup
-- =====================================================
-- This migration creates storage buckets and policies
-- for property image uploads.
--
-- Execute this AFTER 003_rpc_functions.sql
--
-- NOTE: You must also create the bucket via Supabase Dashboard:
-- 1. Go to Storage > Buckets
-- 2. Create new bucket named 'property-images'
-- 3. Set as Public bucket (for read access)
-- 4. File size limit: 5MB
-- 5. Allowed MIME types: image/jpeg, image/png, image/webp
-- =====================================================

-- =====================================================
-- STORAGE BUCKET: property-images
-- =====================================================

-- Create the bucket (if using SQL; alternatively create via Dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', TRUE)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Policy: Authenticated users can upload images to their own folder
-- Folder structure: /{userId}/{listingId}/{filename}
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-images' AND
  -- User can only upload to their own user folder
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Anyone (public) can view/download property images
-- This allows images to be displayed on public property listings
CREATE POLICY "Anyone can view property images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

-- Policy: Users can update their own images
CREATE POLICY "Users can update their own property images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete their own property images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- STORAGE HELPER FUNCTIONS
-- =====================================================

-- Function to get image URL from storage path
-- Converts storage path to public URL
CREATE OR REPLACE FUNCTION get_image_public_url(
  p_bucket_id TEXT,
  p_path TEXT
)
RETURNS TEXT AS $$
DECLARE
  v_supabase_url TEXT;
BEGIN
  -- Get Supabase URL from environment (set this in your .env)
  -- For now, returns path - client should construct full URL
  RETURN p_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_image_public_url IS 'Get public URL for a storage object';

-- Function to delete listing images when listing is deleted
-- This is a cleanup function to remove orphaned images
CREATE OR REPLACE FUNCTION delete_listing_images(
  p_listing_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_image_urls TEXT[];
  v_deleted_count INTEGER := 0;
  v_path TEXT;
BEGIN
  -- Get image URLs for the listing
  SELECT image_urls INTO v_image_urls
  FROM public.listings
  WHERE id = p_listing_id;

  -- Delete each image from storage
  IF v_image_urls IS NOT NULL THEN
    FOREACH v_path IN ARRAY v_image_urls LOOP
      -- Extract path from URL if needed
      -- This assumes image_urls stores storage paths, not full URLs
      DELETE FROM storage.objects
      WHERE bucket_id = 'property-images' AND name = v_path;

      IF FOUND THEN
        v_deleted_count := v_deleted_count + 1;
      END IF;
    END LOOP;
  END IF;

  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION delete_listing_images IS 'Delete all images associated with a listing from storage';

-- =====================================================
-- STORAGE USAGE TRACKING (Optional)
-- =====================================================

-- View to track storage usage by user
CREATE OR REPLACE VIEW storage_usage_by_user AS
SELECT
  (storage.foldername(name))[1]::UUID AS user_id,
  COUNT(*) AS file_count,
  SUM(metadata->>'size')::BIGINT AS total_bytes,
  ROUND(SUM((metadata->>'size')::BIGINT) / 1024.0 / 1024.0, 2) AS total_mb
FROM storage.objects
WHERE bucket_id = 'property-images'
GROUP BY (storage.foldername(name))[1];

COMMENT ON VIEW storage_usage_by_user IS 'Track storage usage per user';

-- =====================================================
-- CONFIGURATION NOTES
-- =====================================================

/*
MANUAL CONFIGURATION REQUIRED IN SUPABASE DASHBOARD:

1. Create Bucket:
   - Go to: Storage > Buckets > New Bucket
   - Bucket Name: property-images
   - Public: Yes (allows public read access)
   - File size limit: 5 MB (5000000 bytes)
   - Allowed MIME types: image/jpeg, image/png, image/webp

2. Folder Structure:
   - /{userId}/{listingId}/{filename}
   - Example: /550e8400-e29b-41d4-a716-446655440000/listing-123/photo-1.jpg

3. Image Upload Flow:
   a. User selects images in frontend
   b. Compress images with browser-image-compression (max 1MB, 1920px width)
   c. Upload to: property-images/{userId}/{listingId}/image-{timestamp}.jpg
   d. Get public URL: https://your-project.supabase.co/storage/v1/object/public/property-images/{path}
   e. Save URL array to listings.image_urls

4. Image Optimization:
   - Compress before upload (client-side with browser-image-compression)
   - Max file size: 1MB per image (after compression)
   - Max dimensions: 1920x1080
   - Format: JPEG/PNG/WebP
   - Minimum: 3 images per listing
   - Maximum: 10 images per listing

5. Security:
   - RLS policies enforce user can only upload to their own folder
   - Public read access allows images to display on listings
   - Users can delete their own images
   - Orphaned images (from deleted listings) should be cleaned up periodically

6. CDN & Performance:
   - Supabase Storage uses CDN for fast delivery
   - Images are automatically cached
   - Use Next.js Image component for lazy loading and optimization
*/

-- =====================================================
-- END OF STORAGE SETUP
-- =====================================================
