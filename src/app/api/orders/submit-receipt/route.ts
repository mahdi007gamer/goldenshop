import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, sanitizeString } from "@/lib/auth-utils";

/**
 * POST /api/orders/submit-receipt
 * User submits payment receipt for card-to-card payment.
 * Body: { orderId, bankCardId, last4Digits, receiptNote? }
 * Steps:
 *   1. Validate order ownership
 *   2. Validate order status is pending/pending_payment/payment_rejected
 *   3. Validate bank card is active
 *   4. Update order: status = "payment_submitted", paymentStatus = "submitted"
 *   5. Create CardToCardPayment record
 * Requires: auth
 */
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const orderId = sanitizeString(body.orderId, 100);
    const bankCardId = sanitizeString(body.bankCardId, 100);
    const last4Digits = sanitizeString(body.last4Digits, 4);
    const receiptNote = sanitizeString(body.receiptNote, 500);

    if (!orderId || !bankCardId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "orderId and bankCardId are required" } },
        { status: 400 }
      );
    }

    if (!/^\d{4}$/.test(last4Digits)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "last4Digits must be exactly 4 digits" } },
        { status: 400 }
      );
    }

    // Fetch and validate order
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: auth.user.id },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    if (!["pending", "pending_payment", "payment_rejected", "payment_submitted"].includes(order.status)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_STATUS", message: "Order cannot be paid in current status" } },
        { status: 400 }
      );
    }

    // Validate bank card
    const bankCard = await prisma.bankCard.findUnique({ where: { id: bankCardId } });
    if (!bankCard || !bankCard.isActive) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_CARD", message: "Invalid or inactive bank card" } },
        { status: 400 }
      );
    }

    // Check for existing pending payment
    const existingPending = await prisma.order.findFirst({
      where: {
        userId: auth.user.id,
        status: "payment_submitted",
        NOT: { id: orderId },
      },
    });

    if (existingPending) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PENDING_PAYMENT",
            message: "شما یک پرداخت در انتظار تایید دارید. لطفاً منتظر تایید ادمین بمانید.",
          },
        },
        { status: 409 }
      );
    }

    // Update order and create payment record
    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: "payment_submitted",
          paymentStatus: "submitted",
          bankCardId,
          last4Digits,
          receiptNote: receiptNote || null,
          transactionTime: new Date(),
        },
        include: {
          items: true,
          licenseInventory: { select: { id: true, licenseKey: true, status: true } },
        },
      }),
      prisma.cardToCardPayment.create({
        data: {
          userId: auth.user.id,
          amount: order.total,
          cardNumber: bankCard.cardNumber,
          reference: last4Digits,
          status: "pending",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: "Payment receipt submitted successfully",
    });
  } catch (err) {
    console.error("Submit receipt error:", err);
    return NextResponse.json(
      { success: false, error: { code: "SUBMIT_RECEIPT_ERROR", message: "Failed to submit receipt" } },
      { status: 500 }
    );
  }
}
