-- Add calories column to menu_items table
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS calories integer NULL;

COMMENT ON COLUMN public.menu_items.calories IS 'Calories count for the menu item';