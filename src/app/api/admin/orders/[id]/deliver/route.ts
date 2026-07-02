import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeString } from "@/lib/auth-utils";
import { withSecurityHeaders } from "@/lib/security-headers";

/**
 * POST /api/admin/orders/[id]/deliver
 * Admin manually delivers a license key to an order.
 * Body: { licenseKey: string, note?: string }
 * Requires: order.status === "awaiting_license" || "license_out_of_stock"
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id: orderId } = await params;
    const body = await request.json();
    const licenseKey = sanitizeString(body.licenseKey, 500);
    const note = sanitizeString(body.note, 500);

    if (!licenseKey) {
      return withSecurityHeaders(
        NextResponse.json(
          { success: false, error: { code: "VALIDATION", message: "License key is required" } },
          { status: 400 }
        )
      );
    }

    // Fetch order
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

    if (order.status !== "awaiting_license" && order.status !== "license_out_of_stock") {
      return withSecurityHeaders(
        NextResponse.json(
          { success: false, error: { code: "INVALID_STATUS", message: "Order is not awaiting license" } },
          { status: 400 }
        )
      );
    }

    if (order.items.length === 0) {
      return withSecurityHeaders(
        NextResponse.json(
          { success: false, error: { code: "NO_ITEMS", message: "Order has no items to attach license to" } },
          { status: 400 }
        )
      );
    }

    const firstItem = order.items[0];

    // Create license + delivery record + order update + audit log in a single transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      await tx.license.create({
        data: {
          key: licenseKey,
          orderId,
          userId: order.userId,
          productId: firstItem.productId,
          productName: firstItem.productName,
          game: "Unknown",
          status: "active",
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });

      await tx.licenseDelivery.create({
        data: {
          orderId,
          adminId: auth.user.id,
          adminName: auth.user.username,
          licenseKey,
          method: "manual",
          note,
        },
      });

      await tx.orderStatusLog.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: "completed",
          action: "manual_deliver",
          adminId: auth.user.id,
          adminName: auth.user.username,
          note,
        },
      });

      return tx.order.update({
        where: { id: orderId },
        data: {
          status: "completed",
          paymentStatus: "verified",
        },
        include: {
          items: true,
          licenses: true,
          licenseDeliveries: true,
        },
      });
    });

    return withSecurityHeaders(
      NextResponse.json({
        success: true,
        data: { order: updatedOrder },
        message: "License delivered successfully",
      })
    );
  } catch (err) {
    console.error("Manual deliver error:", err);
    return withSecurityHeaders(
      NextResponse.json(
        { success: false, error: { code: "DELIVER_ERROR", message: "Failed to deliver license" } },
        { status: 500 }
      )
    );
  }
}
