// Razorpay configuration
import Razorpay from 'razorpay';

// Initialize Razorpay instance (server-side only)
export function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

// Get Razorpay key ID for client-side (public key)
export function getRazorpayKeyId(): string {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  
  if (!keyId) {
    throw new Error('Razorpay public key is missing. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID environment variable.');
  }

  return keyId;
}

// Validate Razorpay configuration
export function validateRazorpayConfig(): boolean {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const publicKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    return !!(keyId && keySecret && publicKeyId);
  } catch {
    return false;
  }
}

