import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeString } from "@/lib/auth-utils";
import { encryptLicenseKey } from "@/lib/license-crypto";

/**
 * POST /api/admin/licenses/add
 * Bulk add pre-generated license keys to a product's inventory.
 * Body: { productId: string, licenseKeys: string[] }
 * Requires: admin auth
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const productId = sanitizeString(body.productId, 100);
    const licenseKeys = Array.isArray(body.licenseKeys) ? body.licenseKeys : [];

    if (!productId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "productId is required" } },
        { status: 400 }
      );
    }

    if (licenseKeys.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "At least one license key is required" } },
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

    // Encrypt and create all license inventory records
    const created = await prisma.$transaction(
      licenseKeys.map((key: string) =>
        prisma.licenseInventory.create({
          data: {
            productId,
            licenseKey: encryptLicenseKey(key),
            status: "available",
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      data: { count: created.length },
      message: `${created.length} license keys added to inventory`,
    });
  } catch (err) {
    console.error("Add licenses error:", err);
    return NextResponse.json(
      { success: false, error: { code: "ADD_LICENSES_ERROR", message: "Failed to add licenses" } },
      { status: 500 }
    );
  }
}
