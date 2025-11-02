-- Add latitude and longitude columns to shops table for geolocation
ALTER TABLE public.shops 
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION;

-- Add indexes for faster geolocation queries
CREATE INDEX idx_shops_location ON public.shops(latitude, longitude);