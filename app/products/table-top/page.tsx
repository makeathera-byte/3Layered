"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  category: string;
  is_trending: boolean;
  is_featured: boolean;
  discount_percentage: number;
  inventory: number;
}

export default function TableTopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products?category=table-top');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative glass rounded-2xl p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-semibold text-moss">
        Table Top
      </h1>
      <p className="mt-2 text-sm sm:text-base text-moss">
        Elegant and functional table-top accessories for your workspace or home.
      </p>

      {loading ? (
        <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-slate-700/50" />
              <div className="p-4 space-y-2">
                <div className="h-5 bg-slate-700/50 rounded w-3/4"></div>
                <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {products.map((product) => {
            const discountedPrice = product.discount_percentage 
              ? Math.round(product.price * (1 - product.discount_percentage / 100))
              : product.price;
            return (
              <ProductCard 
                key={product.id}
                id={product.id}
                name={product.title}
                price={`₹${Math.round(discountedPrice).toLocaleString()}`}
                image={product.images[0] || '/api/placeholder'}
                discountPercentage={product.discount_percentage}
                originalPrice={product.discount_percentage ? product.price : undefined}
                textColor="text-moss"
              />
            );
          })}
        </div>
      ) : (
        <div className="mt-8 text-center py-12">
          <p className="text-moss text-lg">
            No table-top products available yet
          </p>
          <p className="text-moss text-sm mt-2">
            Check back soon for new arrivals!
          </p>
        </div>
      )}

      <Footer />
    </section>
  );
}
