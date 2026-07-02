import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, sanitizeString } from "@/lib/auth-utils";

// GET /api/orders/[id] — Get single order (user's own)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    const order = await prisma.order.findFirst({
      where: { id, userId: auth.user.id },
      include: {
        items: {
          select: {
            id: true,
            productName: true,
            price: true,
            quantity: true,
            billingCycle: true,
          },
        },
        licenseInventory: {
          select: {
            id: true,
            licenseKey: true,
            status: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "ORDER_ERROR", message: "Failed to load order" } },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/[id] — Submit payment, cancel, or update note
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    const body = await request.json();
    const action = sanitizeString(body.action, 50);

    // Fetch the order
    const order = await prisma.order.findFirst({
      where: { id, userId: auth.user.id },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    switch (action) {
      case "submit_payment": {
        // Validate order is editable
        if (order.status !== "pending" && order.status !== "pending_payment" && order.status !== "payment_rejected") {
          return NextResponse.json(
            { success: false, error: { code: "INVALID_STATUS", message: "Order is not editable" } },
            { status: 400 }
          );
        }

        // Validate last4Digits
        const last4Digits = sanitizeString(body.last4Digits, 4);
        if (!last4Digits || !/^\d{4}$/.test(last4Digits)) {
          return NextResponse.json(
            { success: false, error: { code: "VALIDATION", message: "Last 4 digits must be exactly 4 numbers" } },
            { status: 400 }
          );
        }

        // Check no other payment_submitted order exists
        const existingPending = await prisma.order.findFirst({
          where: {
            userId: auth.user.id,
            status: "payment_submitted",
            NOT: { id },
          },
        });
        if (existingPending) {
          return NextResponse.json(
            { success: false, error: { code: "DUPLICATE", message: "شما یک پرداخت در انتظار تایید دارید" } },
            { status: 409 }
          );
        }

        // Validate bank card
        const bankCardId = sanitizeString(body.bankCardId, 50);
        if (!bankCardId) {
          return NextResponse.json(
            { success: false, error: { code: "VALIDATION", message: "Bank card is required" } },
            { status: 400 }
          );
        }

        const bankCard = await prisma.bankCard.findUnique({
          where: { id: bankCardId },
        });
        if (!bankCard || !bankCard.isActive) {
          return NextResponse.json(
            { success: false, error: { code: "INVALID_CARD", message: "Invalid or inactive bank card" } },
            { status: 400 }
          );
        }

        // Update order
        const updated = await prisma.order.update({
          where: { id },
          data: {
            status: "payment_submitted",
            bankCardId,
            last4Digits,
            transactionTime: body.transactionTime ? new Date(body.transactionTime) : new Date(),
            receiptNote: sanitizeString(body.receiptNote, 500) || null,
          },
          include: {
            items: true,
            licenseInventory: { select: { id: true, licenseKey: true, status: true } },
          },
        });

        return NextResponse.json({ success: true, data: updated });
      }

      case "cancel": {
        // Only pending orders can be cancelled
        if (order.status !== "pending" && order.status !== "pending_payment") {
          return NextResponse.json(
            { success: false, error: { code: "INVALID_STATUS", message: "Only pending orders can be cancelled" } },
            { status: 400 }
          );
        }

        const updated = await prisma.order.update({
          where: { id },
          data: { status: "cancelled" },
          include: {
            items: true,
            licenseInventory: { select: { id: true, licenseKey: true, status: true } },
          },
        });

        // Refund wallet if paid via wallet
        if (order.paymentMethod === "wallet") {
          await prisma.user.update({
            where: { id: auth.user.id },
            data: { walletBalance: { increment: order.total } },
          });
          await prisma.walletTransaction.create({
            data: {
              userId: auth.user.id,
              type: "refund",
              amount: order.total,
              balance: 0,
              description: `Refund for cancelled order ${order.id}`,
              status: "completed",
            },
          });
        }

        return NextResponse.json({ success: true, data: updated });
      }

      case "update_note": {
        const userNote = sanitizeString(body.userNote, 1000);
        const updated = await prisma.order.update({
          where: { id },
          data: { userNote },
          include: {
            items: true,
            licenseInventory: { select: { id: true, licenseKey: true, status: true } },
          },
        });

        return NextResponse.json({ success: true, data: updated });
      }

      default:
        return NextResponse.json(
          { success: false, error: { code: "INVALID_ACTION", message: "Invalid action" } },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error("PATCH /api/orders/[id] error:", err);
    return NextResponse.json(
      { success: false, error: { code: "ORDER_ERROR", message: "Failed to update order" } },
      { status: 500 }
    );
  }
}
