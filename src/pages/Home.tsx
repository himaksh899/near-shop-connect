import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Store, MapPin, Search, Package, ShoppingCart, Heart, Navigation, AlertCircle } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { requestGeolocation, calculateDistance, type Coordinates } from "@/utils/geolocation";
import { useToast } from "@/hooks/use-toast";

interface Shop {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  location: string | null;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
}

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopsLoading, setShopsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [manualLocation, setManualLocation] = useState("");
  const [showManualLocation, setShowManualLocation] = useState(false);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          navigate("/auth");
        } else {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const requestLocation = async () => {
      try {
        const coords = await requestGeolocation();
        setUserLocation(coords);
        setLocationError(null);
      } catch (error: any) {
        setLocationError(error.message);
        setShowManualLocation(true);
        toast({
          title: "Location access denied",
          description: "Please enter your location manually to see nearby shops",
          variant: "destructive",
        });
      }
    };

    if (user) {
      requestLocation();
    }
  }, [user]);

  useEffect(() => {
    const fetchShops = async () => {
      setShopsLoading(true);
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching shops:", error);
      } else {
        setShops(data || []);
      }
      setShopsLoading(false);
    };

    if (user) {
      fetchShops();
    }
  }, [user]);

  const filteredShops = shops
    .map((shop) => {
      if (userLocation && shop.latitude && shop.longitude) {
        const distance = calculateDistance(userLocation, {
          latitude: shop.latitude,
          longitude: shop.longitude,
        });
        return { ...shop, distance };
      }
      return { ...shop, distance: null };
    })
    .sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Store className="h-12 w-12 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || "Customer";
  const userType = user?.user_metadata?.user_type || "customer";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            {userType === "customer" 
              ? "Discover amazing products from local shops near you"
              : "Manage your shop and connect with customers"}
          </p>
        </div>

        {/* Location Status */}
        {userType === "customer" && (
          <Card className="mb-8 shadow-[var(--card-shadow-hover)]">
            <CardContent className="p-6">
              {userLocation ? (
                <div className="flex items-center gap-2 text-sm">
                  <Navigation className="h-5 w-5 text-green-500" />
                  <span className="text-muted-foreground">
                    Location enabled - Showing shops near you
                  </span>
                </div>
              ) : showManualLocation ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <AlertCircle className="h-5 w-5" />
                    <span>Location access denied. Enter your location manually:</span>
                  </div>
                  <div className="flex gap-4">
                    <Input
                      placeholder="Enter your city or area..."
                      value={manualLocation}
                      onChange={(e) => setManualLocation(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => {
                        if (manualLocation.trim()) {
                          toast({
                            title: "Location set",
                            description: `Showing shops near ${manualLocation}`,
                          });
                        }
                      }}
                    >
                      Set Location
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>Requesting location access...</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Search Bar */}
        {userType === "customer" && (
          <Card className="mb-8 shadow-[var(--card-shadow-hover)]">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search for products or shops..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                <Button size="lg" className="px-8">
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {userType === "customer" ? (
            <>
              <Card 
                className="shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all cursor-pointer"
                onClick={() => navigate("/browse-nearby")}
              >
                <CardHeader>
                  <div className="p-3 rounded-xl bg-primary/10 w-fit mb-2">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Browse Nearby</CardTitle>
                  <CardDescription>
                    Find shops and products available in your area
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Explore Now
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all cursor-pointer"
                onClick={() => navigate("/orders")}
              >
                <CardHeader>
                  <div className="p-3 rounded-xl bg-accent/10 w-fit mb-2">
                    <ShoppingCart className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>My Orders</CardTitle>
                  <CardDescription>
                    Track your orders and view order history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    View Orders
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all cursor-pointer"
                onClick={() => navigate("/favourites")}
              >
                <CardHeader>
                  <div className="p-3 rounded-xl bg-primary/10 w-fit mb-2">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Favorites</CardTitle>
                  <CardDescription>
                    Your saved shops and favorite products
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    View Favorites
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all cursor-pointer">
                <CardHeader>
                  <div className="p-3 rounded-xl bg-primary/10 w-fit mb-2">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>My Shop</CardTitle>
                  <CardDescription>
                    Manage your shop profile and settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Manage Shop
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all cursor-pointer">
                <CardHeader>
                  <div className="p-3 rounded-xl bg-accent/10 w-fit mb-2">
                    <Package className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>
                    Add and manage your product listings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Manage Products
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all cursor-pointer">
                <CardHeader>
                  <div className="p-3 rounded-xl bg-primary/10 w-fit mb-2">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Orders</CardTitle>
                  <CardDescription>
                    View and manage incoming customer orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    View Orders
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Featured Section */}
        {userType === "customer" && (
          <Card className="shadow-[var(--card-shadow)]">
            <CardHeader>
              <CardTitle className="text-2xl">Featured Shops Near You</CardTitle>
              <CardDescription>Popular local businesses in your area</CardDescription>
            </CardHeader>
            <CardContent>
              {shopsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="h-48 w-full rounded-lg" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : filteredShops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredShops.map((shop) => (
                    <Card key={shop.id} className="overflow-hidden hover:shadow-[var(--card-shadow-hover)] transition-all cursor-pointer">
                      <div className="aspect-video relative bg-muted">
                        {shop.image_url ? (
                          <img
                            src={shop.image_url}
                            alt={shop.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Store className="h-16 w-16 text-muted-foreground opacity-50" />
                          </div>
                        )}
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-xl">{shop.name}</CardTitle>
                          {shop.distance !== null && (
                            <span className="text-sm font-medium text-primary">
                              {shop.distance} km
                            </span>
                          )}
                        </div>
                        {shop.location && (
                          <CardDescription className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {shop.location}
                          </CardDescription>
                        )}
                        {shop.description && (
                          <CardDescription className="line-clamp-2">
                            {shop.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        {shop.category && (
                          <div className="mb-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {shop.category}
                            </span>
                          </div>
                        )}
                        <Button variant="outline" className="w-full">
                          View Shop
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Store className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No shops available yet</p>
                  <p className="text-sm">Shops will appear here once vendors register in your area</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Home;
