/**
 * In-memory rate limiter for OTP endpoints.
 * Limits requests per phone number and per IP.
 */

const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (record.count >= maxAttempts) {
    return true;
  }

  record.count++;
  return false;
}

export function checkPhoneRateLimit(phone: string): boolean {
  // Max 3 OTP requests per phone per 10 minutes
  return isRateLimited(`phone:${phone}`, 3, 10 * 60 * 1000);
}

export function checkIpRateLimit(ip: string): boolean {
  // Max 10 OTP requests per IP per 10 minutes
  return isRateLimited(`ip:${ip}`, 10, 10 * 60 * 1000);
}

export function clearRateLimit(key: string): void {
  attempts.delete(key);
}

// ─── Extended API for polling / general-purpose limiters ─────────────────────

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number; // ms until window resets (only meaningful when !allowed)
}

/**
 * General-purpose rate limiter.
 * Returns {allowed, remaining, retryAfter} for the given key.
 * `maxAttempts` requests are allowed within `windowMs`. Keyed per caller/IP.
 */
export function checkRateLimit(key: string, maxAttempts: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, retryAfter: 0 };
  }

  if (record.count >= maxAttempts) {
    const retryAfter = Math.max(0, record.resetAt - now);
    return { allowed: false, remaining: 0, retryAfter: Math.ceil(retryAfter / 1000) };
  }

  record.count++;
  return { allowed: true, remaining: Math.max(0, maxAttempts - record.count), retryAfter: 0 };
}
