import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeString } from "@/lib/auth-utils";
import { encryptLicenseKey } from "@/lib/license-crypto";

/**
 * POST /api/admin/licenses/bulk
 * Bulk import license keys from a text array.
 * Body: { productId: string, keys: string[] }
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const productId = sanitizeString(body.productId, 100);
    const keys: string[] = Array.isArray(body.keys) ? body.keys : [];

    if (!productId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "productId is required" } },
        { status: 400 }
      );
    }

    if (keys.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "At least one key is required" } },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Product not found" } },
        { status: 404 }
      );
    }

    // Create inventory records in a transaction (batch up to 100)
    const batch = keys.slice(0, 100);
    const created = await prisma.$transaction(
      batch.map((key) =>
        prisma.licenseInventory.create({
          data: {
            productId,
            licenseKey: encryptLicenseKey(key.trim()),
            status: "available",
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      data: { count: created.length },
      message: `${created.length} لایسنس با موفقیت وارد موجودی شد`,
    });
  } catch (err) {
    console.error("[POST /api/admin/licenses/bulk]", err);
    return NextResponse.json(
      { success: false, error: { code: "BULK_IMPORT_ERROR", message: "Bulk import failed" } },
      { status: 500 }
    );
  }
}
