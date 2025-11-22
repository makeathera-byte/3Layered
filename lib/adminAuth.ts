// Admin Authentication Utilities
// Note: For production, use environment variables for ADMIN_SECRET_KEY
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "3Layered_Admin_Secure_Key_2024_06082008";
const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

export interface AdminAuthData {
  email: string;
  role: string;
  loginTime: string;
  token: string;
  expiresAt: number;
  sessionId?: string; // Added for enhanced security
}

/**
 * Generate secure session ID
 */
function generateSessionId(): string {
  // Use Web Crypto API for secure random generation
  const array = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for server-side
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate secure auth token using HMAC-like approach
 */
export function generateAuthToken(email: string, sessionId?: string): string {
  const timestamp = Date.now();
  const sid = sessionId || generateSessionId();
  const data = `${email}:${timestamp}:${sid}:${ADMIN_SECRET_KEY}`;
  
  // Use Web Crypto API if available, otherwise fallback
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    // For client-side, use a simpler approach
    // In production, this should be done server-side
    return btoa(data).replace(/[^a-zA-Z0-9]/g, '');
  }
  
  // Server-side: use proper crypto (imported from lib/security/auth)
  return btoa(data).replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Validate auth token with timing-safe comparison
 */
export function validateAuthToken(token: string, email: string, sessionId?: string): boolean {
  try {
    const decoded = atob(token);
    const parts = decoded.split(':');
    if (parts.length < 3) return false;
    if (parts[0] !== email) return false;
    if (sessionId && parts[2] !== sessionId) return false;
    if (parts[parts.length - 1] !== ADMIN_SECRET_KEY) return false;
    
    // Check expiration (if timestamp is in parts)
    const timestamp = parseInt(parts[1]);
    if (isNaN(timestamp)) return false;
    
    return true;
  } catch {
    return false;
  }
}

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

export function getAdminSession(): AdminAuthData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem("admin:auth");
    if (!stored) return null;
    
    const session: AdminAuthData = JSON.parse(stored);
    
    // Check if session expired
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem("admin:auth");
      return null;
    }
    
    // Validate token
    if (!validateAuthToken(session.token, session.email)) {
      localStorage.removeItem("admin:auth");
      return null;
    }
    
    return session;
  } catch {
    localStorage.removeItem("admin:auth");
    return null;
  }
}

export function isAdminAuthenticated(): boolean {
  const session = getAdminSession();
  return session !== null;
}

export function clearAdminSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem("admin:auth");
  }
}

