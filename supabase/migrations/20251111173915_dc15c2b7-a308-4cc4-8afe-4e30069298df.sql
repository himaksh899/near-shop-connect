-- Enable realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Create storage bucket for shop and product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'shop-images',
  'shop-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Storage policies for shop-images bucket
CREATE POLICY "Anyone can view shop images"
ON storage.objects FOR SELECT
USING (bucket_id = 'shop-images');

CREATE POLICY "Authenticated users can upload shop images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'shop-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their shop images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'shop-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their shop images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'shop-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);