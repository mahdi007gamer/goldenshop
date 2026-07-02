import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { withSecurityHeaders } from "@/lib/security-headers";

/**
 * GET /api/admin/orders/stats
 * Returns aggregated order counts grouped by status.
 * Used by the admin orders dashboard to render priority stat cards.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const stats = await prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    const statusCounts: Record<string, number> = {
      pending_payment: 0,
      payment_submitted: 0,
      payment_verifying: 0,
      payment_confirmed: 0,
      payment_rejected: 0,
      awaiting_license: 0,
      license_out_of_stock: 0,
      completed: 0,
      cancelled: 0,
      refunded: 0,
    };

    stats.forEach((s) => {
      statusCounts[s.status] = s._count._all;
    });

    return withSecurityHeaders(NextResponse.json({ success: true, data: statusCounts }));
  } catch {
    return withSecurityHeaders(
      NextResponse.json(
        { success: false, error: { code: "STATS_ERROR", message: "Failed to load order stats" } },
        { status: 500 }
      )
    );
  }
}
