import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 bg-gradient-to-br from-primary via-primary to-primary/90 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.05),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary-foreground/10 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">Join the Local Revolution</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-primary-foreground">
            Ready to Transform<br />Your Local Shopping?
          </h2>
          
          <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto">
            Join thousands of vendors and customers already using NearBuy to strengthen their local community
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="group shadow-xl hover:shadow-2xl transition-all"
              onClick={() => navigate("/auth")}
            >
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 shadow-lg"
              onClick={() => navigate("/auth")}
            >
              Contact Us
            </Button>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-primary-foreground/80">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-foreground mb-1">500+</div>
              <div className="text-sm">Active Vendors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-foreground mb-1">10K+</div>
              <div className="text-sm">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-foreground mb-1">50K+</div>
              <div className="text-sm">Orders Delivered</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
