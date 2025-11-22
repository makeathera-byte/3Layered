/**
 * Enhanced Rate Limiting
 * Distributed rate limiting for high traffic
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  /**
   * Check rate limit
   */
  check(
    identifier: string,
    maxRequests: number,
    windowMs: number,
    blockDurationMs?: number
  ): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    let entry = this.store.get(identifier);

    // Check if blocked
    if (entry?.blocked && entry.blockUntil && now < entry.blockUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.blockUntil,
      };
    }

    // Reset if blocked time expired
    if (entry?.blocked && entry.blockUntil && now >= entry.blockUntil) {
      entry.blocked = false;
      entry.blockUntil = undefined;
      entry.count = 0;
      entry.resetTime = now + windowMs;
    }

    // Create new entry or reset expired one
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
        blocked: false,
      };
    }

    // Check limit
    if (entry.count >= maxRequests) {
      // Block if block duration is specified
      if (blockDurationMs) {
        entry.blocked = true;
        entry.blockUntil = now + blockDurationMs;
      }
      
      this.store.set(identifier, entry);
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetTime,
      };
    }

    // Increment count
    entry.count++;
    this.store.set(identifier, entry);

    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetAt: entry.resetTime,
    };
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime && (!entry.blockUntil || now > entry.blockUntil)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Get rate limit status
   */
  getStatus(identifier: string): RateLimitEntry | null {
    return this.store.get(identifier) || null;
  }
}

export const rateLimiter = new RateLimiter();

