-- Add theme column to restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'classic';

-- Add comment explaining available themes
COMMENT ON COLUMN public.restaurants.theme IS 'Menu theme: classic, elegant, modern, vibrant, minimal, luxury, nature, ocean, sunset, midnight';