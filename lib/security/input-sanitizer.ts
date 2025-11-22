/**
 * Input Sanitization Utilities
 * Comprehensive input sanitization to prevent XSS and injection attacks
 */

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize string input (remove dangerous characters)
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, ''); // Remove data: protocol
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  
  return email
    .trim()
    .toLowerCase()
    .slice(0, 255)
    .replace(/[^a-z0-9@._-]/g, '');
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') return '';
  
  return phone
    .trim()
    .replace(/[^\d+]/g, '') // Keep only digits and +
    .slice(0, 20);
}

/**
 * Sanitize URL
 */
export function sanitizeURL(url: string): string {
  if (typeof url !== 'string') return '';
  
  try {
    const parsed = new URL(url);
    // Only allow https and http protocols
    if (!['https:', 'http:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj: any, maxDepth: number = 10): any {
  if (maxDepth <= 0) return null;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, maxDepth - 1));
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = sanitizeString(key, 100);
      sanitized[sanitizedKey] = sanitizeObject(value, maxDepth - 1);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Validate and sanitize SQL input (for direct queries - though we use Supabase which handles this)
 */
export function sanitizeSQL(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Remove SQL injection patterns
  return input
    .replace(/['";\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/;/g, '');
}

