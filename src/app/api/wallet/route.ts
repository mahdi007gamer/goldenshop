import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, parsePositiveInt } from "@/lib/auth-utils";

// GET /api/wallet — Get wallet balance and transactions
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const take = parsePositiveInt(searchParams.get("take"), 20);
    const skip = parsePositiveInt(searchParams.get("skip"), 0);

    const [user, transactions, total] = await Promise.all([
      prisma.user.findUnique({ where: { id: auth.user.id }, select: { walletBalance: true } }),
      prisma.walletTransaction.findMany({
        where: { userId: auth.user.id },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.walletTransaction.count({ where: { userId: auth.user.id } }),
    ]);

    return NextResponse.json({
      success: true,
      data: { balance: user?.walletBalance || 0, transactions, total },
    });
  } catch {
    return NextResponse.json({ success: false, error: { code: "WALLET_ERROR", message: "Failed to load wallet" } }, { status: 500 });
  }
}
