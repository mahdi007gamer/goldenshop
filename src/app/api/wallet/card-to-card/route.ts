import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, sanitizeString, sanitizePhone } from "@/lib/auth-utils";

// POST /api/wallet/card-to-card — Submit a card-to-card payment request
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const amount = body.amount ? parseFloat(body.amount) : NaN;
    const cardNumber = sanitizePhone(body.cardNumber);
    const reference = sanitizeString(body.reference, 100);

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Valid amount is required" } },
        { status: 400 }
      );
    }
    if (!cardNumber || cardNumber.length < 10) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Valid card number is required" } },
        { status: 400 }
      );
    }
    if (!reference) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Reference number is required" } },
        { status: 400 }
      );
    }

    const payment = await prisma.cardToCardPayment.create({
      data: {
        userId: auth.user.id,
        amount,
        cardNumber,
        reference,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, data: payment });
  } catch (err) {
    console.error("Card-to-card payment error:", err);
    return NextResponse.json(
      { success: false, error: { code: "PAYMENT_ERROR", message: "Failed to create payment" } },
      { status: 500 }
    );
  }
}
