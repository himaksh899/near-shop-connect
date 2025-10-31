import { MapPin, Package, Bell, TrendingUp, CreditCard, Clock } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Location-Based Discovery",
    description: "Find shops and products available near you instantly with smart location tracking.",
    color: "primary"
  },
  {
    icon: Package,
    title: "Real-Time Inventory",
    description: "See what's in stock right now. No more calling shops to check availability.",
    color: "accent"
  },
  {
    icon: Bell,
    title: "Order Updates",
    description: "Get instant notifications when your order is confirmed, ready, or delivered.",
    color: "primary"
  },
  {
    icon: TrendingUp,
    title: "Vendor Growth",
    description: "Local shops can grow their business digitally without expensive setups.",
    color: "accent"
  },
  {
    icon: CreditCard,
    title: "Easy Payments",
    description: "Multiple payment options including cash on delivery and digital payments.",
    color: "primary"
  },
  {
    icon: Clock,
    title: "Quick & Convenient",
    description: "Save time by browsing multiple shops at once and ordering with a few taps.",
    color: "accent"
  }
];

const Features = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Why Choose NearBuy?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to connect local businesses with customers in one powerful platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-card shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`inline-flex p-4 rounded-xl mb-4 ${
                feature.color === "primary" ? "bg-primary/10" : "bg-accent/10"
              }`}>
                <feature.icon className={`h-8 w-8 ${
                  feature.color === "primary" ? "text-primary" : "text-accent"
                }`} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-card-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
