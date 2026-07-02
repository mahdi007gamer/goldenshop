import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeString } from "@/lib/auth-utils";
import { logAdminAction, appendVerificationHistory } from "@/lib/admin/audit";
import { autoDeliverLicenses, manualDeliverLicense } from "@/lib/license/deliveryEngine";

/**
 * POST /api/admin/orders/actions
 * Unified action endpoint for order management.
 *
 * Actions:
 * - start_verify: Lock order for verification
 * - confirm_payment: Confirm payment + trigger auto delivery
 * - reject_payment: Reject payment with reason
 * - flag_order: Toggle flagged status
 * - manual_deliver_license: Manually deliver a license key
 * - cancel_order: Cancel order
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const action = sanitizeString(body.action, 50);
    const orderId = sanitizeString(body.orderId, 100);

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "orderId is required" } },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, licenses: { select: { id: true, status: true } } },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    const adminInfo = { adminId: auth.user.id, adminName: auth.user.username };
    const now = new Date().toISOString();

    switch (action) {
      case "start_verify": {
        if (order.status !== "payment_submitted" && order.status !== "payment_rejected") {
          return NextResponse.json(
            { success: false, error: { code: "INVALID_STATUS", message: `Cannot start verify from status: ${order.status}` } },
            { status: 400 }
          );
        }

        const history = appendVerificationHistory(order.verificationHistory, {
          action: "start_verify",
          by: auth.user.username,
          at: now,
        });

        const updated = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "payment_verifying",
            verificationStep: "verifying",
            isEditable: false,
            verificationHistory: history,
          },
          include: {
            user: { select: { username: true, phone: true } },
            items: { select: { productName: true, price: true, quantity: true, billingCycle: true, productId: true } },
            licenses: { select: { id: true, key: true, status: true, productName: true, expiresAt: true } },
          },
        });

        await logAdminAction({
          ...adminInfo,
          action: "start_verify",
          targetType: "order",
          targetId: orderId,
          targetRef: orderId.slice(0, 8),
          before: { status: order.status },
          after: { status: "payment_verifying" },
          ipAddress: request.headers.get("x-forwarded-for") || undefined,
          userAgent: request.headers.get("user-agent") || undefined,
        });

        return NextResponse.json({ success: true, data: updated, message: "بررسی پرداخت شروع شد" });
      }

      case "confirm_payment": {
        if (order.status !== "payment_verifying") {
          return NextResponse.json(
            { success: false, error: { code: "INVALID_STATUS", message: `Cannot confirm payment from status: ${order.status}` } },
            { status: 400 }
          );
        }

        const history = appendVerificationHistory(order.verificationHistory, {
          action: "confirm_payment",
          by: auth.user.username,
          at: now,
          note: body.adminInternalNote || undefined,
        });

        // Update order metadata (status will be set by autoDeliverLicenses)
        await prisma.order.update({
          where: { id: orderId },
          data: {
            verificationStep: "verified",
            verifiedBy: auth.user.id,
            verifiedAt: new Date(),
            adminInternalNote: body.adminInternalNote
              ? ((order.adminInternalNote ? order.adminInternalNote + "\n" : "") + `[${now}] ${auth.user.username}: ${sanitizeString(body.adminInternalNote, 1000)}`)
              : order.adminInternalNote,
            verificationHistory: history,
          },
        });

        // Trigger auto delivery — sets final status (completed or license_out_of_stock)
        const deliveryResult = await autoDeliverLicenses(orderId, adminInfo);

        await logAdminAction({
          ...adminInfo,
          action: "confirm_payment",
          targetType: "order",
          targetId: orderId,
          targetRef: orderId.slice(0, 8),
          before: { status: "payment_verifying" },
          after: {
            status: deliveryResult.success ? "completed" : "license_out_of_stock",
            deliveryMethod: deliveryResult.method,
            deliveredCount: deliveryResult.deliveredItems.length,
            missingCount: deliveryResult.missingItems.length,
          },
          ipAddress: request.headers.get("x-forwarded-for") || undefined,
          userAgent: request.headers.get("user-agent") || undefined,
        });

        // Reload order with updated delivery status
        const finalOrder = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            items: { select: { productName: true, price: true, quantity: true, billingCycle: true, productId: true } },
            licenses: { select: { id: true, key: true, status: true, productName: true, expiresAt: true } },
            user: { select: { username: true, phone: true } },
          },
        });

        return NextResponse.json({
          success: true,
          data: finalOrder,
          delivery: deliveryResult,
          message: deliveryResult.success
            ? "پرداخت تایید شد و لایسنس‌ها اتوماتیک تحویل داده شدند"
            : `پرداخت تایید شد. ${deliveryResult.message}`,
        });
      }

      case "reject_payment": {
        if (order.status !== "payment_verifying" && order.status !== "payment_submitted") {
          return NextResponse.json(
            { success: false, error: { code: "INVALID_STATUS", message: `Cannot reject payment from status: ${order.status}` } },
            { status: 400 }
          );
        }

        const rejectionReason = sanitizeString(body.rejectionReason, 500);
        if (!rejectionReason || rejectionReason.length < 5) {
          return NextResponse.json(
            { success: false, error: { code: "VALIDATION_ERROR", message: "دلیل رد پرداخت الزامی است (حداقل ۵ کاراکتر)" } },
            { status: 400 }
          );
        }

        const history = appendVerificationHistory(order.verificationHistory, {
          action: "reject_payment",
          by: auth.user.username,
          at: now,
          note: rejectionReason,
        });

        const updated = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "payment_rejected",
            verificationStep: "pending",
            isEditable: true,
            rejectionReason,
            verificationHistory: history,
          },
          include: {
            user: { select: { username: true, phone: true } },
            items: { select: { productName: true, price: true, quantity: true } },
            licenses: { select: { id: true, key: true, status: true, productName: true } },
          },
        });

        await logAdminAction({
          ...adminInfo,
          action: "reject_payment",
          targetType: "order",
          targetId: orderId,
          targetRef: orderId.slice(0, 8),
          before: { status: order.status },
          after: { status: "payment_rejected", rejectionReason },
          ipAddress: request.headers.get("x-forwarded-for") || undefined,
          userAgent: request.headers.get("user-agent") || undefined,
        });

        return NextResponse.json({
          success: true,
          data: updated,
          message: "پرداخت رد شد و کاربر می‌تواند مجدداً پرداخت را ثبت کند",
        });
      }

      case "flag_order": {
        const flagReason = sanitizeString(body.flagReason, 500);
        const newFlagged = !order.flagged;

        if (newFlagged && !flagReason) {
          return NextResponse.json(
            { success: false, error: { code: "VALIDATION_ERROR", message: "دلیل علامت‌گذاری الزامی است" } },
            { status: 400 }
          );
        }

        const history = appendVerificationHistory(order.verificationHistory, {
          action: newFlagged ? "flagged" : "unflagged",
          by: auth.user.username,
          at: now,
          note: flagReason || undefined,
        });

        const updated = await prisma.order.update({
          where: { id: orderId },
          data: {
            flagged: newFlagged,
            flagReason: newFlagged ? flagReason : null,
            verificationHistory: history,
          },
          include: {
            user: { select: { username: true, phone: true } },
            items: { select: { productName: true, price: true, quantity: true } },
          },
        });

        await logAdminAction({
          ...adminInfo,
          action: newFlagged ? "flag_order" : "unflag_order",
          targetType: "order",
          targetId: orderId,
          targetRef: orderId.slice(0, 8),
          after: { flagged: newFlagged, flagReason },
        });

        return NextResponse.json({
          success: true,
          data: updated,
          message: newFlagged ? "سفارش به عنوان مشکوک علامت‌گذاری شد" : "علامت مشکوک برداشته شد",
        });
      }

      case "manual_deliver_license": {
        if (order.status !== "payment_confirmed" && order.status !== "license_out_of_stock") {
          return NextResponse.json(
            { success: false, error: { code: "INVALID_STATUS", message: `Cannot deliver license from status: ${order.status}` } },
            { status: 400 }
          );
        }

        const itemIndex = typeof body.itemIndex === "number" ? body.itemIndex : parseInt(body.itemIndex, 10);
        const licenseKey = sanitizeString(body.licenseKey, 200);

        if (isNaN(itemIndex) || !licenseKey) {
          return NextResponse.json(
            { success: false, error: { code: "VALIDATION_ERROR", message: "itemIndex و licenseKey الزامی هستند" } },
            { status: 400 }
          );
        }

        const result = await manualDeliverLicense(orderId, itemIndex, licenseKey, adminInfo);

        if (!result.success) {
          return NextResponse.json(
            { success: false, error: { code: "DELIVERY_ERROR", message: result.message } },
            { status: 400 }
          );
        }

        // Check if all items now have licenses
        const updatedOrder = await prisma.order.findUnique({
          where: { id: orderId },
          include: { items: true, licenses: { select: { id: true } } },
        });

        if (updatedOrder) {
          const allDelivered = updatedOrder.licenses.length >= updatedOrder.items.length;
          if (allDelivered && updatedOrder.status === "license_out_of_stock") {
            await prisma.order.update({
              where: { id: orderId },
              data: { status: "completed" },
            });
          }
        }

        const finalOrder = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            items: { select: { productName: true, price: true, quantity: true, billingCycle: true } },
            licenses: { select: { id: true, key: true, status: true, productName: true, expiresAt: true } },
            user: { select: { username: true, phone: true } },
          },
        });

        return NextResponse.json({
          success: true,
          data: finalOrder,
          message: "لایسنس با موفقیت تحویل داده شد",
        });
      }

      case "cancel_order": {
        if (order.status === "completed" || order.status === "refunded") {
          return NextResponse.json(
            { success: false, error: { code: "INVALID_STATUS", message: "Cannot cancel a completed or refunded order" } },
            { status: 400 }
          );
        }

        const cancelReason = sanitizeString(body.cancelReason, 500) || "Cancelled by admin";

        // If licenses were delivered, mark them as revoked
        if (order.licenses && order.licenses.length > 0) {
          await prisma.license.updateMany({
            where: { orderId },
            data: { status: "revoked" },
          });
        }

        // Release any reserved inventory
        await prisma.licenseInventory.updateMany({
          where: { orderId, status: "reserved" },
          data: { status: "available", orderId: null, assignedAt: null },
        });

        const history = appendVerificationHistory(order.verificationHistory, {
          action: "cancelled",
          by: auth.user.username,
          at: now,
          note: cancelReason,
        });

        const updated = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "cancelled",
            rejectionReason: cancelReason,
            verificationHistory: history,
          },
          include: {
            user: { select: { username: true, phone: true } },
            items: { select: { productName: true, price: true, quantity: true } },
          },
        });

        await logAdminAction({
          ...adminInfo,
          action: "cancel_order",
          targetType: "order",
          targetId: orderId,
          targetRef: orderId.slice(0, 8),
          before: { status: order.status },
          after: { status: "cancelled", reason: cancelReason },
        });

        return NextResponse.json({
          success: true,
          data: updated,
          message: "سفارش لغو شد",
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: { code: "INVALID_ACTION", message: `Unknown action: ${action}` } },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error("[POST /api/admin/orders/actions]", err);
    return NextResponse.json(
      { success: false, error: { code: "ACTION_ERROR", message: "Action failed" } },
      { status: 500 }
    );
  }
}
