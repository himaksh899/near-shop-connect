import { Button } from "@/components/ui/button";
import { Store, ShoppingBag, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const vendorFeatures = [
  "Easy shop registration & profile setup",
  "Add & manage products with images",
  "Real-time order notifications",
  "Accept or reject orders instantly",
  "Track delivery status",
  "No expensive website needed"
];

const customerFeatures = [
  "Browse shops near your location",
  "Search products across all shops",
  "Add items to cart & checkout easily",
  "Choose pickup or delivery",
  "Real-time order tracking",
  "View order history & receipts"
];

const UserTypes = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Built for Everyone
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're a local vendor or a customer, NearBuy has everything you need
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Vendor Card */}
          <div className="p-8 rounded-3xl bg-card shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all duration-300 border border-border">
            <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-6">
              <Store className="h-10 w-10 text-primary" />
            </div>
            
            <h3 className="text-3xl font-bold mb-4 text-card-foreground">
              For Vendors
            </h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Empower your local business with digital tools to reach more customers
            </p>
            
            <ul className="space-y-3 mb-8">
              {vendorFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 rounded-full bg-primary/10">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-card-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => navigate("/auth")}
            >
              Register Your Shop
            </Button>
          </div>
          
          {/* Customer Card */}
          <div className="p-8 rounded-3xl bg-card shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all duration-300 border border-border">
            <div className="inline-flex p-4 rounded-2xl bg-accent/10 mb-6">
              <ShoppingBag className="h-10 w-10 text-accent" />
            </div>
            
            <h3 className="text-3xl font-bold mb-4 text-card-foreground">
              For Customers
            </h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Discover and order from local shops with just a few taps
            </p>
            
            <ul className="space-y-3 mb-8">
              {customerFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 rounded-full bg-accent/10">
                    <Check className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-card-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              variant="outline" 
              className="w-full" 
              size="lg"
              onClick={() => navigate("/auth")}
            >
              Start Shopping
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserTypes;
