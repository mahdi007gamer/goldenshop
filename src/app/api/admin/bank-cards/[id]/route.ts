import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};
    for (const key of ["cardNumber", "shebaNumber", "bankName", "accountHolder", "isActive"]) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    const card = await prisma.bankCard.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: card });
  } catch {
    return NextResponse.json({ success: false, error: { code: "UPDATE_BANK_CARD_ERROR", message: "Failed to update bank card" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.bankCard.delete({ where: { id } });
    return NextResponse.json({ success: true, data: { message: "Bank card deleted" } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "DELETE_BANK_CARD_ERROR", message: "Failed to delete bank card" } }, { status: 500 });
  }
}
