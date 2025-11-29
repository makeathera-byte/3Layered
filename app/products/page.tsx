"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  category: string;
  is_trending: boolean;
  is_featured: boolean;
  discount_percentage: number;
}

export default function ProductsPage() {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({
    "HOME DECOR": "/api/category-image/home-decor",
    "TABLE TOP": "/api/category-image/table-top",
    "GOD'S SCULPTURE": "/api/category-image/gods-sculpture",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
    loadCategoryImages();
  }, []);

  const loadCategoryImages = async () => {
    try {
      const response = await fetch('/api/category-images');
      if (response.ok) {
        const data = await response.json();
        if (data.categoryImages) {
          // Map database keys to display labels
          const mappedImages: Record<string, string> = {
            "HOME DECOR": data.categoryImages["home-decor"] || "/api/category-image/home-decor",
            "TABLE TOP": data.categoryImages["table-top"] || "/api/category-image/table-top",
            "GOD'S SCULPTURE": data.categoryImages["gods-sculpture"] || "/api/category-image/gods-sculpture",
          };
          setCategoryImages(mappedImages);
        }
      }
    } catch (error) {
      console.error('Error loading category images:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Fetch trending products
      const trendingRes = await fetch('/api/products?trending=true&limit=4');
      const trendingData = await trendingRes.json();
      setTrendingProducts(trendingData.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative glass rounded-2xl p-4 sm:p-6 md:p-8">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-green-900">Products</h1>
      <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-green-900">A curated selection of functional and artistic pieces, produced in premium PLA and finished for daily use.</p>

      <div className="mt-6 sm:mt-8">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-green-900">Categories</h2>
        <div className="mt-2 sm:mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
          {[
            { label: "HOME DECOR", href: "/products/home-decor" },
            { label: "TABLE TOP", href: "/products/table-top" },
            { label: "GOD'S SCULPTURE", href: "/products/gods-sculpture" },
          ].map((c, i) => (
            <Link
              key={c.label}
              href={c.href}
              className="group glass rounded-lg sm:rounded-xl overflow-hidden hover:shadow-glow transition-shadow"
            >
              <div className="relative w-full aspect-square bg-white/10 dark:bg-slate-800/50 ring-1 ring-white/10 dark:ring-white/5 overflow-hidden">
                {categoryImages[c.label] && categoryImages[c.label].startsWith('http') ? (
                  <img
                    src={categoryImages[c.label]}
                    alt={c.label}
                    className="object-cover w-full h-full"
                    loading="lazy"
                    decoding="async"
                    style={{ 
                      imageRendering: 'auto',
                      WebkitImageRendering: 'auto'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const categoryName = c.label.replace(/'/g, '%27').replace(/ /g, '+');
                      target.src = `https://via.placeholder.com/800x800/4ade80/ffffff?text=${categoryName}`;
                    }}
                  />
                ) : categoryImages[c.label] ? (
                  <Image
                    src={categoryImages[c.label]}
                    alt={c.label}
                    fill
                    className="object-cover"
                    quality={100}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <img
                    src={`/api/category-image?index=${i}`}
                    alt={c.label}
                    className="object-cover w-full h-full"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/25 to-emerald-400/20 mix-blend-soft-light group-hover:opacity-90 transition-opacity" />
              </div>
              <div className="p-2 sm:p-4 text-center">
                <span className="text-xs sm:text-sm text-green-900 font-semibold tracking-wide">{c.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 sm:mt-10">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-green-900">Materials</h2>
        <div className="mt-2 sm:mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {[
            {
              name: "PLA+",
              desc: "Smooth finish with great detail — ideal for everyday prints.",
            },
            {
              name: "Premium PET-G",
              desc: "Strong and impact-resistant with slight flexibility — great for functional parts.",
            },
            {
              name: "Durable ABS",
              desc: "Heat-resistant and robust — suited for prototypes and enclosures.",
            },
          ].map((m) => (
            <div key={m.name} className="glass rounded-lg sm:rounded-xl p-3 sm:p-5">
              <div className="text-sm sm:text-base text-green-900 font-semibold tracking-wide">{m.name}</div>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-green-900">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Products */}
      <div className="mt-6 sm:mt-10">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-green-900">Trending Products</h2>
        {loading ? (
          <div className="mt-2 sm:mt-4 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass rounded-lg sm:rounded-xl overflow-hidden animate-pulse">
                <div className="relative w-full aspect-square bg-slate-700/50" />
                <div className="p-2 sm:p-4">
                  <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : trendingProducts.length > 0 ? (
          <div className="mt-2 sm:mt-4 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-5">
            {trendingProducts.map((product) => {
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
          <p className="mt-4 text-green-900">No trending products available</p>
        )}
      </div>

      <Footer />
    </section>
  );
}
