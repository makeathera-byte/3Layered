"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  data: string; // base64 encoded file data
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number; // Original price before discount
  discountPercentage?: number; // Discount percentage
  image: string;
  quantity: number;
  customization?: string;
  driveLink?: string;
  uploadedFiles?: UploadedFile[];
  isCustomized?: boolean;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  hasCustomizedItems: () => boolean;
  getCustomizationFee: () => number;
  getOriginalTotalPrice: () => number;
  getTotalSavings: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("3layered-cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("3layered-cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return Math.round(cart.reduce((total, item) => total + item.price * item.quantity, 0));
  };

  const hasCustomizedItems = () => {
    return cart.some(item => item.isCustomized === true);
  };

  const getCustomizationFee = () => {
    return hasCustomizedItems() ? 300 : 0;
  };

  const getOriginalTotalPrice = () => {
    return Math.round(cart.reduce((total, item) => {
      if (item.originalPrice) {
        return total + item.originalPrice * item.quantity;
      }
      return total + item.price * item.quantity;
    }, 0));
  };

  const getTotalSavings = () => {
    return Math.round(cart.reduce((total, item) => {
      if (item.originalPrice && item.discountPercentage) {
        return total + ((item.originalPrice - item.price) * item.quantity);
      }
      return total;
    }, 0));
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        hasCustomizedItems,
        getCustomizationFee,
        getOriginalTotalPrice,
        getTotalSavings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

