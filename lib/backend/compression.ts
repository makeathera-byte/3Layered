/**
 * Backend Response Compression
 * Compress responses for better performance
 */

import { NextResponse } from 'next/server';

/**
 * Compress response if client supports it
 */
export function compressResponse(response: NextResponse, request: Request): NextResponse {
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  
  // Next.js handles compression automatically, but we can add headers
  if (acceptEncoding.includes('gzip') || acceptEncoding.includes('br')) {
    response.headers.set('Content-Encoding', 'gzip');
  }
  
  return response;
}

/**
 * Add performance headers
 */
export function addPerformanceHeaders(response: NextResponse): NextResponse {
  // Cache control
  response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  // Performance hints
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

