import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Package, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { format } from 'date-fns';

// Apply vendor theme
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', 'vendor');
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  delivery_fee: number;
  delivery_type: string;
  delivery_address: string | null;
  status: string;
  items: any;
  created_at: string;
}

const VendorOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    checkShopAndLoadOrders();
  }, []);

  // Realtime subscription for new orders
  useEffect(() => {
    if (!shopId) return;

    const channel = supabase
      .channel('vendor-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `shop_id=eq.${shopId}`,
        },
        (payload) => {
          console.log('New order received:', payload);
          toast({
            title: '🔔 New Order!',
            description: 'You have received a new order',
          });
          if (shopId) loadOrders(shopId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId, toast]);

  const checkShopAndLoadOrders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }

    const { data: shop } = await supabase
      .from('shops')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (!shop) {
      toast({
        title: 'No Shop Found',
        description: 'Please create a shop first.',
        variant: 'destructive',
      });
      navigate('/vendor-shop');
      return;
    }

    setShopId(shop.id);
    loadOrders(shop.id);
  };

  const loadOrders = async (shopId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Order status changed to ${newStatus}`,
      });

      if (shopId) loadOrders(shopId);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-blue-500';
      case 'preparing':
        return 'bg-purple-500';
      case 'ready':
        return 'bg-green-500';
      case 'delivered':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center overflow-hidden">
        <div className="text-center animate-fade-in-up">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full animate-pulse"></div>
            <Package className="h-20 w-20 text-primary relative animate-scale-in" strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2 animate-fade-in-up">
            Loading Orders
          </h2>
          <p className="text-muted-foreground animate-fade-in-up">
            Fetching customer orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/vendor-home')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Orders</h1>
          <p className="text-muted-foreground">
            Manage your customer orders
          </p>
        </div>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No orders yet. Orders will appear here when customers place them.
                </p>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order.id.slice(0, 8)}
                      </CardTitle>
                      <CardDescription>
                        {format(new Date(order.created_at), 'PPpp')}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Items:</h4>
                      <div className="space-y-2">
                        {order.items.map((item: any, index: number) => (
                          <div
                            key={index}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.name} x{item.quantity}
                            </span>
                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Subtotal</span>
                        <span>
                          ₹{(order.total_amount - order.delivery_fee).toFixed(2)}
                        </span>
                      </div>
                      {order.delivery_fee > 0 && (
                        <div className="flex justify-between text-sm mb-1">
                          <span>Delivery Fee</span>
                          <span>₹{order.delivery_fee.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>₹{order.total_amount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="text-sm mb-2">
                        <span className="font-semibold">Fulfillment: </span>
                        {order.delivery_type === 'delivery' ? '🚚 Delivery' : '📦 Pickup'}
                      </div>
                      {order.delivery_address && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-semibold">Address: </span>
                          {order.delivery_address}
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <label className="text-sm font-semibold mb-2 block">
                        Update Status:
                      </label>
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="preparing">Preparing</SelectItem>
                          <SelectItem value="ready">Ready</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorOrders;
