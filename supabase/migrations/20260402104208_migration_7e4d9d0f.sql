-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  table_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT orders_status_check CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled'))
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item ON public.order_items(menu_item_id);

-- Add RLS policies for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners_view_orders" ON public.orders
  FOR SELECT
  USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

CREATE POLICY "owners_manage_orders" ON public.orders
  FOR ALL
  USING (restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  ));

-- Add RLS policies for order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners_view_order_items" ON public.order_items
  FOR SELECT
  USING (order_id IN (
    SELECT o.id FROM public.orders o
    JOIN public.restaurants r ON o.restaurant_id = r.id
    WHERE r.owner_id = auth.uid()
  ));

CREATE POLICY "owners_manage_order_items" ON public.order_items
  FOR ALL
  USING (order_id IN (
    SELECT o.id FROM public.orders o
    JOIN public.restaurants r ON o.restaurant_id = r.id
    WHERE r.owner_id = auth.uid()
  ));

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number(restaurant_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  order_count INTEGER;
  order_num TEXT;
BEGIN
  SELECT COUNT(*) INTO order_count
  FROM orders
  WHERE restaurant_id = restaurant_uuid
    AND DATE(created_at) = CURRENT_DATE;
  
  order_num := TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((order_count + 1)::TEXT, 4, '0');
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;