/**
 * Backend API Middleware
 * Reusable middleware functions for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIP, validateRequestSize } from './security';
import { logger } from './logger';
import { handleApiError } from './errors';

/**
 * API route wrapper with common middleware
 */
export function withMiddleware(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    rateLimit?: { maxRequests: number; windowMs: number };
    requireAuth?: boolean;
    maxBodySizeKB?: number;
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const clientIP = getClientIP(request);
    const method = request.method;
    const url = request.url;

    try {
      // Log request
      logger.info('API request', { method, url, ip: clientIP });

      // Rate limiting
      if (options.rateLimit) {
        const identifier = `api:${method}:${clientIP}`;
        if (!rateLimit(identifier, options.rateLimit.maxRequests, options.rateLimit.windowMs)) {
          logger.warn('Rate limit exceeded', { method, url, ip: clientIP });
          return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429 }
          );
        }
      }

      // Validate request size
      if (options.maxBodySizeKB) {
        try {
          const body = await request.clone().json();
          if (!validateRequestSize(body, options.maxBodySizeKB)) {
            return NextResponse.json(
              { error: 'Request payload too large' },
              { status: 413 }
            );
          }
        } catch {
          // Body might not be JSON, skip validation
        }
      }

      // Execute handler
      const response = await handler(request);

      // Log response
      const duration = Date.now() - startTime;
      logger.info('API response', {
        method,
        url,
        status: response.status,
        duration
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('API error', error, {
        method,
        url,
        ip: clientIP,
        duration
      });
      const errorResponse = handleApiError(error);
      // Convert Response to NextResponse if needed
      if (errorResponse instanceof NextResponse) {
        return errorResponse;
      }
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * CORS headers helper
 */
export function withCORS(response: NextResponse, allowedOrigins: string[] = ['*']): NextResponse {
  const origin = response.headers.get('origin') || '*';
  
  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  
  return response;
}

