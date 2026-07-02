import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeString } from "@/lib/auth-utils";
import { encryptLicenseKey, decryptLicenseKey } from "@/lib/license-crypto";
import { logAdminAction } from "@/lib/admin/audit";

/**
 * POST /api/admin/licenses/deliver
 * Manually deliver a license for a specific order item.
 * Body: { orderId: string, itemIndex: number, licenseKey: string }
 *
 * Security: admin-only, encrypts key for inventory storage,
 * stores plain key in License table for the user.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const orderId = sanitizeString(body.orderId, 100);
    const itemIndex = typeof body.itemIndex === "number" ? body.itemIndex : parseInt(body.itemIndex, 10);
    const licenseKey = sanitizeString(body.licenseKey, 500);

    if (!orderId || isNaN(itemIndex) || !licenseKey) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "orderId, itemIndex and licenseKey are required" } },
        { status: 400 }
      );
    }

    // Fetch order with items and existing licenses
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        licenses: { select: { id: true } },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    // Validate status allows manual delivery — allow any status that isn't completed/cancelled/refunded
    const blockedStatuses = ["completed", "cancelled", "refunded"];
    if (blockedStatuses.includes(order.status)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_STATUS", message: `Cannot deliver from status: ${order.status}` } },
        { status: 400 }
      );
    }

    const item = order.items[itemIndex];
    if (!item) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Item not found" } },
        { status: 404 }
      );
    }

    // Check if this item already has a license (one license per item)
    if (order.licenses.length > itemIndex) {
      return NextResponse.json(
        { success: false, error: { code: "ALREADY_DELIVERED", message: "This item already has a license" } },
        { status: 400 }
      );
    }

    // Calculate expiry based on billing cycle
    const durationDays = getDurationDays(item.billingCycle);
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    // Create inventory (encrypted) + license (plain) + notify user in one transaction
    const adminInfo = { adminId: auth.user.id, adminName: auth.user.username };

    const [, licenseRecord] = await prisma.$transaction([
      prisma.licenseInventory.create({
        data: {
          productId: item.productId,
          licenseKey: encryptLicenseKey(licenseKey),
          status: "assigned",
          orderId,
          assignedAt: new Date(),
        },
      }),
      prisma.license.create({
        data: {
          key: licenseKey,
          orderId,
          userId: order.userId,
          productId: item.productId,
          productName: item.productName,
          game: "Unknown",
          status: "active",
          paymentStatus: "verified",
          expiresAt,
        },
      }),
    ]);

    // Check if ALL items now have licenses — if so, mark order completed
    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, licenses: { select: { id: true } } },
    });

    let orderCompleted = false;
    if (updatedOrder && updatedOrder.licenses.length >= updatedOrder.items.length) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "completed" },
      });
      orderCompleted = true;
    }

    // Notify the user
    try {
      await prisma.notification.create({
        data: {
          userId: order.userId,
          type: "license",
          title: orderCompleted ? "سفارش تکمیل شد" : "لایسنس شما آماده است",
          message: orderCompleted
            ? `سفارش شما با موفقیل تکمیل شد. به بخش لایسنس‌ها بروید.`
            : `لایسنس محصول "${item.productName}" به سفارش شما اضافه شد.`,
          link: "/dashboard/licenses",
        },
      });
    } catch (e) {
      console.error("[DELIVER] Failed to create notification:", e);
    }

    await logAdminAction({
      ...adminInfo,
      action: "manual_deliver",
      targetType: "order",
      targetId: orderId,
      targetRef: orderId.slice(0, 8),
      after: { itemIndex, productName: item.productName, orderCompleted },
    });

    return NextResponse.json({
      success: true,
      data: { licenseId: licenseRecord.id, orderCompleted },
      message: orderCompleted
        ? "لایسنس تحویل داده شد و سفارش تکمیل شد"
        : "لایسنس با موفقیت تحویل داده شد",
    });
  } catch (err) {
    console.error("[POST /api/admin/licenses/deliver]", err);
    return NextResponse.json(
      { success: false, error: { code: "DELIVER_ERROR", message: "Failed to deliver license" } },
      { status: 500 }
    );
  }
}

function getDurationDays(billingCycle: string): number {
  switch (billingCycle) {
    case "daily": return 1;
    case "weekly": return 7;
    case "monthly": return 30;
    case "quarterly": return 90;
    case "lifetime": return 3650;
    default: return 30;
  }
}
