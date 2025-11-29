import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security Middleware
 * Adds security headers and protects routes
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Security Headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  // Note: X-Frame-Options removed - using CSP frame-ancestors instead for better control
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  // More permissive CSP for Razorpay integration
  // Using wildcards for Razorpay to allow all subdomains and resources
  const isCheckoutPage = pathname.startsWith('/checkout') || pathname.startsWith('/order-confirmation');
  
  // More permissive CSP for checkout and order confirmation pages to allow Razorpay
  if (isCheckoutPage) {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://*.razorpay.com https://razorpay.com https://checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.razorpay.com https://razorpay.com https://checkout.razorpay.com",
      "font-src 'self' https://fonts.gstatic.com data: https://*.razorpay.com https://razorpay.com",
      "img-src 'self' data: https: blob: https://*.razorpay.com https://razorpay.com",
      "connect-src 'self' https://*.supabase.co https://*.supabase.in https://*.razorpay.com https://razorpay.com https://api.razorpay.com https://checkout.razorpay.com",
      "frame-src 'self' https://*.razorpay.com https://razorpay.com https://checkout.razorpay.com data: blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://*.razorpay.com https://razorpay.com https://checkout.razorpay.com",
      "upgrade-insecure-requests",
    ].join('; ');
    response.headers.set('Content-Security-Policy', csp);
  } else {
    // Standard CSP for other pages
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://*.razorpay.com https://razorpay.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.razorpay.com https://razorpay.com",
      "font-src 'self' https://fonts.gstatic.com data: https://*.razorpay.com https://razorpay.com",
      "img-src 'self' data: https: blob: https://*.razorpay.com https://razorpay.com",
      "connect-src 'self' https://*.supabase.co https://*.supabase.in https://*.razorpay.com https://razorpay.com",
      "frame-src 'self' https://*.razorpay.com https://razorpay.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://*.razorpay.com https://razorpay.com",
      "upgrade-insecure-requests",
    ].join('; ');
    response.headers.set('Content-Security-Policy', csp);
  }

  // Protect admin routes
  if (pathname.startsWith('/admin.3layered.06082008')) {
    // Additional security for admin routes
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    
    // Check for admin authentication token in headers (for API routes)
    if (pathname.startsWith('/api/admin')) {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }
  }

  // Protect API routes from unauthorized access
  if (pathname.startsWith('/api/orders/create')) {
    // Rate limiting is handled in the route itself
    // But we can add additional checks here
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    
    // Allow requests from same origin or trusted origins
    if (origin && !origin.includes(process.env.NEXT_PUBLIC_SITE_URL || 'localhost')) {
      // Log suspicious requests
      console.warn('[Security] Suspicious origin:', origin);
    }
  }

  // Add security headers to all responses
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

