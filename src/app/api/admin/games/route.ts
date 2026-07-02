import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeString, parsePositiveInt } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const status = sanitizeString(searchParams.get("status"));
    const search = sanitizeString(searchParams.get("search"));
    const take = parsePositiveInt(searchParams.get("take"), 100);
    const skip = parsePositiveInt(searchParams.get("skip"), 0);
    const where: Record<string, unknown> = {};
    if (status === "active") where.isActive = true;
    else if (status === "inactive") where.isActive = false;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameEn: { contains: search } },
        { slug: { contains: search } },
      ];
    }
    const [games, total] = await Promise.all([
      prisma.game.findMany({ where, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], take, skip }),
      prisma.game.count({ where }),
    ]);
    return NextResponse.json({ success: true, data: { games, total } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "GAMES_ERROR", message: "Failed to load games" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const name = sanitizeString(body.name, 100);
    if (!name) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Name is required" } }, { status: 400 });
    const slug = sanitizeString(body.slug, 100) || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const accentColor = sanitizeString(body.accentColor, 20) || "#C9963A";
    const sortOrder = parseInt(body.sortOrder) || 0;
    const game = await prisma.game.create({
      data: {
        name,
        nameEn: sanitizeString(body.nameEn, 100) || null,
        slug,
        slugEn: sanitizeString(body.slugEn, 100) || null,
        description: sanitizeString(body.description, 1000) || null,
        descriptionEn: sanitizeString(body.descriptionEn, 1000) || null,
        iconUrl: sanitizeString(body.iconUrl, 500) || null,
        bannerUrl: sanitizeString(body.bannerUrl, 500) || null,
        accentColor,
        gradientFrom: sanitizeString(body.gradientFrom, 50) || null,
        gradientTo: sanitizeString(body.gradientTo, 50) || null,
        sortOrder,
        isActive: body.isActive !== false,
        metaTitle: sanitizeString(body.metaTitle, 200) || null,
        metaTitleEn: sanitizeString(body.metaTitleEn, 200) || null,
        metaDescription: sanitizeString(body.metaDescription, 500) || null,
        metaDescriptionEn: sanitizeString(body.metaDescriptionEn, 500) || null,
      },
    });
    return NextResponse.json({ success: true, data: game, message: `Game "${name}" created` });
  } catch (err: unknown) {
    const message = err instanceof Error && err.message.includes("Unique") ? "A game with this slug already exists" : "Failed to create game";
    return NextResponse.json({ success: false, error: { code: "CREATE_GAME_ERROR", message } }, { status: 500 });
  }
}
