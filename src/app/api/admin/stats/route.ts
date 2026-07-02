import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const [totalUsers, activeLicenses, totalOrders, openTickets, totalProducts, paidOrders] = await Promise.all([
      prisma.user.count(),
      prisma.license.count({ where: { status: "active" } }),
      prisma.order.count(),
      prisma.ticket.count({ where: { status: "open" } }),
      prisma.product.count(),
      prisma.order.findMany({ where: { status: { in: ["paid", "active"] } }, select: { total: true } }),
    ]);
    const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    return NextResponse.json({ success: true, data: { totalUsers, activeLicenses, totalOrders, openTickets, totalProducts, revenue } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "STATS_ERROR", message: "Failed to load stats" } }, { status: 500 });
  }
}
