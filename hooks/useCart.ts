// React hook for cart with real-time sync
'use client';
import { useState, useEffect, useCallback } from 'react';

type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  customization_note: string | null;
  customization_image: string | null;
  created_at: string;
  updated_at: string;
  products?: any;
};

export function useCart(userId: string | null) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      setTotalItems(0);
      setTotalPrice(0);
      setLoading(false);
      return;
    }

    fetchCart();
  }, [userId]);

  useEffect(() => {
    // Calculate totals
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const price = items.reduce((sum, item) => {
      if (item.products) {
        const itemPrice = item.products.price * (1 - (item.products.discount_percentage || 0) / 100);
        return sum + (itemPrice * item.quantity);
      }
      return sum;
    }, 0);

    setTotalItems(count);
    setTotalPrice(price);
  }, [items]);

  async function fetchCart() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/cart?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch cart');
      }

      setItems(data.cart || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const addItem = useCallback(async (
    productId: string,
    quantity: number = 1,
    customizationNote?: string,
    customizationImage?: string
  ) => {
    if (!userId) {
      throw new Error('User must be logged in to add items to cart');
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          product_id: productId,
          quantity,
          customization_note: customizationNote,
          customization_image: customizationImage
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add item to cart');
      }

      await fetchCart();
    } catch (err: any) {
      throw new Error(err.message);
    }
  }, [userId]);

  const updateItem = useCallback(async (
    itemId: string,
    quantity?: number,
    customizationNote?: string,
    customizationImage?: string
  ) => {
    try {
      const updates: any = {};
      if (quantity !== undefined) updates.quantity = quantity;
      if (customizationNote !== undefined) updates.customization_note = customizationNote;
      if (customizationImage !== undefined) updates.customization_image = customizationImage;

      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, ...updates })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update cart item');
      }

      await fetchCart();
    } catch (err: any) {
      throw new Error(err.message);
    }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart?id=${itemId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove item from cart');
      }

      await fetchCart();
    } catch (err: any) {
      throw new Error(err.message);
    }
  }, []);

  const clearCart = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/cart?userId=${userId}&clearAll=true`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to clear cart');
      }

      await fetchCart();
    } catch (err: any) {
      throw new Error(err.message);
    }
  }, [userId]);

  return {
    items,
    loading,
    error,
    totalItems,
    totalPrice,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    refetch: fetchCart
  };
}

