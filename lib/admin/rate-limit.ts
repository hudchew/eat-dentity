import { prisma } from '@/lib/prisma';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Get rate limit key for tracking
 */
export function getRateLimitKey(action: string, identifier: string): string {
  return `rate_limit:${action}:${identifier}`;
}

/**
 * Check rate limit using database
 * Simple in-memory solution - for production, use Redis
 */
const rateLimitStore = new Map<string, { count: number; resetAt: Date }>();

/**
 * Check rate limit
 * @param key - Rate limit key
 * @param maxAttempts - Maximum attempts allowed
 * @param windowMinutes - Time window in minutes
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMinutes: number = 15
): Promise<RateLimitResult> {
  const now = new Date();
  const entry = rateLimitStore.get(key);

  // Clean expired entries
  if (entry && entry.resetAt < now) {
    rateLimitStore.delete(key);
  }

  const currentEntry = rateLimitStore.get(key);

  if (!currentEntry) {
    // First attempt - create new entry
    const resetAt = new Date();
    resetAt.setMinutes(resetAt.getMinutes() + windowMinutes);

    rateLimitStore.set(key, {
      count: 1,
      resetAt,
    });

    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetAt,
    };
  }

  // Check if limit exceeded
  if (currentEntry.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: currentEntry.resetAt,
    };
  }

  // Increment count
  currentEntry.count += 1;
  rateLimitStore.set(key, currentEntry);

  return {
    allowed: true,
    remaining: maxAttempts - currentEntry.count,
    resetAt: currentEntry.resetAt,
  };
}

/**
 * Reset rate limit for a key
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Clean up expired rate limit entries (call periodically)
 */
export function cleanupExpiredRateLimits(): void {
  const now = new Date();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

