import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface Shop {
  delivery_available: boolean;
  pickup_available: boolean;
  delivery_fee: number;
  location: string;
}

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, clearCart, totalAmount, currentShopId } = useCart();
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    if (currentShopId) {
      loadShopInfo();
    }
  }, [currentShopId]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to place an order",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    setUser(user);

    // Load user's address
    const { data: profile } = await supabase
      .from('profiles')
      .select('address')
      .eq('id', user.id)
      .single();

    if (profile?.address) {
      setDeliveryAddress(profile.address);
    }
  };

  const loadShopInfo = async () => {
    const { data, error } = await supabase
      .from('shops')
      .select('delivery_available, pickup_available, delivery_fee, location')
      .eq('id', currentShopId)
      .single();

    if (!error && data) {
      setShop(data);
      // Set default delivery type based on availability
      if (data.pickup_available && !data.delivery_available) {
        setDeliveryType('pickup');
      } else if (data.delivery_available && !data.pickup_available) {
        setDeliveryType('delivery');
      }
    }
  };

  const deliveryFee = deliveryType === 'delivery' && shop ? Number(shop.delivery_fee) : 0;
  const finalTotal = totalAmount + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to place an order",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty",
        variant: "destructive",
      });
      return;
    }

    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter a delivery address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const orderItems = items.map(item => ({
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const { error } = await supabase.from('orders').insert({
        user_id: user.id,
        shop_id: currentShopId,
        items: orderItems,
        total_amount: finalTotal,
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'delivery' ? deliveryAddress : null,
        delivery_fee: deliveryFee,
        status: 'pending',
      });

      if (error) throw error;

      toast({
        title: "Order placed!",
        description: "Your order has been placed successfully",
      });

      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Add some products to get started!</p>
              <Button onClick={() => navigate('/browse-nearby')}>
                Browse Shops
              </Button>
            </CardContent>
          </Card>
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
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continue Shopping
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shopping Cart</CardTitle>
                <CardDescription>
                  {items[0]?.shop_name && `Items from ${items[0].shop_name}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.price.toFixed(2)} each
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(item.product_id)}
                          className="ml-auto"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Delivery Type Selection */}
                {shop && (
                  <div className="space-y-3">
                    <Label>Delivery Option</Label>
                    <RadioGroup value={deliveryType} onValueChange={(value: any) => setDeliveryType(value)}>
                      {shop.pickup_available && (
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pickup" id="pickup" />
                          <Label htmlFor="pickup" className="cursor-pointer">
                            Pickup from store
                          </Label>
                        </div>
                      )}
                      {shop.delivery_available && (
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="delivery" id="delivery" />
                          <Label htmlFor="delivery" className="cursor-pointer">
                            Home Delivery (+₹{shop.delivery_fee})
                          </Label>
                        </div>
                      )}
                    </RadioGroup>

                    {deliveryType === 'delivery' && (
                      <div className="space-y-2">
                        <Label htmlFor="address">Delivery Address</Label>
                        <Input
                          id="address"
                          placeholder="Enter your delivery address"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                        />
                      </div>
                    )}

                    {deliveryType === 'pickup' && shop.location && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Pickup Location:</p>
                        <p className="text-sm text-muted-foreground">{shop.location}</p>
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee</span>
                      <span>₹{deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
