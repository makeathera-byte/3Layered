/**
 * API Security Utilities
 * Security helpers for API routes
 */

import { NextRequest } from 'next/server';
import { rateLimit, getClientIP } from '@/lib/backend/security';
import { logger } from '@/lib/backend/logger';
import { sanitizeString, sanitizeEmail, sanitizeObject } from './input-sanitizer';

/**
 * Validate API request
 */
export function validateAPIRequest(
  request: NextRequest,
  options: {
    requireAuth?: boolean;
    rateLimit?: { maxRequests: number; windowMs: number };
    methods?: string[];
  } = {}
): { valid: boolean; error?: string; status?: number } {
  // Check HTTP method
  if (options.methods && !options.methods.includes(request.method)) {
    return {
      valid: false,
      error: `Method ${request.method} not allowed`,
      status: 405,
    };
  }

  // Rate limiting
  if (options.rateLimit) {
    const clientIP = getClientIP(request);
    const identifier = `api:${request.method}:${clientIP}`;
    
    if (!rateLimit(identifier, options.rateLimit.maxRequests, options.rateLimit.windowMs)) {
      logger.warn('API rate limit exceeded', { 
        ip: clientIP, 
        method: request.method,
        path: request.nextUrl.pathname 
      });
      return {
        valid: false,
        error: 'Too many requests. Please try again later.',
        status: 429,
      };
    }
  }

  return { valid: true };
}

/**
 * Sanitize request body
 */
export function sanitizeRequestBody(body: any): any {
  return sanitizeObject(body);
}

/**
 * Validate and sanitize email from request
 */
export function getSanitizedEmail(request: NextRequest, body: any): string | null {
  const email = body?.email || body?.user_email;
  if (!email) return null;
  return sanitizeEmail(email);
}

/**
 * Check if request is from trusted origin
 */
export function isTrustedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  if (!origin && !referer) {
    // Same-origin request
    return true;
  }
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'localhost';
  const trustedOrigins = [
    siteUrl,
    'http://localhost:3000',
    'https://localhost:3000',
  ];
  
  if (origin) {
    return trustedOrigins.some(trusted => origin.includes(trusted));
  }
  
  if (referer) {
    return trustedOrigins.some(trusted => referer.includes(trusted));
  }
  
  return false;
}

/**
 * Log security event
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  severity: 'low' | 'medium' | 'high' = 'medium'
): void {
  const clientIP = details.ip || 'unknown';
  
  if (severity === 'high') {
    logger.error(`[SECURITY] ${event}`, details);
  } else if (severity === 'medium') {
    logger.warn(`[SECURITY] ${event}`, details);
  } else {
    logger.info(`[SECURITY] ${event}`, details);
  }
}

