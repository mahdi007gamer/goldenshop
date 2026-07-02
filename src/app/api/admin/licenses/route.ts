import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeString, parsePositiveInt } from "@/lib/auth-utils";
import { encryptLicenseKey, generateLicenseKey } from "@/lib/license-crypto";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const status = sanitizeString(searchParams.get("status"));
    const productId = sanitizeString(searchParams.get("productId"));
    const search = sanitizeString(searchParams.get("search"));
    const take = parsePositiveInt(searchParams.get("take"), 50);
    const skip = parsePositiveInt(searchParams.get("skip"), 0);
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (productId) where.productId = productId;
    if (search) {
      where.OR = [
        { key: { contains: search } },
        { productName: { contains: search } },
        { user: { username: { contains: search } } },
      ];
    }
    const [licenses, total] = await Promise.all([
      prisma.license.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take,
        skip,
        include: { user: { select: { username: true } } },
      }),
      prisma.license.count({ where }),
    ]);
    const activeCount = await prisma.license.count({ where: { status: "active" } });
    const revokedCount = await prisma.license.count({ where: { status: "revoked" } });
    const expiredCount = await prisma.license.count({ where: { status: "expired" } });
    return NextResponse.json({
      success: true,
      data: {
        licenses,
        total,
        counts: { available: activeCount, reserved: revokedCount, assigned: expiredCount },
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: { code: "LICENSES_ERROR", message: "Failed to load licenses" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const productId = sanitizeString(body.productId, 100);
    const quantity = Math.min(Math.max(parseInt(body.quantity) || 1, 1), 100);
    const billingCycle = sanitizeString(body.billingCycle, 50) || "monthly";
    const userId = sanitizeString(body.userId, 100) || null;

    if (!productId) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "productId is required" } }, { status: 400 });
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Product not found" } }, { status: 404 });

    // Validate userId if provided
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, { status: 404 });
    }

    // Calculate expiry based on billing cycle
    const now = new Date();
    const expiresAt = new Date(now);
    switch (billingCycle) {
      case "daily": expiresAt.setDate(now.getDate() + 1); break;
      case "weekly": expiresAt.setDate(now.getDate() + 7); break;
      case "biweekly": expiresAt.setDate(now.getDate() + 14); break;
      case "monthly": expiresAt.setMonth(now.getMonth() + 1); break;
      case "bimonthly": expiresAt.setMonth(now.getMonth() + 2); break;
      case "quarterly": expiresAt.setMonth(now.getMonth() + 3); break;
      case "lifetime": expiresAt.setFullYear(now.getFullYear() + 100); break;
      default: expiresAt.setMonth(now.getMonth() + 1);
    }

    // Create LicenseInventory (for delivery pipeline) and License (for admin view) in sequence
    const created: { id: string; key: string }[] = [];
    for (let i = 0; i < quantity; i++) {
      const key = generateLicenseKey();
      const inventory = await prisma.licenseInventory.create({
        data: {
          productId,
          licenseKey: encryptLicenseKey(key),
          status: userId ? "assigned" : "available",
          ...(userId ? { assignedAt: new Date() } : {}),
        },
      });
      const license = await prisma.license.create({
        data: {
          key,
          userId,
          inventoryId: inventory.id,
          productId,
          productName: product.name,
          game: product.game || product.category || "General",
          status: "active",
          expiresAt,
        },
      });
      created.push({ id: license.id, key });
    }

    return NextResponse.json({
      success: true,
      data: { count: created.length, licenses: created },
      message: `${created.length} license keys generated`,
    });
  } catch (err) {
    console.error("[POST /api/admin/licenses]", err);
    return NextResponse.json({ success: false, error: { code: "CREATE_LICENSE_ERROR", message: "Failed to create licenses" } }, { status: 500 });
  }
}
