import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeString } from "@/lib/auth-utils";
import { withSecurityHeaders } from "@/lib/security-headers";

/**
 * GET /api/admin/licenses/inventory
 * List license inventory — optional filters: productId, billingCycle, status
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const productId = sanitizeString(searchParams.get("productId"), 100);
    const billingCycle = sanitizeString(searchParams.get("billingCycle"), 50);
    const status = sanitizeString(searchParams.get("status"), 50);

    const where: Record<string, unknown> = {};
    if (productId) where.productId = productId;
    if (billingCycle) where.billingCycle = billingCycle;
    if (status) where.status = status;

    const items = await prisma.licenseInventory.findMany({
      where,
      include: { product: { select: { id: true, name: true, nameFa: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Aggregate stock per product+billingCycle
    const stockMap = await prisma.licenseInventory.groupBy({
      by: ["productId", "billingCycle"],
      _count: { _all: true },
      where: { status: "available" },
    });

    return withSecurityHeaders(
      NextResponse.json({
        success: true,
        data: {
          items,
          stock: stockMap.map((s) => ({
            productId: s.productId,
            billingCycle: s.billingCycle,
            available: s._count._all,
          })),
        },
      })
    );
  } catch (err) {
    console.error("[licenses/inventory] GET error:", err);
    return withSecurityHeaders(
      NextResponse.json(
        { success: false, error: { code: "INVENTORY_ERROR", message: "Failed to load inventory" } },
        { status: 500 }
      )
    );
  }
}

/**
 * POST /api/admin/licenses/inventory
 * Add a license to inventory.
 * Body: { productId, billingCycle, licenseKey, productName? }
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const productId = sanitizeString(body.productId, 100);
    const billingCycle = sanitizeString(body.billingCycle, 50);
    const licenseKey = sanitizeString(body.licenseKey, 500);
    const productName = sanitizeString(body.productName, 200);

    if (!productId || !billingCycle || !licenseKey) {
      return withSecurityHeaders(
        NextResponse.json(
          { success: false, error: { code: "VALIDATION", message: "productId, billingCycle, licenseKey are required" } },
          { status: 400 }
        )
      );
    }

    const item = await prisma.licenseInventory.create({
      data: { productId, billingCycle, licenseKey, productName },
    });

    return withSecurityHeaders(
      NextResponse.json({ success: true, data: item, message: "License added to inventory" })
    );
  } catch (err) {
    console.error("[licenses/inventory] POST error:", err);
    return withSecurityHeaders(
      NextResponse.json(
        { success: false, error: { code: "INVENTORY_ERROR", message: "Failed to add license" } },
        { status: 500 }
      )
    );
  }
}
