import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

// GET /api/products/[id]/reviews/can-review — Check if current user can review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) {
    return NextResponse.json({ success: true, data: { canReview: false, reason: "UNAUTHORIZED" } });
  }

  const { id: productId } = await params;

  try {
    // Check product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Product not found" } },
        { status: 404 }
      );
    }

    // Check if already reviewed
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId: auth.user.id, productId } },
    });
    if (existing) {
      return NextResponse.json({ success: true, data: { canReview: false, reason: "ALREADY_REVIEWED" } });
    }

    // Check purchase
    const [orderItem, license] = await Promise.all([
      prisma.orderItem.findFirst({
        where: {
          productId,
          order: { userId: auth.user.id, status: { in: ["paid", "active"] } },
        },
      }),
      prisma.license.findFirst({
        where: { userId: auth.user.id, productId },
      }),
    ]);

    if (!orderItem && !license) {
      return NextResponse.json({ success: true, data: { canReview: false, reason: "NOT_PURCHASED" } });
    }

    return NextResponse.json({ success: true, data: { canReview: true } });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "ERROR", message: "Failed to check review eligibility" } },
      { status: 500 }
    );
  }
}
