import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeString } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const cards = await prisma.bankCard.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, data: cards });
  } catch {
    return NextResponse.json({ success: false, error: { code: "BANK_CARDS_ERROR", message: "Failed to load bank cards" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const cardNumber = sanitizeString(body.cardNumber, 30);
    const shebaNumber = sanitizeString(body.shebaNumber, 30);
    const bankName = sanitizeString(body.bankName, 100);
    const accountHolder = sanitizeString(body.accountHolder, 200);
    if (!cardNumber || !shebaNumber || !bankName || !accountHolder) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "All fields are required" } }, { status: 400 });
    }
    // Basic card number validation (16 digits)
    if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Card number must be 16 digits" } }, { status: 400 });
    }
    const card = await prisma.bankCard.create({ data: { cardNumber, shebaNumber, bankName, accountHolder, isActive: true } });
    return NextResponse.json({ success: true, data: card });
  } catch {
    return NextResponse.json({ success: false, error: { code: "CREATE_BANK_CARD_ERROR", message: "Failed to create bank card" } }, { status: 500 });
  }
}
