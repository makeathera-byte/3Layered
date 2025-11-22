"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase/client";


interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  material?: string;
  discount_percentage?: number;
  is_customizable?: boolean;
  inventory?: number;
  is_trending?: boolean;
}

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
  user?: {
    full_name: string;
    photo_url?: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [imageZoomed, setImageZoomed] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [customization, setCustomization] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [customizationSaved, setCustomizationSaved] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadProduct(params.id as string);
    }
  }, [params.id]);

  const loadProduct = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();
      
      if (!response.ok) {
        console.error("API Error:", data);
        throw new Error(data.error || data.details || "Product not found");
      }
      
      if (!data.product) {
        throw new Error("Product data is missing");
      }
      
      setProduct(data.product);
      
      // Load reviews
      loadReviews(id);
    } catch (error: any) {
      console.error("Error loading product:", error);
      alert(`Failed to load product: ${error.message || "Product not found"}`);
      router.push("/products");
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (productId: string) => {
    try {
      // Mock data for demonstration
      const mockReviews: Review[] = [
        {
          id: "1",
          user_id: "user1",
          rating: 5,
          comment: "Excellent quality! The 3D print is very detailed and finished beautifully. The material feels premium and the dimensions are exactly as described. Highly recommend!",
          is_verified_purchase: true,
          created_at: new Date().toISOString(),
          user: { full_name: "Rajesh Kumar" }
        },
        {
          id: "2",
          user_id: "user2",
          rating: 4,
          comment: "Great product, fast delivery. Would recommend! The finish is smooth and the product looks exactly like the images.",
          is_verified_purchase: true,
          created_at: new Date().toISOString(),
          user: { full_name: "Priya Singh" }
        }
      ];
      
      setReviews(mockReviews);
      setTotalReviews(mockReviews.length);
      
      if (mockReviews.length > 0) {
        const avgRating = mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length;
        setAverageRating(avgRating);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    }
  };

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClass = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClass} ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
    );
  };

  const handleSaveCustomization = () => {
    if (!customization.trim()) {
      alert("Please enter customization details.");
      return;
    }

    // Just mark as saved - will be sent to backend when order is placed
    setCustomizationSaved(true);
    alert("Customization details saved! Add to cart to proceed with your customized order.");
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // If customization is entered but not saved, prompt user
    if (customization.trim() && !customizationSaved) {
      alert("Please click 'Save Customization' before adding to cart.");
      return;
    }
    
    setIsAdding(true);
    addToCart({
      id: product.id,
      name: product.title,
      price: discountedPrice, // Use discounted price instead of original price
      originalPrice: product.discount_percentage ? product.price : undefined, // Original price if discount exists
      discountPercentage: product.discount_percentage || undefined, // Discount percentage
      image: product.images[0] || "",
      customization: customization.trim() || undefined,
      driveLink: driveLink.trim() || undefined,
      isCustomized: showCustomize && customizationSaved,
    });
    setTimeout(() => {
      setIsAdding(false);
      setCustomization("");
      setDriveLink("");
      setShowCustomize(false);
      setCustomizationSaved(false);
    }, 500);
  };

  const handleCallCustomerCare = () => {
    window.location.href = "tel:+919982781000";
  };

  if (loading) {
    return (
      <section className="relative glass rounded-2xl p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-green-800 text-lg">Loading product details...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="relative glass rounded-2xl p-4 sm:p-6 md:p-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-3xl font-bold text-green-800 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link 
            href="/products" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Products
          </Link>
        </div>
      </section>
    );
  }

  const discountedPrice = product.discount_percentage
    ? Math.round(product.price - (product.price * product.discount_percentage) / 100)
    : product.price;

  const formatDimensions = () => {
    if (!product.dimensions) return "Not specified";
    const { length, width, height, unit = "cm" } = product.dimensions;
    const dims = [length, width, height].filter(Boolean);
    if (dims.length === 0) return "Not specified";
    return `${dims.join(" × ")} ${unit}`;
  };

  return (
    <section className="relative glass rounded-2xl p-3 sm:p-6 md:p-8 lg:p-10">
      {/* Enhanced Breadcrumb */}
      <nav className="mb-3 sm:mb-8 text-sm">
        <div className="flex items-center gap-2 text-green-800">
          <Link href="/" className="hover:text-emerald-600 transition-colors font-medium">Home</Link>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/products" className="hover:text-emerald-600 transition-colors font-medium">Products</Link>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-600 font-medium">{product.title}</span>
        </div>
      </nav>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-12">
        {/* Enhanced Image Gallery */}
        <div className="space-y-4">
          {/* Main Image with Zoom */}
          <div 
            className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl group cursor-zoom-in"
            onClick={() => setImageZoomed(!imageZoomed)}
          >
            {product.images && product.images.length > 0 ? (
              <>
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.title}
                  className={`w-full h-full object-cover transition-transform duration-300 ${imageZoomed ? 'scale-150' : 'group-hover:scale-105'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {product.discount_percentage && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg animate-pulse">
                    {product.discount_percentage}% OFF
                  </div>
                )}
                {imageZoomed && (
                  <div 
                    className="absolute inset-0 bg-black/30 cursor-zoom-out"
                    onClick={() => setImageZoomed(false)}
                  ></div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">No Image Available</p>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Thumbnail Images */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all transform ${
                    selectedImageIndex === index
                      ? "border-emerald-500 ring-4 ring-emerald-200 scale-105 shadow-lg"
                      : "border-gray-200 hover:border-emerald-300 hover:scale-102"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {selectedImageIndex === index && (
                    <div className="absolute inset-0 bg-emerald-500/20"></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Product Info */}
        <div className="space-y-3 sm:space-y-6 flex flex-col">
          {/* Title & Badges */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-green-800 leading-tight flex-1">
                {product.title}
              </h1>
              {(product as any).is_trending && (
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                  🔥 Trending
                </span>
              )}
            </div>
            
            {/* Rating & Reviews */}
            {totalReviews > 0 && (
              <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full">
                  {renderStars(Math.round(averageRating), "md")}
                  <span className="text-lg font-bold text-gray-800 ml-1">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}
            
            {/* Price Section */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-3 sm:mb-6 border border-emerald-100">
              <div className="flex items-baseline gap-4 flex-wrap">
                {product.discount_percentage ? (
                  <>
                    <div>
                      <span className="text-4xl md:text-5xl font-bold text-emerald-600">
                        ₹{discountedPrice.toLocaleString()}
                      </span>
                      <span className="text-lg text-gray-500 ml-2">incl. GST</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl text-gray-500 line-through">
                        ₹{product.price.toLocaleString()}
                      </span>
                      <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-sm font-bold mt-1">
                        Save {product.discount_percentage}%
                      </span>
                    </div>
                  </>
                ) : (
                  <div>
                    <span className="text-4xl md:text-5xl font-bold text-emerald-600">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span className="text-lg text-gray-500 ml-2">incl. GST</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stock Status */}
            {product.inventory !== undefined && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold mb-4 ${
                product.inventory > 0 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                <div className={`w-2 h-2 rounded-full ${product.inventory > 0 ? "bg-green-500" : "bg-red-500"} animate-pulse`}></div>
                {product.inventory > 0 ? `In Stock (${product.inventory} available)` : "Out of Stock"}
              </div>
            )}
          </div>

          {/* Action Buttons - Mobile: Show first, Desktop: Show after description */}
          <div className="space-y-2 sm:space-y-3 order-1 md:order-3">
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isAdding || (product.inventory !== undefined && product.inventory === 0)}
                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-emerald-600 text-white rounded-lg sm:rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:text-white flex items-center justify-center gap-2"
              >
                {isAdding ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  handleAddToCart();
                  setTimeout(() => router.push("/cart"), 500);
                }}
                disabled={isAdding || (product.inventory !== undefined && product.inventory === 0)}
                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-emerald-400 text-white rounded-lg sm:rounded-xl hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:text-white flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Buy Now
              </button>
            </div>

            {/* Customer Care Button */}
            <button
              onClick={handleCallCustomerCare}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-bold text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Customer Care: +91 9982781000
            </button>
          </div>

          {/* Enhanced Description */}
          <div className="prose max-w-none order-2 md:order-1">
            <h3 className="text-lg sm:text-xl font-semibold text-green-800 mb-2 sm:mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
              {product.description || "No description available."}
            </p>
          </div>

          {/* Enhanced Product Details Card */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/50 shadow-lg">
            <h3 className="text-lg sm:text-xl font-semibold text-green-800 mb-3 sm:mb-5 flex items-center gap-2">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Product Details
            </h3>
            
            <div className="space-y-3">
              {product.material && (
                <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0">
                  <span className="font-semibold text-gray-700 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Material
                  </span>
                  <span className="text-green-800 font-medium">{product.material}</span>
                </div>
              )}

              {product.dimensions && (
                <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0">
                  <span className="font-semibold text-gray-700 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                    </svg>
                    Dimensions
                  </span>
                  <span className="text-green-800 font-medium">{formatDimensions()}</span>
                </div>
              )}

              {product.category && (
                <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0">
                  <span className="font-semibold text-gray-700 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Category
                  </span>
                  <span className="text-green-800 font-medium capitalize">{product.category.replace("-", " ")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Quantity & Actions */}
          <div className="space-y-3 sm:space-y-5 order-3 md:order-2">
            {/* Quantity Selector */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 sm:p-5 border border-white/50">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-xl border-2 border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 transition-all font-bold text-lg text-gray-700 hover:text-emerald-600"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 text-center px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-semibold text-lg"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 rounded-xl border-2 border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 transition-all font-bold text-lg text-gray-700 hover:text-emerald-600"
                >
                  +
                </button>
                <div className="ml-auto text-sm text-gray-600">
                  <span className="font-semibold">Total: </span>
                  <span className="text-emerald-600 font-bold text-lg">₹{(discountedPrice * quantity).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Customization Section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 sm:p-5 border border-white/50">
              <button
                onClick={() => setShowCustomize(!showCustomize)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-lg hover:from-emerald-100 hover:to-green-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="font-bold text-emerald-800">Customize This Product</span>
                </div>
                <svg
                  className={`w-5 h-5 text-emerald-600 transition-transform ${showCustomize ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showCustomize && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Customization Details <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={customization}
                      onChange={(e) => {
                        setCustomization(e.target.value);
                        setCustomizationSaved(false);
                      }}
                      placeholder="Describe how you want to customize this product (e.g., size, color, design, text, etc.)"
                      className="w-full rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 transition-all resize-none"
                      rows={4}
                    />
                  </div>

                  {/* Google Drive Link Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Google Drive Link <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={driveLink}
                      onChange={(e) => {
                        setDriveLink(e.target.value);
                        setCustomizationSaved(false);
                      }}
                      placeholder="e.g., https://drive.google.com/drive/folders/..."
                      className="w-full rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 transition-all"
                    />
                    <p className="mt-2 text-xs text-gray-600 flex items-start gap-1">
                      <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        Share your design files, reference images, or 3D models via Google Drive. Make sure the link is set to "Anyone with the link" for access.
                      </span>
                    </p>
                  </div>

                  {/* Note about team calling */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-blue-800 font-medium">
                        Our team will call you to take more details about your customization.
                      </p>
                    </div>
                  </div>

                  {/* Save Customization Button */}
                  <button
                    onClick={handleSaveCustomization}
                    disabled={!customization.trim() || customizationSaved}
                    className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl disabled:text-white flex items-center justify-center gap-2"
                  >
                    {customizationSaved ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Customization Saved
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Customization
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Customizable Badge */}
            {product.is_customizable && (
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✨</div>
                  <div>
                    <p className="font-bold text-emerald-800 mb-1">Customizable Product</p>
                    <p className="text-sm text-emerald-700">
                      This product can be customized according to your preferences. Contact us for custom options and pricing.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Reviews Section */}
      {reviews.length > 0 && (
        <div className="mt-16 pt-12 border-t-2 border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-green-800 flex items-center gap-3">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Customer Reviews
            </h2>
          </div>
          
          {/* Enhanced Rating Summary */}
          <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-8 mb-8 border border-emerald-100 shadow-lg">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-center">
                <div className="text-6xl font-bold text-emerald-600 mb-3">
                  {averageRating.toFixed(1)}
                </div>
                {renderStars(Math.round(averageRating), "lg")}
                <p className="text-gray-600 mt-3 font-medium">
                  Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                </p>
              </div>
              
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviews.filter((r) => r.rating === stars).length;
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-700 w-8">{stars}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Enhanced Individual Reviews */}
          <div className="grid md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {review.user?.photo_url ? (
                      <img
                        src={review.user.photo_url}
                        alt={review.user.full_name}
                        className="w-14 h-14 rounded-full border-2 border-emerald-200"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg border-2 border-emerald-200">
                        {review.user?.full_name?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-bold text-gray-800">
                        {review.user?.full_name || "Anonymous"}
                      </span>
                      {review.is_verified_purchase && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 mb-3">
                      {renderStars(review.rating, "sm")}
                      <span className="text-xs text-gray-500 font-medium">
                        {new Date(review.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </section>
  );
}
