/**
 * Enhanced Authentication Security
 * Secure authentication utilities
 */

import crypto from 'crypto';

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "3Layered_Admin_Secure_Key_2024_06082008";
const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours

export interface AdminAuthData {
  email: string;
  role: string;
  loginTime: string;
  token: string;
  expiresAt: number;
  sessionId: string;
}

/**
 * Generate secure auth token using HMAC
 */
export function generateAuthToken(email: string, sessionId: string): string {
  const timestamp = Date.now();
  const data = `${email}:${timestamp}:${sessionId}`;
  const hmac = crypto.createHmac('sha256', ADMIN_SECRET_KEY);
  hmac.update(data);
  return hmac.digest('hex');
}

/**
 * Validate auth token
 */
export function validateAuthToken(token: string, email: string, sessionId: string): boolean {
  try {
    // Regenerate token with same parameters and compare
    const timestamp = Date.now();
    const data = `${email}:${timestamp}:${sessionId}`;
    const hmac = crypto.createHmac('sha256', ADMIN_SECRET_KEY);
    hmac.update(data);
    const expectedToken = hmac.digest('hex');
    
    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(expectedToken)
    );
  } catch {
    return false;
  }
}

/**
 * Generate secure session ID
 */
export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create secure admin session
 */
export function createAdminSession(email: string): AdminAuthData {
  const loginTime = new Date().toISOString();
  const expiresAt = Date.now() + SESSION_DURATION;
  const sessionId = generateSessionId();
  const token = generateAuthToken(email, sessionId);
  
  return {
    email,
    role: "admin",
    loginTime,
    token,
    expiresAt,
    sessionId,
  };
}

/**
 * Hash password (for future use)
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, ADMIN_SECRET_KEY, 10000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString('hex'));
    });
  });
}

/**
 * Verify password (for future use)
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return crypto.timingSafeEqual(
    Buffer.from(passwordHash),
    Buffer.from(hash)
  );
}

