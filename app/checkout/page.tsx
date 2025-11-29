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
import { getRazorpayKeyId } from "@/lib/razorpay/client";

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
  
  const [mounted, setMounted] = useState(false);
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
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Set mounted state on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load user data when auth is ready
  useEffect(() => {
    if (!mounted) return; // Wait for component to mount
    
    console.log('[Checkout] useEffect triggered - authLoading:', authLoading, 'user:', user?.id);
    
    // Skip if auth is still loading
    if (authLoading) {
      console.log('[Checkout] Waiting for auth to complete...');
      return;
    }
    
    // If no user (guest checkout), immediately set dataLoading to false
    if (!user) {
      console.log('[Checkout] No user - guest checkout, setting dataLoading to false');
      setDataLoading(false);
      return;
    }
    
    console.log('[Checkout] Auth complete, loading user data...');
    
    const loadUserData = async () => {
      try {
        // At this point, user is guaranteed to exist (we return early if no user)
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
        // Always set dataLoading to false when done (for both logged in and guest users)
        console.log('[Checkout] Setting dataLoading to false');
        setDataLoading(false);
      }
    };
    
    loadUserData();
  }, [mounted, user?.id, authLoading]); // Depend on mounted, user.id and authLoading
  
  // Fallback timeout to prevent infinite loading (reduced to 1.5 seconds)
  useEffect(() => {
    if (!mounted) return;
    
    const timeout = setTimeout(() => {
      if (dataLoading) {
        console.warn('[Checkout] Loading timeout reached, forcing dataLoading to false');
        setDataLoading(false);
      }
    }, 1500); // 1.5 second timeout
    
    return () => clearTimeout(timeout);
  }, [mounted, dataLoading]);

  // Additional safety: Force show page after 2 seconds regardless of loading state
  useEffect(() => {
    if (!mounted) return;
    
    const safetyTimeout = setTimeout(() => {
      console.warn('[Checkout] Safety timeout - forcing page to show');
      setDataLoading(false);
    }, 2000);
    
    return () => clearTimeout(safetyTimeout);
  }, [mounted]);

  // Auto-refresh if stuck in loading state for too long
  useEffect(() => {
    if (!mounted) return;
    
    // First, try to force states to false after 3 seconds
    const forceStateTimeout = setTimeout(() => {
      if (authLoading || dataLoading) {
        console.warn('[Checkout] Force clearing loading states after timeout');
        if (authLoading) {
          // Auth should have completed by now, force it
          console.warn('[Checkout] Forcing authLoading to false');
        }
        if (dataLoading) {
          setDataLoading(false);
        }
      }
    }, 3000); // 3 seconds
    
    // Then auto-refresh if still stuck after 5 seconds
    const autoRefreshTimeout = setTimeout(() => {
      const isLoading = authLoading || dataLoading;
      if (isLoading) {
        console.warn('[Checkout] Auto-refreshing page due to stuck loading state');
        window.location.reload();
      }
    }, 5000); // 5 second timeout before auto-refresh
    
    return () => {
      clearTimeout(forceStateTimeout);
      clearTimeout(autoRefreshTimeout);
    };
  }, [mounted, authLoading, dataLoading]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!authLoading && !dataLoading && cart.length === 0) {
      router.push("/cart");
    }
  }, [cart, authLoading, dataLoading, router]);

  // Load Razorpay script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if Razorpay is already loaded
    if ((window as any).Razorpay) {
      setRazorpayLoaded(true);
      console.log('[Checkout] Razorpay already loaded');
      return;
    }

    // Check if script is already being loaded or exists
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      // Script exists, wait for it to load
      const checkRazorpay = setInterval(() => {
        if ((window as any).Razorpay) {
          setRazorpayLoaded(true);
          console.log('[Checkout] Razorpay script loaded (existing)');
          clearInterval(checkRazorpay);
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkRazorpay);
        if (!(window as any).Razorpay) {
          console.error('[Checkout] Razorpay script timeout');
        }
      }, 10000);

      return () => clearInterval(checkRazorpay);
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      // Double check Razorpay is available
      if ((window as any).Razorpay) {
        setRazorpayLoaded(true);
        console.log('[Checkout] Razorpay script loaded successfully');
      } else {
        console.error('[Checkout] Razorpay script loaded but Razorpay object not found');
      }
    };
    
    script.onerror = (error) => {
      console.error('[Checkout] Failed to load Razorpay script', error);
      console.error('[Checkout] Script URL: https://checkout.razorpay.com/v1/checkout.js');
      console.error('[Checkout] Please check:');
      console.error('  1. Internet connection');
      console.error('  2. Firewall/network restrictions');
      console.error('  3. Ad blockers (may block payment scripts)');
    };

    // Add script to document
    document.body.appendChild(script);

    // Fallback check after 5 seconds
    const fallbackCheck = setTimeout(() => {
      if ((window as any).Razorpay && !razorpayLoaded) {
        setRazorpayLoaded(true);
        console.log('[Checkout] Razorpay detected via fallback check');
      }
    }, 5000);

    return () => {
      clearTimeout(fallbackCheck);
      // Don't remove script on unmount as it might be needed by other components
    };
  }, [razorpayLoaded]);

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

  // Handle Razorpay payment
  const handleRazorpayPayment = async (orderId: string | null, orderNumber: string | null, totalAmount: number, orderData?: any) => {
    if (!razorpayLoaded || typeof window === 'undefined' || !(window as any).Razorpay) {
      alert('Payment gateway is not loaded. Please refresh the page and try again.');
      return;
    }

    setProcessingPayment(true);

    try {
      // Generate a temporary receipt ID for Razorpay (order will be created after payment)
      const tempReceipt = `temp_${Date.now()}`;
      
      // Store order data in a way we can access it later (we'll pass it in verify-payment)
      // Create Razorpay order (without creating database order yet)
      const razorpayResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'INR',
          receipt: tempReceipt,
          notes: {
            user_email: userInfo.email,
            user_name: userInfo.fullName,
            // Note: We'll pass full order_data in verify-payment request
          },
        }),
      });

      const razorpayData = await razorpayResponse.json();

      if (!razorpayResponse.ok || !razorpayData.order) {
        throw new Error(razorpayData.error || 'Failed to initialize payment');
      }

      // Get Razorpay key ID (public key)
      const razorpayKeyId = getRazorpayKeyId();

      // Initialize Razorpay checkout
      const options = {
        key: razorpayKeyId,
        amount: razorpayData.order.amount,
        currency: razorpayData.order.currency,
        name: '3Layered',
        description: `Order Payment`,
        order_id: razorpayData.order.id,
        handler: async function (response: any) {
          try {
            // Verify payment and create order (order is created only after successful payment)
            // Pass order_data to create the order after payment verification
            const verifyResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_data: orderData, // Send order data to create order after payment verification
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              // Extract detailed error message
              const errorMessage = verifyData.error || verifyData.message || 'Payment verification failed';
              const errorDetails = verifyData.details ? `\nDetails: ${JSON.stringify(verifyData.details)}` : '';
              const errorCode = verifyData.code ? `\nCode: ${verifyData.code}` : '';
              
              console.error('[Checkout] Payment verification failed:', {
                status: verifyResponse.status,
                error: errorMessage,
                details: verifyData.details,
                code: verifyData.code,
                fullResponse: verifyData
              });
              
              throw new Error(`${errorMessage}${errorDetails}${errorCode}`);
            }
            
            if (!verifyData.verified) {
              throw new Error(verifyData.error || 'Payment verification failed - signature invalid');
            }

            // Payment successful and order created
            console.log('[Checkout] Payment verified and order created successfully', verifyData);

            // Clear cart
            clearCart();

            // Store order number in sessionStorage
            if (typeof window !== 'undefined' && verifyData.order_number) {
              sessionStorage.setItem('lastOrderNumber', verifyData.order_number);
              sessionStorage.setItem('orderPlaced', 'true');
            }

            // Redirect to confirmation page
            const confirmationUrl = `/order-confirmation?order=${encodeURIComponent(verifyData.order_number || '')}`;
            window.location.href = confirmationUrl;

          } catch (error: any) {
            console.error('[Checkout] Payment verification error:', error);
            
            // No order was created, so no need to update payment status
            // Just show error to user
            alert(`Payment verification failed: ${error.message || 'Unknown error'}\n\nNo order was created. Please try again.`);
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: userInfo.fullName,
          email: userInfo.email,
          contact: userInfo.phone.replace(/\D/g, '').slice(-10), // Last 10 digits
        },
        theme: {
          color: '#10b981', // Emerald color matching the site theme
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(false);
            console.log('[Checkout] Payment modal closed by user');
            // Don't show alert for modal dismissal - user may retry
          },
        },
        // Add retry configuration
        retry: {
          enabled: true,
          max_count: 3,
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      
      // Add comprehensive error handlers
      razorpay.on('payment.failed', async function (response: any) {
        console.error('[Checkout] Razorpay payment failed:', response);
        console.error('[Checkout] Payment failure details:', {
          response: JSON.stringify(response, null, 2),
          error: response?.error,
          errorCode: response?.error?.code,
          errorDescription: response?.error?.description,
          errorSource: response?.error?.source,
          errorStep: response?.error?.step,
          errorReason: response?.error?.reason,
          metadata: response?.metadata
        });
        
        // No order was created, so no need to update payment status
        // Payment failed before order creation
        
        // Extract error message
        let errorMessage = 'Payment failed';
        if (response?.error?.description) {
          errorMessage = response.error.description;
        } else if (response?.error?.reason) {
          errorMessage = `Payment failed: ${response.error.reason}`;
        } else if (response?.error?.code) {
          errorMessage = `Payment failed (Error Code: ${response.error.code})`;
        } else if (Object.keys(response || {}).length === 0) {
          errorMessage = 'Payment was cancelled or failed. Please try again.';
        } else {
          errorMessage = 'Payment failed. Please check your payment details and try again.';
        }
        
        alert(errorMessage);
        setProcessingPayment(false);
      });

      // Handle payment cancellation
      razorpay.on('payment.cancelled', function (response: any) {
        console.log('[Checkout] Payment cancelled by user:', response);
        setProcessingPayment(false);
        // Don't show alert for user cancellation
      });

      // Handle other errors
      razorpay.on('error', function (error: any) {
        console.error('[Checkout] Razorpay error:', error);
        console.error('[Checkout] Error details:', {
          error: JSON.stringify(error, null, 2),
          message: error?.message,
          code: error?.code,
          description: error?.description
        });
        
        let errorMessage = 'An error occurred during payment';
        if (error?.description) {
          errorMessage = error.description;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        alert(errorMessage);
        setProcessingPayment(false);
      });

      // Open Razorpay modal
      try {
        razorpay.open();
        console.log('[Checkout] Razorpay modal opened');
      } catch (openError: any) {
        console.error('[Checkout] Failed to open Razorpay modal:', openError);
        // Check if it's a CSP/blocking error
        if (openError.message && openError.message.includes('blocked')) {
          alert('Payment modal is blocked. Please check browser console for details and ensure ad blockers are disabled.');
        } else {
          alert(`Failed to open payment modal: ${openError.message || 'Unknown error'}`);
        }
        setProcessingPayment(false);
      }

    } catch (error: any) {
      console.error('[Checkout] Razorpay payment error:', error);
      console.error('[Checkout] Error details:', {
        message: error.message,
        stack: error.stack,
        razorpayLoaded,
        razorpayAvailable: typeof window !== 'undefined' && !!(window as any).Razorpay
      });
      
      // More specific error messages
      let errorMessage = 'Payment initialization failed';
      if (error.message) {
        errorMessage = error.message;
      } else if (!razorpayLoaded) {
        errorMessage = 'Payment gateway not loaded. Please refresh the page.';
      } else if (typeof window === 'undefined' || !(window as any).Razorpay) {
        errorMessage = 'Razorpay is not available. Please check your browser console.';
      }
      
      alert(`${errorMessage}\n\nPlease check browser console (F12) for more details.`);
      setProcessingPayment(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert("Please fill in all required fields correctly");
      return;
    }

    // For online payment, check if Razorpay is loaded
    if (paymentMethod === "Online" && !razorpayLoaded) {
      alert("Payment gateway is loading. Please wait a moment and try again.");
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
        payment_method: paymentMethod === "Online" ? "razorpay" : paymentMethod,
        payment_status: paymentMethod === "COD" ? "pending" : "pending",
        order_notes: orderNotes || null,
      };
      
      // For online payment, DON'T create order yet - create it only after payment verification
      if (paymentMethod === "Online") {
        setSubmitting(false); // Reset submitting state as we're moving to payment
        // Store order data temporarily for use after payment verification
        const tempOrderData = orderData;
        // Initiate Razorpay payment without creating order first
        await handleRazorpayPayment(null, null, totalAmount, tempOrderData);
        return; // Don't proceed with COD flow
      }
      
      // For COD, create order immediately
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
      
      // For COD, show success alert
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

  // Show loading state only if not mounted or if auth/data is still loading
  // For guest users, only wait for auth to complete, not data loading
  const isLoading = !mounted || authLoading || (dataLoading && user);
  
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
          {!mounted ? 'Initializing...' : authLoading ? 'Verifying authentication...' : 'Loading your information...'}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          If this takes too long, the page will automatically refresh...
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
        >
          🔄 Refresh Now
        </button>
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
                  <label className="flex items-center p-4 border-2 border-emerald-500 bg-emerald-50 rounded-lg cursor-pointer hover:bg-emerald-100 transition-colors">
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
                      <p className="text-sm text-gray-700">Pay when you receive your order (₹25 COD charges apply)</p>
                    </div>
                  </label>
                  
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === "Online" 
                      ? "border-emerald-500 bg-emerald-50" 
                      : "border-gray-300 hover:border-emerald-300"
                  } ${!razorpayLoaded ? "opacity-50 cursor-not-allowed" : ""}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="Online"
                      checked={paymentMethod === "Online"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      disabled={!razorpayLoaded}
                      className="w-5 h-5 text-emerald-600"
                    />
                    <div className="ml-3">
                      <p className="font-semibold text-green-900">Online Payment (Razorpay)</p>
                      <p className="text-sm text-gray-700">
                        {razorpayLoaded 
                          ? "Pay securely with UPI, Cards, Net Banking, or Wallets" 
                          : "Loading payment gateway..."}
                      </p>
                      {!razorpayLoaded && (
                        <p className="text-xs text-amber-600 mt-1">Please wait for payment gateway to load</p>
                      )}
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
                  disabled={submitting || processingPayment || (paymentMethod === "Online" && !razorpayLoaded)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed mt-6"
                >
                  {submitting || processingPayment ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {processingPayment ? "Opening Payment Gateway..." : "Processing..."}
                    </span>
                  ) : (
                    paymentMethod === "Online" 
                      ? `Pay Online - ₹${Math.round(total).toLocaleString()}`
                      : `Place Order - ₹${Math.round(total).toLocaleString()}`
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

