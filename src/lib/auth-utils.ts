import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeHtml, stripHtml } from "@/lib/html-sanitizer";

export interface AuthUser {
  id: string;
  username: string;
  phone: string;
  role: "admin" | "user";
  status: string;
}

/**
 * Extract session token from request cookies and validate it.
 * Returns the authenticated user or null.
 */
export async function verifySession(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get("gc_session")?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          phone: true,
          role: true,
          status: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    }
    return null;
  }

  if (session.user.status === "suspended") {
    return null;
  }

  return session.user as AuthUser;
}

/**
 * Require authentication. Returns user or a NextResponse (error) to return from the route.
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: AuthUser } | NextResponse> {
  const user = await verifySession(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }
  return { user };
}

/**
 * Require admin role. Returns user or a NextResponse (error) to return from the route.
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ user: AuthUser } | NextResponse> {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  if (auth.user.role !== "admin") {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Admin access required" } },
      { status: 403 }
    );
  }

  return auth;
}

/**
 * Sanitize a string input — trim, limit length, strip dangerous chars.
 */
export function sanitizeString(value: unknown, maxLen = 500): string {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .slice(0, maxLen)
    .replace(/[<>]/g, ""); // Strip < and > to prevent HTML injection
}

/**
 * Sanitize rich text HTML — preserves safe HTML tags/attributes,
 * strips dangerous ones (scripts, event handlers, etc.).
 * Use this for product descriptions, article content, etc.
 */
export function sanitizeRichText(value: unknown, maxLen = 20000): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim().slice(0, maxLen);
  return sanitizeHtml(trimmed);
}

/**
 * Strip all HTML tags and return plain text.
 * Useful for meta descriptions, excerpts, etc.
 */
export { stripHtml };

/**
 * Sanitize a phone number — digits only, must match 09XXXXXXXXX.
 */
export function sanitizePhone(value: unknown): string {
  if (typeof value !== "string") return "";
  let cleanValue = value.trim();
  const persianDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  const arabicDigits = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
  for (let i = 0; i < 10; i++) {
    cleanValue = cleanValue.replace(persianDigits[i], String(i)).replace(arabicDigits[i], String(i));
  }
  const digits = cleanValue.replace(/\D/g, "");
  return digits;
}

/**
 * Validate and parse a positive integer from query params.
 */
export function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 0) return fallback;
  return Math.min(parsed, 1000); // Cap at 1000 to prevent abuse
}
