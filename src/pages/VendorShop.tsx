import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';

// Apply vendor theme
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', 'vendor');
}

const categories = ['Grocery', 'Vegetables', 'Pharmacy', 'Bakery', 'Dairy', 'Food', 'Other'];

const VendorShop = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [shopId, setShopId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [pickupAvailable, setPickupAvailable] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState('0');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        fetchShop(session.user.id);
      }
    });
  }, [navigate]);

  const fetchShop = async (userId: string) => {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      setShopId(data.id);
      setName(data.name || '');
      setDescription(data.description || '');
      setLocation(data.location || '');
      setCategory(data.category || '');
      setPhone(data.phone || '');
      setEmail(data.email || '');
      setImageUrl(data.image_url || '');
      setImagePreview(data.image_url || null);
      setDeliveryAvailable(data.delivery_available ?? true);
      setPickupAvailable(data.pickup_available ?? true);
      setDeliveryFee(data.delivery_fee?.toString() || '0');
    }
    setLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/shop-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('shop-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('shop-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      toast({
        title: 'Upload Error',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalImageUrl = imageUrl;

      // Upload image if a new file was selected
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      }

      const shopData = {
        user_id: user.id,
        name,
        description,
        location,
        category,
        phone,
        email,
        image_url: finalImageUrl,
        delivery_available: deliveryAvailable,
        pickup_available: pickupAvailable,
        delivery_fee: parseFloat(deliveryFee) || 0,
      };

      if (shopId) {
        // Update existing shop
        const { error } = await supabase
          .from('shops')
          .update(shopData)
          .eq('id', shopId);

        if (error) throw error;

        toast({
          title: 'Success!',
          description: 'Your shop has been updated.',
        });
      } else {
        // Create new shop
        const { error } = await supabase
          .from('shops')
          .insert(shopData);

        if (error) throw error;

        toast({
          title: 'Success!',
          description: 'Your shop has been created.',
        });
        
        navigate('/vendor-home');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/vendor-home')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{shopId ? 'Edit Shop' : 'Create Your Shop'}</CardTitle>
            <CardDescription>
              {shopId ? 'Update your shop information' : 'Set up your shop to start selling'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Shop Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="My Amazing Shop"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell customers about your shop..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat.toLowerCase()}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Street, City"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="shop@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Shop Image</Label>
                {imagePreview && (
                  <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Shop preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        setImageUrl('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('shop-image-file')?.click()}
                    disabled={uploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  <Input
                    id="shop-image-file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Or enter image URL:
                </div>
                <Input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">Fulfillment Options</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="delivery">Delivery Available</Label>
                    <p className="text-sm text-muted-foreground">
                      Offer delivery to customers
                    </p>
                  </div>
                  <Switch
                    id="delivery"
                    checked={deliveryAvailable}
                    onCheckedChange={setDeliveryAvailable}
                  />
                </div>

                {deliveryAvailable && (
                  <div className="space-y-2">
                    <Label htmlFor="deliveryFee">Delivery Fee (₹)</Label>
                    <Input
                      id="deliveryFee"
                      type="number"
                      step="0.01"
                      min="0"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pickup">Pickup Available</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow customers to pick up orders
                    </p>
                  </div>
                  <Switch
                    id="pickup"
                    checked={pickupAvailable}
                    onCheckedChange={setPickupAvailable}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : shopId ? (
                  'Update Shop'
                ) : (
                  'Create Shop'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorShop;
