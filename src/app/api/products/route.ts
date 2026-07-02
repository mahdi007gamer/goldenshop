import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const game = searchParams.get("game");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") ?? "popular";
    const take = parseInt(searchParams.get("take") || "100", 10);

    if (isNaN(take) || take < 1 || take > 500) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "take param must be 1-500" } },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { status: "active" };

    if (game && game !== "all") where.game = game;
    if (category && category !== "all") where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    let orderBy: Record<string, string> = {};
    switch (sort) {
      case "price-low":
        orderBy = { price: "asc" };
        break;
      case "price-high":
        orderBy = { price: "desc" };
        break;
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "popular":
      default:
        orderBy = { isPopular: "desc" };
        break;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      take,
    });

    const parseJson = (val: string) => {
      try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; }
      catch { return []; }
    };

    const parsed = products.map((p) => ({
      ...p,
      features: parseJson(p.features as string),
      featuresFa: parseJson(p.featuresFa as string),
      featuresEn: parseJson((p as Record<string, unknown>).featuresEn as string),
      galleryImages: parseJson(p.galleryImages as string),
      galleryItems: parseJson(p.galleryItems as string),
      featuresDetail: parseJson(p.featuresDetail as string),
    }));

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch products";
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message } },
      { status: 500 }
    );
  }
}
