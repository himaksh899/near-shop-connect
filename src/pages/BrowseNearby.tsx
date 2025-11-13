import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { MapPin, Heart, Store, Loader2, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import { calculateDistance, requestGeolocation } from "@/utils/geolocation";

interface Shop {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  location: string | null;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
  distance?: number;
  isFavourite?: boolean;
}

const BrowseNearby = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingNearby, setFetchingNearby] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [favourites, setFavourites] = useState<Set<string>>(new Set());

  useEffect(() => {
    checkAuth();
    getUserLocation();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const getUserLocation = async () => {
    try {
      const location = await requestGeolocation();
      setUserLocation(location);
      toast.success(`Location detected: ${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`);
      
      // Automatically fetch nearby shops after getting location
      setLoading(false);
      setFetchingNearby(true);
      
      const { data, error } = await supabase.functions.invoke('fetch-nearby-shops', {
        body: {
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 5000,
        },
      });

      if (error) {
        console.error("Error fetching nearby shops:", error);
        toast.error("Failed to fetch nearby shops. You can try again with the button.");
      } else {
        toast.success(`Found ${data.shops.length} nearby shops!`);
      }
      
      await loadShops(location);
      setFetchingNearby(false);
    } catch (error) {
      toast.error("Please enable location access to see nearby shops");
      setLoading(false);
    }
  };

  const loadShops = async (location?: { latitude: number; longitude: number }) => {
    try {
      const { data: shopsData, error } = await supabase
        .from("shops")
        .select("*");

      if (error) throw error;

      const { data: favouritesData } = await supabase
        .from("favourites")
        .select("shop_id");

      const favouriteIds = new Set(favouritesData?.map(f => f.shop_id) || []);
      setFavourites(favouriteIds);

      const loc = location || userLocation;
      if (loc && shopsData) {
        const shopsWithDistance = shopsData
          .map(shop => ({
            ...shop,
            distance: shop.latitude && shop.longitude
              ? calculateDistance(loc, { latitude: shop.latitude, longitude: shop.longitude })
              : undefined,
            isFavourite: favouriteIds.has(shop.id),
          }))
          .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

        setShops(shopsWithDistance);
      } else {
        setShops(shopsData?.map(shop => ({ ...shop, isFavourite: favouriteIds.has(shop.id) })) || []);
      }
    } catch (error: any) {
      toast.error("Failed to load shops");
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyShops = async () => {
    if (!userLocation) {
      toast.error("Location not available");
      return;
    }

    setFetchingNearby(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-nearby-shops', {
        body: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius: 5000,
        },
      });

      if (error) throw error;

      toast.success(`Found ${data.shops.length} nearby shops!`);
      await loadShops(userLocation);
    } catch (error: any) {
      toast.error("Failed to fetch nearby shops");
      console.error(error);
    } finally {
      setFetchingNearby(false);
    }
  };

  const toggleFavourite = async (shopId: string) => {
    try {
      if (favourites.has(shopId)) {
        const { error } = await supabase
          .from("favourites")
          .delete()
          .eq("shop_id", shopId);

        if (error) throw error;

        setFavourites(prev => {
          const next = new Set(prev);
          next.delete(shopId);
          return next;
        });
        toast.success("Removed from favourites");
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { error } = await supabase
          .from("favourites")
          .insert({ shop_id: shopId, user_id: user.id });

        if (error) throw error;

        setFavourites(prev => new Set([...prev, shopId]));
        toast.success("Added to favourites");
      }

      setShops(prev => prev.map(shop => 
        shop.id === shopId ? { ...shop, isFavourite: !shop.isFavourite } : shop
      ));
    } catch (error: any) {
      toast.error("Failed to update favourites");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center overflow-hidden">
        <div className="text-center animate-fade-in-up">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
            <MapPin className="h-20 w-20 text-primary relative animate-scale-in" strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2 animate-fade-in-up">
            Finding Shops Near You
          </h2>
          <p className="text-muted-foreground animate-fade-in-up">
            Discovering amazing local businesses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Browse Nearby Shops</h1>
          <Button onClick={fetchNearbyShops} disabled={fetchingNearby}>
            {fetchingNearby ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <Store className="mr-2 h-4 w-4" />
                Fetch Nearby Shops
              </>
            )}
          </Button>
        </div>

        {shops.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Store className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-4">No shops found nearby</p>
              <Button onClick={fetchNearbyShops} disabled={fetchingNearby}>
                {fetchingNearby ? "Fetching..." : "Fetch Nearby Shops"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <Card 
                key={shop.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/shop/${shop.id}`)}
              >
                {shop.image_url && (
                  <img
                    src={shop.image_url}
                    alt={shop.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{shop.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavourite(shop.id);
                      }}
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          shop.isFavourite ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                    </Button>
                  </div>
                  <CardDescription>{shop.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{shop.description}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{shop.location}</span>
                    {shop.distance !== undefined && (
                      <span className="ml-2 font-semibold">
                        ({shop.distance} km away)
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseNearby;