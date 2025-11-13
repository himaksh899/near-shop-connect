import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, Phone, ShoppingCart, Truck, Store, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  category: string;
}

interface Shop {
  id: string;
  name: string;
  description: string;
  location: string;
  category: string;
  phone: string;
  image_url: string;
  delivery_available: boolean;
  pickup_available: boolean;
  delivery_fee: number;
}

const ShopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, totalItems } = useCart();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadShopDetails();
    }
  }, [id]);

  const loadShopDetails = async () => {
    try {
      setLoading(true);

      // Fetch shop details
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .eq('id', id)
        .single();

      if (shopError) throw shopError;
      setShop(shopData);

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', id)
        .gt('stock', 0)
        .order('category', { ascending: true });

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error loading shop:', error);
      toast({
        title: "Error",
        description: "Failed to load shop details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!shop) return;
    addToCart(product, shop);
    toast({
      title: "Added to cart",
      description: `${product.name} added to your cart`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center overflow-hidden">
        <div className="text-center animate-fade-in-up">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
            <Store className="h-20 w-20 text-primary relative animate-scale-in" strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2 animate-fade-in-up">
            Loading Shop
          </h2>
          <p className="text-muted-foreground animate-fade-in-up">
            Preparing your shopping experience...
          </p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Shop not found</h2>
          <Button onClick={() => navigate('/browse-nearby')}>
            Back to Browse
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/browse-nearby')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Button>

        {/* Shop Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-6">
              {shop.image_url && (
                <img
                  src={shop.image_url}
                  alt={shop.name}
                  className="w-full md:w-48 h-48 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{shop.name}</CardTitle>
                <CardDescription className="text-lg mb-4">
                  {shop.description}
                </CardDescription>
                
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{shop.location}</span>
                  </div>
                  {shop.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{shop.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{shop.category}</Badge>
                  {shop.delivery_available && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      Delivery ₹{shop.delivery_fee}
                    </Badge>
                  )}
                  {shop.pickup_available && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Store className="h-3 w-3" />
                      Pickup Available
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Products Grid */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Products</h2>
        </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No products available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-primary">
                      ₹{Number(product.price).toFixed(2)}
                    </span>
                    <Badge variant="secondary">
                      Stock: {product.stock}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="w-full"
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Floating Cart Button */}
        {totalItems > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              size="lg"
              onClick={() => navigate('/cart')}
              className="rounded-full shadow-lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              View Cart ({totalItems})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopDetail;
