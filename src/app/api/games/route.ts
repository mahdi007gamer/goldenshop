import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Public endpoint that returns the list of active games — derived from
 * distinct game values in the Product table so the shop filter always
 * shows the same games.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const take = Math.min(Math.max(parseInt(searchParams.get("take") || "100", 10), 1), 500);

    // Get distinct games from products
    const products = await prisma.product.findMany({
      where: { status: "active" },
      select: { game: true },
      distinct: ["game"],
      take,
    });

    // Map to game objects with slugs
    const games = products.map((p) => ({
      id: p.game.toLowerCase().replace(/\s+/g, "-"),
      slug: p.game.toLowerCase().replace(/\s+/g, "-"),
      name: p.game,
      nameEn: p.game,
      isActive: true,
      sortOrder: 0,
    }));

    return NextResponse.json({ success: true, data: games });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "GAMES_ERROR", message: "Failed to load games" } },
      { status: 500 }
    );
  }
}
