-- Allow vendors to view orders for their shops
CREATE POLICY "Vendors can view orders for their shops"
ON public.orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.shops
    WHERE shops.id = orders.shop_id
    AND shops.user_id = auth.uid()
  )
);

-- Allow vendors to update order status for their shops
CREATE POLICY "Vendors can update orders for their shops"
ON public.orders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.shops
    WHERE shops.id = orders.shop_id
    AND shops.user_id = auth.uid()
  )
);