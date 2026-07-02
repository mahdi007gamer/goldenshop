import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { checkRateLimit } from "@/lib/rate-limiter";
import { withSecurityHeaders, securityJsonError, getClientIp } from "@/lib/security-headers";

/**
 * GET /api/orders/[id]/status
 * Returns current order status for polling by the checkout status page.
 * Only accessible by the order owner (requireAuth + userId ownership check).
 * Rate-limited: 60 requests per 10s window per (user,IP) pair.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    // Rate limit per (user, IP) so a single user/account can't flood polling
    const clientIp = getClientIp(request);
    const rateKey = `order_status:${auth.user.id}:${clientIp}`;
    const rateLimit = checkRateLimit(rateKey, 60, 10_000);
    if (!rateLimit.allowed) {
      return securityJsonError("RATE_LIMITED", "Too many requests", 429, {
        "Retry-After": String(rateLimit.retryAfter),
      });
    }

    const order = await prisma.order.findFirst({
      where: { id, userId: auth.user.id },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        last4Digits: true,
        createdAt: true,
        updatedAt: true,
        rejectionReason: true,
        licenseDeliveries: {
          select: {
            id: true,
            deliveredAt: true,
            method: true,
          },
        },
        licenses: {
          select: {
            id: true,
            key: true,
            status: true,
            productName: true,
            expiresAt: true,
          },
        },
        items: {
          select: {
            productName: true,
            billingCycle: true,
            productId: true,
          },
        },
      },
    });

    if (!order) {
      return securityJsonError("NOT_FOUND", "Order not found", 404);
    }

    // Get course slug from the first product in the order
    let courseSlug: string | null = null;
    if (order.items?.length > 0) {
      const productId = order.items[0].productId;
      if (productId) {
        const course = await prisma.course.findFirst({
          where: { productId },
          select: { slug: true },
        });
        courseSlug = course?.slug || null;
      }
    }

    // Calculate estimated completion time (60 min from last update)
    const submittedAt = order.updatedAt;
    const estimatedCompletion = new Date(submittedAt.getTime() + 60 * 60 * 1000);
    const now = new Date();
    const remainingMs = Math.max(0, estimatedCompletion.getTime() - now.getTime());

    const res = NextResponse.json({
      success: true,
      data: {
        ...order,
        courseSlug,
        remainingSeconds: Math.floor(remainingMs / 1000),
        estimatedCompletion: estimatedCompletion.toISOString(),
      },
    });
    return withSecurityHeaders(res);
  } catch {
    return securityJsonError("STATUS_ERROR", "Failed to get status", 500);
  }
}