import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, MapPin, Search, Package, ShoppingCart, Heart } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
              <Card className="shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all cursor-pointer">
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

              <Card className="shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all cursor-pointer">
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

              <Card className="shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all cursor-pointer">
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
              <div className="text-center py-12 text-muted-foreground">
                <Store className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No shops available yet</p>
                <p className="text-sm">Shops will appear here once vendors register in your area</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Home;
