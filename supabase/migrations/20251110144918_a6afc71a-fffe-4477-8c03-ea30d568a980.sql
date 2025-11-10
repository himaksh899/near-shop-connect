-- Add delivery and pickup options to shops table
ALTER TABLE public.shops 
ADD COLUMN delivery_available boolean DEFAULT true,
ADD COLUMN pickup_available boolean DEFAULT true,
ADD COLUMN delivery_fee numeric DEFAULT 0;

-- Create products table
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  image_url text,
  stock integer DEFAULT 0 CHECK (stock >= 0),
  category text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products are viewable by everyone
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

-- Shop owners can manage their products
CREATE POLICY "Shop owners can insert their products" 
ON public.products 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.shops 
    WHERE shops.id = products.shop_id 
    AND shops.user_id = auth.uid()
  )
);

CREATE POLICY "Shop owners can update their products" 
ON public.products 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.shops 
    WHERE shops.id = products.shop_id 
    AND shops.user_id = auth.uid()
  )
);

CREATE POLICY "Shop owners can delete their products" 
ON public.products 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.shops 
    WHERE shops.id = products.shop_id 
    AND shops.user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add delivery_type to orders
ALTER TABLE public.orders 
ADD COLUMN delivery_type text CHECK (delivery_type IN ('delivery', 'pickup')),
ADD COLUMN delivery_address text,
ADD COLUMN delivery_fee numeric DEFAULT 0;