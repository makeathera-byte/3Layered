// React hook for products
'use client';
import { useState, useEffect } from 'react';

type Product = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  images: string[];
  category: string;
  material: string | null;
  inventory: number;
  is_customizable: boolean;
  is_trending: boolean;
  is_featured: boolean;
  discount_percentage: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export function useProducts(filters?: {
  category?: string;
  trending?: boolean;
  featured?: boolean;
  limit?: number;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [filters?.category, filters?.trending, filters?.featured, filters?.limit]);

  async function fetchProducts() {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.trending) params.append('trending', 'true');
      if (filters?.featured) params.append('featured', 'true');
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      setProducts(data.products || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { products, loading, error, refetch: fetchProducts };
}

export function useProduct(id: string | null) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setProduct(null);
      setLoading(false);
      return;
    }

    fetchProduct();
  }, [id]);

  async function fetchProduct() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch product');
      }

      setProduct(data.product);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { product, loading, error, refetch: fetchProduct };
}

