import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, sanitizeString, parsePositiveInt } from "@/lib/auth-utils";

// GET /api/products/[id]/reviews — List reviews for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params;
  try {
    const { searchParams } = new URL(request.url);
    const take = parsePositiveInt(searchParams.get("take"), 20);
    const skip = parsePositiveInt(searchParams.get("skip"), 0);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        orderBy: { createdAt: "desc" },
        take,
        skip,
        include: {
          user: { select: { id: true, username: true, avatar: true } },
        },
      }),
      prisma.review.count({ where: { productId } }),
    ]);

    return NextResponse.json({ success: true, data: { reviews, total } });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "REVIEWS_ERROR", message: "Failed to load reviews" } },
      { status: 500 }
    );
  }
}

// POST /api/products/[id]/reviews — Submit a review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id: productId } = await params;

  try {
    const body = await request.json();
    const rating = Number(body.rating);
    const comment = sanitizeString(body.comment, 1000) || null;

    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Rating must be an integer between 1 and 5" } },
        { status: 400 }
      );
    }

    // Check product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Product not found" } },
        { status: 404 }
      );
    }

    // Check user has purchased this product (via OrderItem or License)
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
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "You must purchase this product before reviewing" } },
        { status: 403 }
      );
    }

    // Check if already reviewed
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId: auth.user.id, productId } },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: "ALREADY_REVIEWED", message: "You have already reviewed this product" } },
        { status: 409 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: { rating, comment, userId: auth.user.id, productId },
      include: { user: { select: { id: true, username: true, avatar: true } } },
    });

    // Update product aggregate rating
    const agg = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round((agg._avg.rating || 0) * 10) / 10,
        reviewsCount: agg._count.rating,
      },
    });

    return NextResponse.json({ success: true, data: review });
  } catch (err) {
    console.error("Create review error:", err);
    return NextResponse.json(
      { success: false, error: { code: "REVIEW_ERROR", message: "Failed to create review" } },
      { status: 500 }
    );
  }
}
