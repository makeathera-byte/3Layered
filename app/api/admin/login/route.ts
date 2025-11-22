import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createAdminSession } from '@/lib/adminAuth';
import { rateLimit, getClientIP } from '@/lib/backend/security';
import { sanitizeEmail } from '@/lib/security/input-sanitizer';
import { logger } from '@/lib/backend/logger';
import { handleApiError, ValidationError, AuthenticationError } from '@/lib/backend/errors';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  
  try {
    // Rate limiting for login attempts (5 attempts per 15 minutes)
    const rateLimitKey = `admin:login:${clientIP}`;
    if (!rateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
      logger.warn('Admin login rate limit exceeded', { ip: clientIP });
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      throw new ValidationError('Email and password required');
    }

    // Sanitize email
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      throw new ValidationError('Invalid email format');
    }

    // Validate password
    if (typeof password !== 'string' || password.length < 6) {
      throw new ValidationError('Invalid password');
    }

    logger.info('Admin login attempt', { email: sanitizedEmail, ip: clientIP });

    // Query the users table for admin with matching email
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role, password_hash')
      .eq('email', sanitizedEmail)
      .eq('role', 'admin')
      .single();

    if (error || !user) {
      logger.warn('Admin login failed - user not found', { email: sanitizedEmail, ip: clientIP });
      throw new AuthenticationError('Invalid admin credentials');
    }

    // Verify password (simple comparison - in production use bcrypt)
    // TODO: Implement proper password hashing with bcrypt
    if ((user as any).password_hash !== password) {
      logger.warn('Admin login failed - invalid password', { email: sanitizedEmail, ip: clientIP });
      throw new AuthenticationError('Invalid admin credentials');
    }

    // Create session
    const session = createAdminSession((user as any).email);

    // Store session in admin_sessions table
    const { error: sessionError } = await supabaseAdmin
      .from('admin_sessions')
      .insert({
        user_id: (user as any).id,
        token: session.token,
        expires_at: new Date(session.expiresAt).toISOString()
      } as any);

    if (sessionError) {
      console.error('Session storage error:', sessionError);
      // Don't fail the login, just log the error
    }

    logger.info('Admin login successful', { email: sanitizedEmail, userId: user.id });

    const response = NextResponse.json({
      success: true,
      session,
      user: {
        id: (user as any).id,
        email: (user as any).email,
        full_name: (user as any).full_name,
        role: (user as any).role
      }
    });

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    
    return response;
  } catch (error) {
    logger.error('Admin login error', error, { ip: clientIP });
    return handleApiError(error);
  }
}

