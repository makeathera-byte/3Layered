// Client-side Razorpay utilities

/**
 * Get Razorpay Key ID for client-side use
 * This is safe to expose as it's a public key
 */
export function getRazorpayKeyId(): string {
  if (typeof window === 'undefined') {
    throw new Error('getRazorpayKeyId can only be called on the client side');
  }

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  
  if (!keyId) {
    throw new Error('Razorpay public key is not configured. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID environment variable.');
  }

  return keyId;
}

/**
 * Check if Razorpay is loaded and available
 */
export function isRazorpayLoaded(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return !!(window as any).Razorpay;
}

