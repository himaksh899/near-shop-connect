import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Heart, MapPin, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { calculateDistance, requestGeolocation } from "@/utils/geolocation";

interface Favourite {
  id: string;
  shop_id: string;
  shops: {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    location: string | null;
    category: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  distance?: number;
}

const Favourites = () => {
  const navigate = useNavigate();
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

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
      await loadFavourites(location);
    } catch (error) {
      await loadFavourites();
    }
  };

  const loadFavourites = async (location?: { latitude: number; longitude: number }) => {
    try {
      const { data, error } = await supabase
        .from("favourites")
        .select(`
          *,
          shops (
            id,
            name,
            description,
            image_url,
            location,
            category,
            latitude,
            longitude
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const loc = location || userLocation;
      if (loc && data) {
        const favouritesWithDistance = data.map(fav => ({
          ...fav,
          distance: fav.shops.latitude && fav.shops.longitude
            ? calculateDistance(loc, { latitude: fav.shops.latitude, longitude: fav.shops.longitude })
            : undefined,
        }));
        setFavourites(favouritesWithDistance);
      } else {
        setFavourites(data || []);
      }
    } catch (error: any) {
      toast.error("Failed to load favourites");
    } finally {
      setLoading(false);
    }
  };

  const removeFavourite = async (favouriteId: string) => {
    try {
      const { error } = await supabase
        .from("favourites")
        .delete()
        .eq("id", favouriteId);

      if (error) throw error;

      setFavourites(prev => prev.filter(fav => fav.id !== favouriteId));
      toast.success("Removed from favourites");
    } catch (error: any) {
      toast.error("Failed to remove favourite");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-6">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-foreground mb-6">My Favourites</h1>

        {favourites.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No favourites yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add shops to your favourites to see them here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favourites.map((favourite) => (
              <Card key={favourite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {favourite.shops.image_url && (
                  <img
                    src={favourite.shops.image_url}
                    alt={favourite.shops.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{favourite.shops.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFavourite(favourite.id)}
                    >
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </div>
                  <CardDescription>{favourite.shops.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {favourite.shops.description}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{favourite.shops.location}</span>
                    {favourite.distance !== undefined && (
                      <span className="ml-2 font-semibold">
                        ({favourite.distance} km away)
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

export default Favourites;