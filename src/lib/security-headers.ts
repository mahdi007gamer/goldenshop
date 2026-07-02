import { NextRequest, NextResponse } from "next/server";

/**
 * Security headers applied to all JSON API responses.
 * Same-origin only (no CORS), no caching for authenticated endpoints,
 * and baseline hardening against MIME-sniffing / clickjacking.
 */
export const API_SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "0",
  "Referrer-Policy": "no-referrer",
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "Pragma": "no-cache",
} as const;

/**
 * Extract a best-effort client IP from a NextRequest for rate limiting.
 * Falls back to "anonymous" when nothing usable is present (e.g. same-origin).
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? request.ip ?? "anonymous";
}

/**
 * Wrap a NextResponse with the standard security headers.
 */
export function withSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(API_SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

/**
 * Build a security-headers-enforced error JSON response.
 */
export function securityJsonError(
  code: string,
  message: string,
  status: number,
  extraHeaders: Record<string, string> = {}
): NextResponse {
  const res = NextResponse.json(
    { success: false, error: { code, message } },
    { status }
  );
  withSecurityHeaders(res);
  for (const [key, value] of Object.entries(extraHeaders)) {
    res.headers.set(key, value);
  }
  return res;
}
