// Vortiq Anti-Flooding & Rate Limiting Guard

interface RateLimitTracker {
  count: number;
  resetTime: number;
}

const attemptsMap = new Map<string, RateLimitTracker>();

/**
 * Client-side Rate Limiter to prevent rapid-fire form submissions or API hammering.
 * @param key Identifier for the action (e.g., 'login', 'create-lead', 'photo-upload')
 * @param maxAttempts Maximum allowed attempts in window
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(key: string, maxAttempts: number = 10, windowMs: number = 60000): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const tracker = attemptsMap.get(key);

  if (!tracker || now > tracker.resetTime) {
    attemptsMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, retryAfterMs: 0 };
  }

  if (tracker.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, tracker.resetTime - now),
    };
  }

  tracker.count += 1;
  return { allowed: true, remaining: maxAttempts - tracker.count, retryAfterMs: 0 };
}
