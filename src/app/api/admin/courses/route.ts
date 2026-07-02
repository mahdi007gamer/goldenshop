import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeString, sanitizeRichText, parsePositiveInt } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const status = sanitizeString(searchParams.get("status"));
    const game = sanitizeString(searchParams.get("game"));
    const productId = sanitizeString(searchParams.get("productId"));
    const take = parsePositiveInt(searchParams.get("take"), 50);
    const skip = parsePositiveInt(searchParams.get("skip"), 0);
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (game) where.game = game;
    if (productId) where.productId = productId;
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          lessons: { select: { id: true, title: true, order: true }, orderBy: { order: "asc" } },
          product: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.course.count({ where }),
    ]);
    return NextResponse.json({ success: true, data: { courses, total } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "COURSES_ERROR", message: "Failed to load courses" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const title = sanitizeString(body.title, 200);
    if (!title) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Title is required" } }, { status: 400 });
    const slug = sanitizeString(body.slug, 200) || title.toLowerCase().replace(/\s+/g, "-");
    const course = await prisma.course.create({
      data: {
        title,
        titleEn: sanitizeString(body.titleEn, 200) || null,
        slug,
        description: sanitizeRichText(body.description, 10000),
        descriptionEn: sanitizeRichText(body.descriptionEn, 10000) || null,
        fullDescription: sanitizeRichText(body.fullDescription, 50000) || null,
        fullDescriptionEn: sanitizeRichText(body.fullDescriptionEn, 50000) || null,
        prerequisites: sanitizeRichText(body.prerequisites, 50000) || null,
        prerequisitesEn: sanitizeRichText(body.prerequisitesEn, 50000) || null,
        thumbnail: sanitizeString(body.thumbnail, 500) || null,
        category: sanitizeString(body.category, 100) || "General",
        game: sanitizeString(body.game, 100) || "General",
        status: ["draft", "published", "archived"].includes(body.status) ? body.status : "draft",
        productId: sanitizeString(body.productId, 100) || null,
      },
    });
    return NextResponse.json({ success: true, data: course });
  } catch (err) {
    console.error("Create course error:", err);
    return NextResponse.json({ success: false, error: { code: "CREATE_COURSE_ERROR", message: "Failed to create course" } }, { status: 500 });
  }
}
