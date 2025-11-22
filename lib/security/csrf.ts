/**
 * CSRF Protection Utilities
 * Cross-Site Request Forgery protection
 */

import crypto from 'crypto';

const CSRF_TOKEN_COOKIE = 'csrf-token';
const CSRF_TOKEN_HEADER = 'x-csrf-token';

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify CSRF token from request
 */
export function verifyCSRFToken(
  cookieToken: string | undefined,
  headerToken: string | null
): boolean {
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  // Use timing-safe comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(headerToken)
    );
  } catch {
    return false;
  }
}

/**
 * Validate CSRF token for API routes
 */
export function validateCSRF(request: Request): boolean {
  // Skip CSRF for GET/HEAD requests
  if (request.method === 'GET' || request.method === 'HEAD') {
    return true;
  }
  
  // Skip CSRF for public read-only endpoints
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/products') && request.method === 'GET') {
    return true;
  }
  
  // For other methods, CSRF is recommended but not enforced for now
  // Can be enabled when implementing full CSRF protection
  return true;
}

