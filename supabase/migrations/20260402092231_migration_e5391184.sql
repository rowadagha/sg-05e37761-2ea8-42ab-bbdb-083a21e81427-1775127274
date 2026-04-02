-- Create promotional_banners table
CREATE TABLE IF NOT EXISTS promotional_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_promotional_banners_restaurant ON promotional_banners(restaurant_id);
CREATE INDEX idx_promotional_banners_active ON promotional_banners(is_active);
CREATE INDEX idx_promotional_banners_dates ON promotional_banners(start_date, end_date);

-- Add RLS policies (T2 pattern - public read, authenticated write)
ALTER TABLE promotional_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_banners" ON promotional_banners
  FOR SELECT USING (true);

CREATE POLICY "owners_manage_banners" ON promotional_banners
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

-- Update storage policies to include promotional-banners folder
INSERT INTO storage.buckets (id, name, public)
VALUES ('promotional-banners', 'promotional-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for promotional banners
CREATE POLICY "public_read_promotional_banners" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'promotional-banners');

CREATE POLICY "owners_upload_promotional_banners" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'promotional-banners' AND
    auth.uid()::text IN (
      SELECT owner_id::text FROM restaurants
      WHERE id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "owners_delete_promotional_banners" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'promotional-banners' AND
    auth.uid()::text IN (
      SELECT owner_id::text FROM restaurants
      WHERE id::text = (storage.foldername(name))[1]
    )
  );