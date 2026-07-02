import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeString } from "@/lib/auth-utils";
import { withSecurityHeaders } from "@/lib/security-headers";

/**
 * POST /api/admin/orders/verify-payment
 * Admin verifies payment and assigns licenses automatically.
 * Body: { orderId: string, approved: boolean, rejectionReason?: string }
 * Steps on approve:
 *   1. Find available LicenseInventory for each product in order
 *   2. If all available: assign licenses, mark order "payment_confirmed"
 *   3. If any missing: mark order "awaiting_license"
 *   4. Update paymentStatus = "verified"
 * Steps on reject:
 *   1. Update order status = "payment_rejected", paymentStatus = "rejected"
 *   2. Set rejectionReason
 * Requires: admin auth
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const orderId = sanitizeString(body.orderId, 100);
    const approved = body.approved === true;
    const rejectionReason = sanitizeString(body.rejectionReason, 500);

    if (!orderId) {
      return withSecurityHeaders(
        NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "orderId is required" } },
          { status: 400 }
        )
      );
    }

    // Fetch order with items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return withSecurityHeaders(
        NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Order not found" } },
          { status: 404 }
        )
      );
    }

    if (order.status !== "payment_submitted" && order.paymentStatus !== "submitted") {
      return withSecurityHeaders(
        NextResponse.json(
          { success: false, error: { code: "INVALID_STATUS", message: "Order is not in submitted status" } },
          { status: 400 }
        )
      );
    }

    if (!approved) {
      // Reject payment
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "payment_rejected",
          paymentStatus: "rejected",
          rejectionReason: rejectionReason || "Payment rejected by admin",
        },
        include: {
          items: true,
          licenses: { select: { key: true, status: true, productName: true, expiresAt: true } },
        },
      });

      return withSecurityHeaders(
        NextResponse.json({
          success: true,
          data: updated,
          message: "Payment rejected",
        })
      );
    }

    // Approve: try to assign licenses from inventory
    const assignedLicenses: string[] = [];
    let allAvailable = true;

    for (const item of order.items) {
      // Find available inventory for this product + billing cycle
      const availableLicense = await prisma.licenseInventory.findFirst({
        where: { productId: item.productId, billingCycle: item.billingCycle, status: "available" },
      });

      if (availableLicense) {
        // Assign this license
        await prisma.$transaction([
          // Update inventory record
          prisma.licenseInventory.update({
            where: { id: availableLicense.id },
            data: { status: "assigned", orderId, assignedAt: new Date() },
          }),
          // Create active license for user
          prisma.license.create({
            data: {
              key: availableLicense.licenseKey, // Already encrypted
              orderId,
              userId: order.userId,
              productId: item.productId,
              productName: item.productName,
              game: "Unknown",
              status: "active",
              expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
          }),
        ]);
        assignedLicenses.push(availableLicense.id);
      } else {
        allAvailable = false;
      }
    }

    // Update order status
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: allAvailable ? "payment_confirmed" : "awaiting_license",
        paymentStatus: "verified",
        assignedLicenseIds: JSON.stringify(assignedLicenses),
      },
      include: {
        items: true,
        licenses: { select: { key: true, status: true, productName: true, expiresAt: true } },
      },
    });

    // Update CardToCardPayment status
    await prisma.cardToCardPayment.updateMany({
      where: { userId: order.userId, reference: order.last4Digits || "" },
      data: { status: "approved", approvedAt: new Date() },
    });

    return withSecurityHeaders(
      NextResponse.json({
        success: true,
        data: updated,
        message: allAvailable
          ? "Payment verified and licenses assigned"
          : "Payment verified but some licenses are awaiting inventory",
      })
    );
  } catch (err) {
    console.error("Verify payment error:", err);
    return withSecurityHeaders(
      NextResponse.json(
        { success: false, error: { code: "VERIFY_PAYMENT_ERROR", message: "Failed to verify payment" } },
        { status: 500 }
      )
    );
  }
}
