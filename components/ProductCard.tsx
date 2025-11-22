"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  image: string;
  discountPercentage?: number;
  originalPrice?: number;
  textColor?: string; // Optional custom text color for product name
}

export default function ProductCard({ id, name, price, image, discountPercentage, originalPrice, textColor }: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  const priceNumber = parseInt(price.replace(/[^0-9]/g, ""));

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart({
      id,
      name,
      price: priceNumber,
      image,
    });
    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => {
      router.push("/cart");
    }, 600);
  };

  return (
    <div className="group glass rounded-xl overflow-hidden hover:shadow-glow transition-all">
      <Link href={`/products/${id}`}>
        <div className="relative w-full aspect-square bg-white/10 dark:bg-slate-800/50 ring-1 ring-white/10 dark:ring-white/5 cursor-pointer">
          <img
            src={image}
            alt={name}
            className="object-cover w-full h-full"
            loading="lazy"
          />
          {discountPercentage && discountPercentage > 0 && (
            <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-1 rounded-full font-bold text-xs sm:text-sm shadow-lg z-10">
              {discountPercentage}% OFF
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/25 to-emerald-400/20 mix-blend-soft-light group-hover:opacity-90 transition-opacity" />
        </div>
      </Link>
      
      <div className="p-3 sm:p-5">
        <Link href={`/products/${id}`}>
          <h3 className={`font-semibold text-sm sm:text-lg mb-1 sm:mb-2 line-clamp-2 hover:text-emerald-600 transition-colors cursor-pointer ${textColor || 'text-slate-800 dark:text-white'}`}>
            {name}
          </h3>
        </Link>
        
        {/* Price and Discount */}
        <div className="mb-2 sm:mb-4">
          {discountPercentage && discountPercentage > 0 ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {price}
                </p>
                {originalPrice && (
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-400 line-through">
                    ₹{originalPrice.toLocaleString()}
                  </p>
                )}
                <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-xs font-bold">
                  {discountPercentage}% OFF
                </span>
              </div>
            </div>
          ) : (
            <p className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {price}
            </p>
          )}
        </div>

        <div className="flex gap-1.5 sm:gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex-1 glass px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? "Added!" : "Add to Cart"}
          </button>
          
          <button
            onClick={handleBuyNow}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:text-white"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
