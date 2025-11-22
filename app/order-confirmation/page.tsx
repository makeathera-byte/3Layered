"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";

interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
  customization?: string | null;
  drive_link?: string | null;
  subtotal: number;
}

interface ShippingAddress {
  flat_number: string;
  colony: string;
  city: string;
  state: string;
  pincode: string;
}

interface Order {
  id: string;
  order_number: string;
  user_email: string;
  user_name: string;
  user_phone: string;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping_fee: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  order_notes?: string;
  created_at: string;
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = searchParams.get('order');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to get order number from URL or sessionStorage
    let finalOrderNumber = orderNumber;
    
    if (!finalOrderNumber && typeof window !== 'undefined') {
      finalOrderNumber = sessionStorage.getItem('lastOrderNumber');
      if (finalOrderNumber) {
        // Update URL without reload
        router.replace(`/order-confirmation?order=${encodeURIComponent(finalOrderNumber)}`);
      }
    }
    
    if (!finalOrderNumber) {
      console.warn('[Order Confirmation] No order number found, redirecting to home');
      // Show error message
      if (typeof window !== 'undefined') {
        alert('Order number not found. Please check your order history or contact support.');
      }
      router.push('/');
      return;
    }

    console.log('[Order Confirmation] Fetching order:', finalOrderNumber);

    const fetchOrder = async () => {
      try {
        // Use finalOrderNumber from closure
        if (!finalOrderNumber) {
          throw new Error('Order number not found');
        }
        
        const apiUrl = `/api/orders/create?order_number=${encodeURIComponent(finalOrderNumber)}`;
        console.log('[Order Confirmation] Fetching from:', apiUrl);
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        console.log('[Order Confirmation] API response:', { 
          ok: response.ok, 
          hasOrder: !!data.order,
          error: data.error 
        });
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch order');
        }
        
        if (!data.order) {
          throw new Error('Order data not found in response');
        }
        
        console.log('[Order Confirmation] Order loaded successfully:', data.order.order_number);
        setOrder(data.order);
      } catch (err: any) {
        console.error('[Order Confirmation] Error fetching order:', err);
        setError(err.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    // Small delay to ensure order is saved in database
    const timer = setTimeout(() => {
      fetchOrder();
    }, 500);

    return () => clearTimeout(timer);
  }, [orderNumber, router]);
  
  // Clean up sessionStorage after successful load
  useEffect(() => {
    if (order && typeof window !== 'undefined') {
      sessionStorage.removeItem('lastOrderNumber');
    }
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-green-900 mb-2">Order Placed Successfully!</h1>
          {orderNumber && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Order Number:</p>
              <p className="text-xl font-bold text-emerald-700 font-mono">{orderNumber}</p>
            </div>
          )}
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-900 font-semibold text-lg">Loading your order details...</p>
          <p className="text-gray-600 text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    // If we have an order number, show success screen even without full order data
    if (orderNumber) {
      return (
        <div className="min-h-screen pb-12 bg-gradient-to-br from-emerald-50 via-white to-green-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Success Header */}
            <div className="glass rounded-xl p-8 md:p-12 text-center mb-8 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-green-900 mb-3">🎉 Order Placed Successfully!</h1>
              <p className="text-xl text-gray-700 mb-6">Thank you for your order. We're excited to serve you!</p>
              <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-lg shadow-md border-2 border-emerald-300">
                <span className="text-sm text-gray-700 font-semibold">Order Number:</span>
                <span className="text-2xl font-bold text-emerald-700 font-mono">{orderNumber}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(orderNumber);
                    alert('Order number copied to clipboard!');
                  }}
                  className="ml-2 p-1 hover:bg-emerald-100 rounded transition-colors"
                  title="Copy order number"
                >
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-4">We'll give you updates regarding your order via WhatsApp.</p>
              {error && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">Note: Full order details are loading. Your order has been placed successfully.</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/"
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl text-center text-lg"
              >
                🛍️ Continue Shopping
              </Link>
              <Link
                href="/account"
                className="px-8 py-4 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold rounded-lg transition-all text-center text-lg"
              >
                📦 View My Orders
              </Link>
            </div>

            {/* Support Information */}
            <div className="mt-8 text-center p-6 bg-white rounded-xl border border-emerald-200 shadow-sm">
              <p className="text-gray-700 font-semibold mb-2">Need help with your order?</p>
              <p className="text-sm text-gray-600 mb-3">Contact us at <a href="mailto:3Layered.in@gmail.com" className="text-emerald-600 hover:underline font-semibold">3Layered.in@gmail.com</a></p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Keep your order number <span className="font-bold text-emerald-600">{orderNumber}</span> for reference</span>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      );
    }
    
