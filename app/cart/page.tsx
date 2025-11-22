"use client";

import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, hasCustomizedItems, getCustomizationFee, getOriginalTotalPrice, getTotalSavings } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  
  const handleCheckout = () => {
    if (!user) {
      // User not logged in, redirect to signup with return URL
      router.push('/signup?returnUrl=/checkout');
    } else {
      // User logged in, proceed to checkout
      router.push('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <section className="px-2 sm:px-0">
        <div className="glass rounded-xl p-8 md:p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
          <svg className="w-24 h-24 text-slate-300 dark:text-slate-800 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h1 className="text-2xl sm:text-3xl font-semibold text-green-900 mb-3">
            Your Cart is Empty
          </h1>
          <p className="text-green-900 mb-6">
            Start adding products to your cart to see them here!
          </p>
          <Link href="/products" className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
            Browse Products
          </Link>
        </div>
        <Footer />
      </section>
    );
  }

  return (
    <section className="px-2 sm:px-0">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-green-900 mb-6">
        Shopping Cart
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="glass rounded-xl p-4 sm:p-6">
              <div className="flex gap-4">
                <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-white/10 dark:bg-slate-800/50">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-lg text-green-900">
                          {item.name}
                        </h3>
                        {item.customization && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full text-xs font-bold shadow-md">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Customized
                          </span>
                        )}
                      </div>
                      {item.customization && (
                        <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">
                            Customization Details:
                          </p>
                          <p className="text-sm text-emerald-800 dark:text-emerald-300">
                            {item.customization}
                          </p>
                        </div>
                      )}
                      {item.driveLink && (
                        <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">
                            📁 Files Shared
                          </p>
                          <a 
                            href={item.driveLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline break-all"
                          >
                            {item.driveLink}
                          </a>
                        </div>
                      )}
                      {item.uploadedFiles && item.uploadedFiles.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-green-900 mb-1">
                            Uploaded Files ({item.uploadedFiles.length}):
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {item.uploadedFiles.map((file, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 glass rounded px-2 py-1 text-xs text-green-900"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="truncate max-w-[120px]">{file.name}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      aria-label="Remove item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 glass rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white/20 dark:hover:bg-white/10 rounded transition-colors"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white/20 dark:hover:bg-white/10 rounded transition-colors"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="text-right">
                      {item.discountPercentage && item.originalPrice ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                              ₹{Math.round(item.price * item.quantity).toLocaleString()}
                            </p>
                            <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-xs font-bold">
                              {item.discountPercentage}% OFF
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 line-through">
                            ₹{Math.round(item.originalPrice * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600">
                            ₹{Math.round(item.price).toLocaleString()} each
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{Math.round(item.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-sm text-green-900">
                            ₹{Math.round(item.price).toLocaleString()} each
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="glass rounded-xl p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-green-900 mb-4">
              Order Summary
            </h2>
            
            <div className="space-y-3 mb-6">
              {(() => {
                const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                const subtotal = getTotalPrice();
                const totalSavings = getTotalSavings();
                const originalTotal = getOriginalTotalPrice();
                const customizationFee = getCustomizationFee();
                
                return (
                  <>
                    <div className="flex justify-between text-green-900">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>₹{Math.round(subtotal).toLocaleString()}</span>
                    </div>
                    {totalSavings > 0 && (
                      <>
                        <div className="flex justify-between text-gray-700 text-sm">
                          <span>Original Price</span>
                          <span className="line-through">₹{Math.round(originalTotal).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between bg-emerald-50 -mx-3 px-3 py-2 rounded-lg">
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            You Saved
                          </span>
                          <span className="text-emerald-700 font-bold text-lg">
                            ₹{Math.round(totalSavings).toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                    {customizationFee > 0 && (
                      <div className="bg-amber-50 -mx-3 px-3 py-2 rounded-lg border border-amber-200">
                        <div className="flex justify-between text-sm text-amber-700">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Customization Fee
                          </span>
                          <span className="font-semibold">+₹{customizationFee.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between text-green-900">
                      <span>Shipping</span>
                      <span className="text-emerald-600">FREE</span>
                    </div>
                    <div className="bg-blue-50 -mx-3 px-3 py-2 rounded-lg border border-blue-200 mt-2">
                      <div className="flex items-center gap-2 text-xs text-blue-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>COD charges (₹25) apply at checkout</span>
                      </div>
                    </div>
                    <div className="border-t border-white/20 pt-3">
                      <div className="flex justify-between text-lg font-bold text-green-900">
                        <span>Subtotal</span>
                        <span>₹{Math.round(subtotal + customizationFee).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Final amount at checkout may vary</p>
                    </div>
                  </>
                );
              })()}
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {user ? 'Proceed to Checkout' : 'Sign Up to Checkout'}
            </button>

            <Link
              href="/products"
              className="block text-center text-emerald-600 dark:text-emerald-400 hover:underline text-sm font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
}

