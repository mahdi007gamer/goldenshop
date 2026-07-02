import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeString, sanitizeRichText, parsePositiveInt } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const status = sanitizeString(searchParams.get("status"));
    const search = sanitizeString(searchParams.get("search"));
    const take = parsePositiveInt(searchParams.get("take"), 50);
    const skip = parsePositiveInt(searchParams.get("skip"), 0);
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) where.OR = [{ title: { contains: search } }, { slug: { contains: search } }];
    const [articles, total] = await Promise.all([prisma.article.findMany({ where, orderBy: { createdAt: "desc" }, take, skip }), prisma.article.count({ where })]);
    return NextResponse.json({ success: true, data: { articles, total } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "ARTICLES_ERROR", message: "Failed to load articles" } }, { status: 500 });
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
    const tags = Array.isArray(body.tags) ? JSON.stringify(body.tags) : "[]";
    const article = await prisma.article.create({
      data: {
        title,
        titleEn: sanitizeString(body.titleEn, 200) || null,
        slug,
        slugEn: sanitizeString(body.slugEn, 200) || null,
        excerpt: sanitizeString(body.excerpt, 500),
        excerptEn: sanitizeString(body.excerptEn, 500) || null,
        content: sanitizeRichText(body.content, 50000),
        contentEn: sanitizeRichText(body.contentEn, 50000) || null,
        coverImage: sanitizeString(body.coverImage, 500) || null,
        authorId: auth.user.id,
        authorName: auth.user.username,
        category: sanitizeString(body.category, 100) || "General",
        categoryEn: sanitizeString(body.categoryEn, 100) || null,
        tags,
        tagsEn: Array.isArray(body.tagsEn) ? JSON.stringify(body.tagsEn) : "[]",
        status: ["draft", "published", "archived"].includes(body.status) ? body.status : "draft",
        readingTime: parseInt(body.readingTime) || 0,
        views: 0,
        metaTitle: sanitizeString(body.metaTitle, 200) || null,
        metaTitleEn: sanitizeString(body.metaTitleEn, 200) || null,
        metaDescription: sanitizeString(body.metaDescription, 500) || null,
        metaDescriptionEn: sanitizeString(body.metaDescriptionEn, 500) || null,
        publishedAt: body.status === "published" ? new Date() : null,
      },
    });
    return NextResponse.json({ success: true, data: article });
  } catch {
    return NextResponse.json({ success: false, error: { code: "CREATE_ARTICLE_ERROR", message: "Failed to create article" } }, { status: 500 });
  }
}
