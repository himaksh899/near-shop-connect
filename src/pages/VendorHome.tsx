import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, Package, ShoppingCart, Settings, Plus } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface Shop {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  location: string | null;
  category: string | null;
}

const VendorHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<Shop | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        fetchShop(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        fetchShop(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchShop = async (userId: string) => {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      setShop(data);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center space-y-4">
          <Store className="w-16 h-16 mx-auto text-primary animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading your shop...</p>
        </div>
      </div>
    );
  }

  const userName = user?.user_metadata?.name || 'Vendor';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {userName}! 👋</h1>
          <p className="text-muted-foreground text-lg">
            Manage your shop and grow your business
          </p>
        </div>

        {!shop ? (
          <Card className="mb-8 border-dashed border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-6 h-6" />
                Set Up Your Shop
              </CardTitle>
              <CardDescription>
                You haven't created a shop yet. Create one to start selling!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="gap-2" onClick={() => navigate('/vendor-shop')}>
                <Plus className="w-5 h-5" />
                Create Your Shop
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-6 h-6" />
                {shop.name}
              </CardTitle>
              <CardDescription>
                {shop.description || 'No description provided'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm text-muted-foreground">
                {shop.location && <span>📍 {shop.location}</span>}
                {shop.category && <span>🏷️ {shop.category}</span>}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/vendor-shop')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>My Shop</CardTitle>
              <CardDescription>
                Update shop details, hours, and location
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/vendor-products')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Manage your product catalog
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/vendor-orders')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                View and manage customer orders
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Configure shop preferences
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">Orders Today</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">$0</div>
                <div className="text-sm text-muted-foreground">Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorHome;
