-- Drop existing policies
DROP POLICY IF EXISTS "Restaurant owners can upload menu images" ON storage.objects;
DROP POLICY IF EXISTS "Restaurant owners can update their menu images" ON storage.objects;
DROP POLICY IF EXISTS "Restaurant owners can delete their menu images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view menu images" ON storage.objects;

-- Create correct policies for menu-images bucket
-- Allow public SELECT (viewing)
CREATE POLICY "Public can view menu images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

-- Allow authenticated users to INSERT their restaurant's images
CREATE POLICY "Restaurant owners can upload menu images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'menu-images' 
  AND auth.uid() IN (
    SELECT owner_id 
    FROM restaurants 
    WHERE id::text = (storage.foldername(name))[1]
  )
);

-- Allow restaurant owners to UPDATE their images
CREATE POLICY "Restaurant owners can update their menu images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'menu-images'
  AND auth.uid() IN (
    SELECT owner_id 
    FROM restaurants 
    WHERE id::text = (storage.foldername(name))[1]
  )
);

-- Allow restaurant owners to DELETE their images
CREATE POLICY "Restaurant owners can delete their menu images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'menu-images'
  AND auth.uid() IN (
    SELECT owner_id 
    FROM restaurants 
    WHERE id::text = (storage.foldername(name))[1]
  )
);