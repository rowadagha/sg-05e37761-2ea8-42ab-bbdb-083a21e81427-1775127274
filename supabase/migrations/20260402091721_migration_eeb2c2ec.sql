-- Create storage bucket for menu item images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for menu images
CREATE POLICY "Public can view menu images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

CREATE POLICY "Restaurant owners can upload menu images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'menu-images' AND
  auth.uid() IN (
    SELECT owner_id FROM restaurants
    WHERE id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Restaurant owners can update their menu images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'menu-images' AND
  auth.uid() IN (
    SELECT owner_id FROM restaurants
    WHERE id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Restaurant owners can delete their menu images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'menu-images' AND
  auth.uid() IN (
    SELECT owner_id FROM restaurants
    WHERE id::text = (storage.foldername(name))[1]
  )
);