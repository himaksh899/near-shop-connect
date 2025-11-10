import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  shop_id: string;
  shop_name: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, shop: any) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  currentShopId: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [currentShopId, setCurrentShopId] = useState<string | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setItems(parsedCart.items || []);
      setCurrentShopId(parsedCart.shopId || null);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify({ items, shopId: currentShopId }));
  }, [items, currentShopId]);

  const addToCart = (product: any, shop: any) => {
    // Check if adding from different shop
    if (currentShopId && currentShopId !== shop.id) {
      const confirm = window.confirm(
        'Your cart contains items from another shop. Adding this item will clear your current cart. Continue?'
      );
      if (!confirm) return;
      setItems([]);
    }

    setCurrentShopId(shop.id);

    setItems((prev) => {
      const existingItem = prev.find((item) => item.product_id === product.id);
      
      if (existingItem) {
        return prev.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          id: `${product.id}-${Date.now()}`,
          product_id: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
          image_url: product.image_url,
          shop_id: shop.id,
          shop_name: shop.name,
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => {
      const newItems = prev.filter((item) => item.product_id !== productId);
      if (newItems.length === 0) {
        setCurrentShopId(null);
      }
      return newItems;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setCurrentShopId(null);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
        currentShopId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
