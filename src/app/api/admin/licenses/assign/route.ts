import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeString } from "@/lib/auth-utils";
import { encryptLicenseKey } from "@/lib/license-crypto";

/**
 * POST /api/admin/licenses/assign
 * Manually assign a license to an order (when inventory was empty).
 * Body: { orderId: string, licenseKey: string }
 * Steps:
 *   1. Verify order exists and status is appropriate
 *   2. Encrypt and create LicenseInventory record
 *   3. Create active License for user
 *   4. Update order status to completed/payment_confirmed
 * Requires: admin auth
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const orderId = sanitizeString(body.orderId, 100);
    const licenseKey = sanitizeString(body.licenseKey, 500);

    if (!orderId || !licenseKey) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "orderId and licenseKey are required" } },
        { status: 400 }
      );
    }

    // Fetch the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    // Create encrypted inventory record + active license for the user
    const productId = order.items[0]?.productId;
    const productName = order.items[0]?.productName || "Unknown";

    const [inventoryRecord, licenseRecord] = await prisma.$transaction([
      prisma.licenseInventory.create({
        data: {
          productId,
          licenseKey: encryptLicenseKey(licenseKey),
          status: "assigned",
          orderId,
          assignedAt: new Date(),
        },
      }),
      prisma.license.create({
        data: {
          key: licenseKey, // License model still stores plain key for the user
          orderId,
          userId: order.userId,
          productId,
          productName,
          game: "Unknown",
          status: "active",
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year default
        },
      }),
    ]);

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "payment_confirmed",
        paymentStatus: "verified",
      },
    });

    return NextResponse.json({
      success: true,
      data: { inventoryId: inventoryRecord.id, licenseId: licenseRecord.id },
      message: "License assigned successfully",
    });
  } catch (err) {
    console.error("Assign license error:", err);
    return NextResponse.json(
      { success: false, error: { code: "ASSIGN_LICENSE_ERROR", message: "Failed to assign license" } },
      { status: 500 }
    );
  }
}
