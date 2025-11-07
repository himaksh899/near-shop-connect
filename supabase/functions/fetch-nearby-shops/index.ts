import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, radius = 5000 } = await req.json();

    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required');
    }

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      throw new Error('Google Places API key not configured');
    }

    console.log(`Fetching shops near ${latitude}, ${longitude} with radius ${radius}m`);

    // Fetch nearby places from Google Places API
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=store&key=${apiKey}`;
    
    const placesResponse = await fetch(placesUrl);
    const placesData = await placesResponse.json();

    if (placesData.status !== 'OK' && placesData.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', placesData);
      throw new Error(`Google Places API error: ${placesData.status}`);
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const shops = placesData.results?.slice(0, 20).map((place: any) => ({
      name: place.name,
      description: place.vicinity || 'Local business',
      location: place.vicinity,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      category: place.types?.[0] || 'store',
      image_url: place.photos?.[0] 
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${apiKey}`
        : null,
      user_id: user.id,
    })) || [];

    console.log(`Found ${shops.length} shops`);

    return new Response(
      JSON.stringify({ shops }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});