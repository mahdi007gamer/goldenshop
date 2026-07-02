import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const bankCards = await prisma.bankCard.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: bankCards });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "BANK_CARDS_ERROR", message: "Failed to load bank cards" } },
      { status: 500 }
    );
  }
}