    // No order number, show error
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass rounded-xl p-8 text-center max-w-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Order Not Found</h1>
          <p className="text-gray-700 mb-6">{error || 'Unable to load order details'}</p>
          <Link href="/" className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen pb-12 bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="glass rounded-xl p-8 md:p-12 text-center mb-8 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-pulse">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-green-900 mb-3">🎉 Order Placed Successfully!</h1>
          <p className="text-xl text-gray-700 mb-6">Thank you for your order. We're excited to serve you!</p>
          <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-lg shadow-md border-2 border-emerald-300">
            <span className="text-sm text-gray-700 font-semibold">Order Number:</span>
            <span className="text-2xl font-bold text-emerald-700 font-mono">{order.order_number}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(order.order_number);
                alert('Order number copied to clipboard!');
              }}
              className="ml-2 p-1 hover:bg-emerald-100 rounded transition-colors"
              title="Copy order number"
            >
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-4">We'll give you updates regarding your order via WhatsApp.</p>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Order Information */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-bold text-green-900 mb-4">Order Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Order Date</p>
                <p className="text-gray-800 font-semibold">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-600">Payment Method</p>
                <p className="text-gray-800 font-semibold">{order.payment_method === 'COD' ? 'Cash on Delivery' : order.payment_method}</p>
              </div>
              <div>
                <p className="text-gray-600">Order Status</p>
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase">
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-bold text-green-900 mb-4">Shipping Address</h2>
            <div className="text-sm text-gray-800 space-y-1">
              <p className="font-semibold">{order.user_name}</p>
              <p>{order.shipping_address.flat_number}</p>
              <p>{order.shipping_address.colony}</p>
              <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
              <p>{order.shipping_address.pincode}</p>
              <p className="mt-3 font-semibold">Phone: {order.user_phone}</p>
              <p>Email: {order.user_email}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="glass rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-green-900 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={item.product_image || "/api/placeholder"}
                    alt={item.product_name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900">{item.product_name}</h3>
                  <p className="text-sm text-gray-700">Quantity: {item.quantity}</p>
                  <p className="text-sm text-gray-700">Price: ₹{Math.round(item.price).toLocaleString()} each</p>
                  {item.customization && (
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-semibold">
                        ⚙️ Customized Order
                      </span>
                      <p className="text-xs text-gray-600 mt-1">We'll contact you regarding customization details</p>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">₹{Math.round(item.subtotal).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Price Summary */}
          <div className="mt-6 pt-6 border-t border-gray-300 space-y-2">
            <div className="flex justify-between text-gray-800">
              <span>Subtotal</span>
              <span className="font-semibold">₹{Math.round(order.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-800">
              <span>Shipping</span>
              <span className="font-semibold text-emerald-600">{order.shipping_fee > 0 ? `₹${Math.round(order.shipping_fee).toLocaleString()}` : 'FREE'}</span>
            </div>
            <div className="flex justify-between text-gray-800">
              <span>Tax</span>
              <span className="font-semibold">₹{Math.round(order.tax).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-green-900 pt-3 border-t border-gray-300">
              <span>Total</span>
              <span>₹{Math.round(order.total_amount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Order Notes */}
        {order.order_notes && (
          <div className="glass rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-green-900 mb-3">Order Notes</h2>
            <p className="text-gray-700">{order.order_notes}</p>
          </div>
        )}

        {/* Next Steps */}
        <div className="glass rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-green-900 mb-4">What's Next?</h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-600 font-bold">1</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Order Confirmation</p>
                <p className="text-sm text-gray-600">We'll give you updates regarding your order via WhatsApp</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-600 font-bold">2</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Processing</p>
                <p className="text-sm text-gray-600">We'll start preparing your order for shipment</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-600 font-bold">3</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Shipping</p>
                <p className="text-sm text-gray-600">Your order will be shipped to the provided address</p>
              </div>
            </div>
            {order.items.some(item => item.customization) && (
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 font-bold">⚙️</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Customization</p>
                  <p className="text-sm text-gray-600">Our team will contact you at {order.user_phone} to discuss your customized items</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/"
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl text-center text-lg"
          >
            🛍️ Continue Shopping
          </Link>
          <Link
            href="/account"
            className="px-8 py-4 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold rounded-lg transition-all text-center text-lg"
          >
            📦 View My Orders
          </Link>
        </div>

        {/* Support Information */}
        <div className="mt-8 text-center p-6 bg-white rounded-xl border border-emerald-200 shadow-sm">
          <p className="text-gray-700 font-semibold mb-2">Need help with your order?</p>
          <p className="text-sm text-gray-600 mb-3">Contact us at <a href="mailto:3Layered.in@gmail.com" className="text-emerald-600 hover:underline font-semibold">3Layered.in@gmail.com</a></p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Keep your order number <span className="font-bold text-emerald-600">{order.order_number}</span> for reference</span>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

