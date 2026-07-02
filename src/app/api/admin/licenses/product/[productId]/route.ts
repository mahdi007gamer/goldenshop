import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

/**
 * GET /api/admin/licenses/product/[productId]
 * Returns license inventory count for a product.
 * Requires: admin auth
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "productId is required" } },
        { status: 400 }
      );
    }

    const available = await prisma.licenseInventory.count({
      where: { productId, status: "available" },
    });
    const reserved = await prisma.licenseInventory.count({
      where: { productId, status: "reserved" },
    });
    const assigned = await prisma.licenseInventory.count({
      where: { productId, status: "assigned" },
    });
    const total = available + reserved + assigned;

    return NextResponse.json({
      success: true,
      data: { available, reserved, assigned, total },
    });
  } catch (err) {
    console.error("Get license count error:", err);
    return NextResponse.json(
      { success: false, error: { code: "LICENSE_COUNT_ERROR", message: "Failed to get license count" } },
      { status: 500 }
    );
  }
}
