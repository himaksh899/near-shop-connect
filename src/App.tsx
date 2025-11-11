import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import VendorHome from "./pages/VendorHome";
import VendorShop from "./pages/VendorShop";
import VendorProducts from "./pages/VendorProducts";
import VendorOrders from "./pages/VendorOrders";
import Profile from "./pages/Profile";
import BrowseNearby from "./pages/BrowseNearby";
import ShopDetail from "./pages/ShopDetail";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Favourites from "./pages/Favourites";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/home" element={<Home />} />
          <Route path="/vendor-home" element={<VendorHome />} />
          <Route path="/vendor-shop" element={<VendorShop />} />
          <Route path="/vendor-products" element={<VendorProducts />} />
          <Route path="/vendor-orders" element={<VendorOrders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/browse-nearby" element={<BrowseNearby />} />
          <Route path="/shop/:id" element={<ShopDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/favourites" element={<Favourites />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
