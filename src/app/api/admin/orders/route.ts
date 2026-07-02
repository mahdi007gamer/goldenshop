import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeString, parsePositiveInt } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const status = sanitizeString(searchParams.get("status"));
    const search = sanitizeString(searchParams.get("search"));
    const take = parsePositiveInt(searchParams.get("take"), 20);
    const cursor = sanitizeString(searchParams.get("cursor"), 100);
    const skip = parsePositiveInt(searchParams.get("skip"), 0);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) where.OR = [{ id: { contains: search } }, { user: { username: { contains: search } } }];

    const baseArgs = {
      where,
      include: {
        user: { select: { id: true, username: true, phone: true } },
        items: { select: { id: true, productName: true, price: true, quantity: true, billingCycle: true, productId: true } },
        licenses: { select: { id: true, key: true, status: true, productName: true, expiresAt: true } },
        licenseDeliveries: { select: { id: true, deliveredAt: true, method: true, adminName: true } },
        statusLogs: { orderBy: { createdAt: "desc" as const }, take: 10 },
      },
      orderBy: { createdAt: "desc" as const },
      take,
    };

    const findManyArgs = cursor
      ? { ...baseArgs, cursor: { id: cursor }, skip: 1 }
      : skip > 0
        ? { ...baseArgs, skip }
        : baseArgs;

    const [orders, total] = await Promise.all([
      prisma.order.findMany(findManyArgs),
      prisma.order.count({ where }),
    ]);

    const nextCursor = orders.length === take ? orders[orders.length - 1].id : null;

    // Mask license keys (show only last 8 chars)
    const maskedOrders = orders.map((order) => ({
      ...order,
      licenses: (order.licenses || []).map((l) => ({
        ...l,
        key: l.key && l.key.length > 8 ? `****${l.key.slice(-8)}` : "****",
      })),
      statusLogs: order.statusLogs || [],
      licenseDeliveries: order.licenseDeliveries || [],
    }));

    return NextResponse.json({ success: true, data: { orders: maskedOrders, total, nextCursor } });
  } catch (err) {
    console.error("[admin/orders] GET error:", err);
    return NextResponse.json({ success: false, error: { code: "ORDERS_ERROR", message: "Failed to load orders" } }, { status: 500 });
  }
}
