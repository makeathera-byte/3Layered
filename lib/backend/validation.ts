/**
 * Backend Validation Utilities
 * Comprehensive input validation for API routes
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate phone number (supports Indian and international formats)
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  const indianRegex = /^(\+?91)?[6-9]\d{9}$/;
  const internationalRegex = /^\+?\d{10,15}$/;
  return indianRegex.test(cleaned) || internationalRegex.test(cleaned);
}

/**
 * Validate pincode (6 digits)
 */
export function validatePincode(pincode: string): boolean {
  if (!pincode || typeof pincode !== 'string') return false;
  return /^[0-9]{6}$/.test(pincode.trim());
}

/**
 * Validate order data
 */
export function validateOrderData(data: any): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!data.user_email || !validateEmail(data.user_email)) {
    errors.push('Valid user email is required');
  }

  if (!data.shipping_address) {
    errors.push('Shipping address is required');
  } else {
    const addr = data.shipping_address;
    if (!addr.flat_number?.trim()) errors.push('Flat/Street number is required');
    if (!addr.colony?.trim()) errors.push('Colony/Area is required');
    if (!addr.city?.trim()) errors.push('City is required');
    if (!addr.state?.trim()) errors.push('State is required');
    if (!addr.pincode || !validatePincode(addr.pincode)) {
      errors.push('Valid 6-digit pincode is required');
    }
  }

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push('Order must contain at least one item');
  } else {
    // Validate each item
    data.items.forEach((item: any, index: number) => {
      if (!item.product_name?.trim()) {
        errors.push(`Item ${index + 1}: Product name is required`);
      }
      if (!item.price || typeof item.price !== 'number' || item.price < 0) {
        errors.push(`Item ${index + 1}: Valid price is required`);
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
        errors.push(`Item ${index + 1}: Valid quantity is required`);
      }
    });
  }

  if (!data.total_amount || typeof data.total_amount !== 'number' || data.total_amount <= 0) {
    errors.push('Valid total amount is required');
  }

  if (data.user_phone && !validatePhone(data.user_phone)) {
    errors.push('Valid phone number is required');
  }

  // Validate payment method
  if (data.payment_method && !['COD', 'Online', 'UPI', 'Card', 'razorpay'].includes(data.payment_method)) {
    errors.push('Invalid payment method');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

/**
 * Validate UUID
 */
export function validateUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate numeric value
 */
export function validateNumeric(value: any, min?: number, max?: number): boolean {
  if (typeof value !== 'number' || isNaN(value)) return false;
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

