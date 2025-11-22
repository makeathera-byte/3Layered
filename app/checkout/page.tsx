"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import { sanitizeString, sanitizeEmail, sanitizePhone } from "@/lib/security/input-sanitizer";

interface ShippingAddress {
  flatNumber: string;
  colony: string;
  city: string;
  state: string;
  pincode: string;
}

interface UserInfo {
  fullName: string;
  email: string;
  phone: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotalPrice, clearCart, hasCustomizedItems, getCustomizationFee, getOriginalTotalPrice, getTotalSavings } = useCart();
  const { user, loading: authLoading } = useAuth();
  
  const [dataLoading, setDataLoading] = useState(true); // Start with true
  const [submitting, setSubmitting] = useState(false);
  
  // User information
  const [userInfo, setUserInfo] = useState<UserInfo>({
    fullName: "",
    email: "",
    phone: "",
  });
  
  // Shipping address
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    flatNumber: "",
    colony: "",
    city: "",
    state: "",
    pincode: "",
  });
  
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Load user data when auth is ready
  useEffect(() => {
    console.log('[Checkout] useEffect triggered - authLoading:', authLoading, 'user:', user?.id);
    
    // Skip if auth is still loading
    if (authLoading) {
      console.log('[Checkout] Waiting for auth to complete...');
      return;
    }
    
    console.log('[Checkout] Auth complete, loading user data...');
    
    const loadUserData = async () => {
      try {
        if (user) {
          // Immediately set basic info from user object (instant display)
          console.log('[Checkout] Setting initial user info from auth object');
          setUserInfo({
            fullName: user.user_metadata?.full_name || "",
            email: user.email || "",
            phone: user.user_metadata?.mobile || "",
          });
          
          // Also set address from metadata if available
          if (user.user_metadata?.address) {
            const addr = user.user_metadata.address;
            setShippingAddress({
              flatNumber: addr.flat_number || "",
              colony: addr.colony || "",
              city: addr.city || "",
              state: addr.state || "",
              pincode: addr.pincode || "",
            });
          }
          
          console.log('[Checkout] Fetching user profile for:', user.id);
          // Then fetch from database for most up-to-date info
          const { data: profile, error } = await supabase
            .from('users')
            .select('full_name, email, mobile, address')
            .eq('id', user.id)
            .single();
          
          if (!error && profile) {
            console.log('[Checkout] Profile loaded successfully, updating with database data');
            // Update with database data (this will overwrite the initial data)
            setUserInfo({
              fullName: (profile as any)?.full_name || user.user_metadata?.full_name || "",
              email: (profile as any)?.email || user.email || "",
              phone: (profile as any)?.mobile || user.user_metadata?.mobile || "",
            });
            
            // Load address if exists in database
            if ((profile as any)?.address) {
              const addr = (profile as any).address;
              setShippingAddress({
                flatNumber: addr.flat_number || "",
                colony: addr.colony || "",
                city: addr.city || "",
                state: addr.state || "",
                pincode: addr.pincode || "",
              });
            }
          } else {
            console.log('[Checkout] Profile fetch failed, keeping metadata');
            // Keep the initial data from metadata (already set above)
          }
        } else {
          console.log('[Checkout] No user found');
        }
      } catch (error) {
        console.error('[Checkout] Error loading user data:', error);
        // On error, try to set from user metadata as fallback
        if (user) {
          setUserInfo({
            fullName: user.user_metadata?.full_name || "",
            email: user.email || "",
            phone: user.user_metadata?.mobile || "",
          });
        }
      } finally {
        // Always set dataLoading to false when done
        console.log('[Checkout] Setting dataLoading to false');
        setDataLoading(false);
      }
    };
    
    loadUserData();
  }, [user?.id, authLoading]); // Depend on user.id and authLoading
  
  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (dataLoading) {
        console.warn('[Checkout] Loading timeout reached, forcing dataLoading to false');
        setDataLoading(false);
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timeout);
  }, [dataLoading]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!authLoading && !dataLoading && cart.length === 0) {
      router.push("/cart");
    }
  }, [cart, authLoading, dataLoading, router]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    // Validate user info
    if (!userInfo.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!userInfo.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!userInfo.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      // Remove all non-digit characters except the leading +
      const cleanPhone = userInfo.phone.replace(/[\s\-\(\)]/g, '');
      
      // Check if valid phone format:
      // - 10 digits: 9876543210
      // - With country code: +919876543210 or 919876543210
      // - International format with +: +[country code][10 digits]
      const isValid = /^(\+?[1-9]\d{0,3})?[6-9]\d{9}$/.test(cleanPhone) || 
                      /^\+?\d{10,15}$/.test(cleanPhone);
      
      if (!isValid) {
        newErrors.phone = "Invalid phone number (10 digits or with country code)";
      }
    }
    
    // Validate shipping address
    if (!shippingAddress.flatNumber.trim()) {
      newErrors.flatNumber = "Flat/Street number is required";
    }
    if (!shippingAddress.colony.trim()) {
      newErrors.colony = "Colony/Area is required";
    }
    if (!shippingAddress.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!shippingAddress.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!shippingAddress.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^[0-9]{6}$/.test(shippingAddress.pincode)) {
      newErrors.pincode = "Invalid pincode (6 digits required)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert("Please fill in all required fields correctly");
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Calculate fees
      const customizationFee = getCustomizationFee(); // ₹300 if customized items exist
      const codFee = paymentMethod === "COD" ? 25 : 0; // ₹25 for COD
      const subtotal = getTotalPrice();
      const totalAmount = subtotal + customizationFee + codFee;
      
      // Sanitize all inputs before sending
      const sanitizedEmail = sanitizeEmail(userInfo.email);
      const sanitizedName = sanitizeString(userInfo.fullName, 100);
      const sanitizedPhone = sanitizePhone(userInfo.phone);
      
      // Prepare order data with sanitized inputs
      const orderData = {
        user_id: user?.id || null,
        user_email: sanitizedEmail,
        user_name: sanitizedName,
        user_phone: sanitizedPhone,
        shipping_address: {
          flat_number: sanitizeString(shippingAddress.flatNumber, 50),
          colony: sanitizeString(shippingAddress.colony, 100),
          city: sanitizeString(shippingAddress.city, 50),
          state: sanitizeString(shippingAddress.state, 50),
          pincode: shippingAddress.pincode.trim().slice(0, 6),
        },
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          product_image: item.image,
          price: item.price,
          quantity: item.quantity,
          customization: item.customization || null,
          drive_link: item.driveLink || null,
          subtotal: item.price * item.quantity,
        })),
        subtotal: subtotal,
        tax: 0,
        shipping_fee: 0,
        customization_fee: customizationFee,
        cod_fee: codFee,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        payment_status: paymentMethod === "COD" ? "pending" : "pending",
        order_notes: orderNotes || null,
      };
      
      // Create order via API
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('[Checkout] Order creation failed:', result);
        const errorMessage = result.error || 'Failed to create order';
        const errorDetails = result.details ? `\nDetails: ${result.details}` : '';
        const errorHint = result.hint ? `\nHint: ${result.hint}` : '';
        throw new Error(`${errorMessage}${errorDetails}${errorHint}`);
      }
      
      // Verify order_number exists
      if (!result.order_number) {
        console.error('[Checkout] Order created but order_number missing:', result);
        throw new Error('Order created but order number not received. Please contact support.');
      }
      
      console.log('[Checkout] Order placed successfully!', {
        order_id: result.order_id,
        order_number: result.order_number
      });
      
      // Show success alert
      alert(`✅ Order Placed Successfully!\n\nOrder Number: ${result.order_number}\n\nYou will be redirected to the confirmation page...`);
      
      // Clear cart
      clearCart();
      
      // Store order number in sessionStorage as backup
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('lastOrderNumber', result.order_number);
        sessionStorage.setItem('orderPlaced', 'true');
      }
      
      // Redirect to confirmation page with order number
      const confirmationUrl = `/order-confirmation?order=${encodeURIComponent(result.order_number)}`;
      console.log('[Checkout] Redirecting to:', confirmationUrl);
      
      // Use window.location.href for full page reload to ensure confirmation page loads
      // Small delay to ensure alert is seen and sessionStorage is set
      setTimeout(() => {
        window.location.href = confirmationUrl;
      }, 100);
      
    } catch (error: any) {
      console.error('Error placing order:', error);
      alert(`Failed to place order: ${error.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state while auth or data is loading
  const isLoading = authLoading || dataLoading;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg text-green-900">Loading checkout...</span>
        </div>
        <p className="text-sm text-gray-600">
          {authLoading ? 'Verifying authentication...' : 'Loading your information...'}
        </p>
      </div>
    );
  }

  if (cart.length === 0) {
    return null; // Will redirect
  }

  const subtotal = getTotalPrice();
  const customizationFee = getCustomizationFee();
  const codFee = paymentMethod === "COD" ? 25 : 0;
  const total = subtotal + customizationFee + codFee;

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-2 mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Cart
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-green-900 mb-2">Checkout</h1>
          <p className="text-gray-700">Complete your order details</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div className="glass rounded-xl p-6">
                <h2 className="text-xl font-bold text-green-900 mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={userInfo.fullName}
                      onChange={(e) => setUserInfo({...userInfo, fullName: e.target.value})}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={userInfo.phone}
                      onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      placeholder="Phone number (e.g., +919876543210 or 9876543210)"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="glass rounded-xl p-6">
                <h2 className="text-xl font-bold text-green-900 mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Flat/House/Street Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.flatNumber}
                      onChange={(e) => setShippingAddress({...shippingAddress, flatNumber: e.target.value})}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.flatNumber ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      placeholder="House No., Building Name"
                    />
                    {errors.flatNumber && <p className="text-red-500 text-sm mt-1">{errors.flatNumber}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Colony/Area <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.colony}
                      onChange={(e) => setShippingAddress({...shippingAddress, colony: e.target.value})}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.colony ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      placeholder="Area, Colony, Street Name"
                    />
                    {errors.colony && <p className="text-red-500 text-sm mt-1">{errors.colony}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.city ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                        placeholder="City"
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.state ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                        placeholder="State"
                      />
                      {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.pincode}
                      onChange={(e) => setShippingAddress({...shippingAddress, pincode: e.target.value})}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.pincode ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      placeholder="6-digit pincode"
                      maxLength={6}
                    />
                    {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="glass rounded-xl p-6">
                <h2 className="text-xl font-bold text-green-900 mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-emerald-500 bg-emerald-50 rounded-lg cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-emerald-600"
                    />
                    <div className="ml-3">
                      <p className="font-semibold text-green-900">Cash on Delivery</p>
                      <p className="text-sm text-gray-700">Pay when you receive your order</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-not-allowed opacity-50">
                    <input
                      type="radio"
                      name="payment"
                      value="Online"
                      disabled
                      className="w-5 h-5"
                    />
                    <div className="ml-3">
                      <p className="font-semibold text-gray-700">Online Payment</p>
                      <p className="text-sm text-gray-600">Coming soon</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div className="glass rounded-xl p-6">
                <h2 className="text-xl font-bold text-green-900 mb-4">Order Notes (Optional)</h2>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={4}
                  placeholder="Any special instructions or notes for your order..."
                />
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="glass rounded-xl p-6 sticky top-4">
                <h2 className="text-xl font-bold text-green-900 mb-4">Order Summary</h2>
                
                {/* Cart Items */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-200 last:border-0">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.image || "/api/placeholder"}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-green-900 truncate">{item.name}</h3>
                        <p className="text-sm text-gray-700">Qty: {item.quantity}</p>
                        {item.discountPercentage && item.originalPrice ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-bold text-emerald-600">₹{Math.round(item.price * item.quantity).toLocaleString()}</p>
                              <span className="px-1.5 py-0.5 bg-emerald-500 text-white rounded-full text-xs font-bold">
                                {item.discountPercentage}% OFF
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 line-through">₹{Math.round(item.originalPrice * item.quantity).toLocaleString()}</p>
                          </div>
                        ) : (
                          <p className="text-sm font-bold text-emerald-600">₹{Math.round(item.price * item.quantity).toLocaleString()}</p>
                        )}
                        {item.customization && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                            Customized
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 py-4 border-t border-gray-200">
                  {(() => {
                    const totalSavings = getTotalSavings();
                    const originalTotalPrice = getOriginalTotalPrice();
                    
                    return (
                      <>
                        <div className="flex justify-between text-gray-800">
                          <span>Subtotal</span>
                          <span className="font-semibold">₹{Math.round(subtotal).toLocaleString()}</span>
                        </div>
                        
                        {totalSavings > 0 && (
                          <>
                            <div className="flex justify-between text-gray-600 text-sm">
                              <span>Original Price</span>
                              <span className="line-through">₹{Math.round(originalTotalPrice).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-3 rounded-lg border-2 border-emerald-200 -mx-1">
                              <span className="text-emerald-700 font-bold flex items-center gap-2">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                You Saved
                              </span>
                              <span className="text-emerald-700 font-bold text-xl">
                                ₹{Math.round(totalSavings).toLocaleString()}
                              </span>
                            </div>
                          </>
                        )}
                        
                        {customizationFee > 0 && (
                          <div className="flex justify-between text-gray-800 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200 -mx-1">
                            <span className="flex items-center gap-2">
                              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Customization Fee
                            </span>
                            <span className="font-semibold">₹{customizationFee.toLocaleString()}</span>
                          </div>
                        )}
                        
                        {codFee > 0 && (
                          <div className="flex justify-between text-gray-800 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 -mx-1">
                            <span className="flex items-center gap-2">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              COD Charges
                            </span>
                            <span className="font-semibold">₹{codFee.toLocaleString()}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-gray-800">
                          <span>Shipping</span>
                          <span className="font-semibold text-emerald-600">FREE</span>
                        </div>
                        
                        <div className="flex justify-between text-gray-800">
                          <span>Tax</span>
                          <span className="font-semibold">₹0</span>
                        </div>
                        
                        <div className="flex justify-between text-xl font-bold text-green-900 pt-3 border-t border-gray-300">
                          <span>Total</span>
                          <span>₹{Math.round(total).toLocaleString()}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed mt-6"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    `Place Order - ₹${Math.round(total).toLocaleString()}`
                  )}
                </button>

                <p className="text-xs text-gray-600 text-center mt-4">
                  By placing your order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      <Footer />
    </div>
  );
}

