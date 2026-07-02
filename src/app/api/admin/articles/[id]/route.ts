import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeString, sanitizeRichText } from "@/lib/auth-utils";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Article not found" } }, { status: 404 });
    return NextResponse.json({ success: true, data: article });
  } catch {
    return NextResponse.json({ success: false, error: { code: "ARTICLE_ERROR", message: "Failed to load article" } }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};

    // FA fields
    if (body.title !== undefined) data.title = sanitizeString(body.title, 200);
    if (body.titleEn !== undefined) data.titleEn = sanitizeString(body.titleEn, 200) || null;
    if (body.slug !== undefined) data.slug = sanitizeString(body.slug, 200);
    if (body.slugEn !== undefined) data.slugEn = sanitizeString(body.slugEn, 200) || null;
    if (body.excerpt !== undefined) data.excerpt = sanitizeString(body.excerpt, 500);
    if (body.excerptEn !== undefined) data.excerptEn = sanitizeString(body.excerptEn, 500) || null;
    if (body.content !== undefined) data.content = sanitizeRichText(body.content, 50000);
    if (body.contentEn !== undefined) data.contentEn = sanitizeRichText(body.contentEn, 50000) || null;
    if (body.coverImage !== undefined) data.coverImage = sanitizeString(body.coverImage, 500) || null;
    if (body.authorName !== undefined) data.authorName = sanitizeString(body.authorName, 100);
    if (body.category !== undefined) data.category = sanitizeString(body.category, 100) || "General";
    if (body.categoryEn !== undefined) data.categoryEn = sanitizeString(body.categoryEn, 100) || null;
    if (body.status !== undefined) data.status = ["draft", "published", "archived"].includes(body.status) ? body.status : "draft";
    if (body.metaTitle !== undefined) data.metaTitle = sanitizeString(body.metaTitle, 200) || null;
    if (body.metaTitleEn !== undefined) data.metaTitleEn = sanitizeString(body.metaTitleEn, 200) || null;
    if (body.metaDescription !== undefined) data.metaDescription = sanitizeString(body.metaDescription, 500) || null;
    if (body.metaDescriptionEn !== undefined) data.metaDescriptionEn = sanitizeString(body.metaDescriptionEn, 500) || null;

    if (body.tags !== undefined) data.tags = Array.isArray(body.tags) ? JSON.stringify(body.tags) : sanitizeString(body.tags, 1000) || "[]";
    if (body.tagsEn !== undefined) data.tagsEn = Array.isArray(body.tagsEn) ? JSON.stringify(body.tagsEn) : sanitizeString(body.tagsEn, 1000) || "[]";
    if (body.readingTime !== undefined) data.readingTime = parseInt(body.readingTime) || 0;
    if (body.status === "published") data.publishedAt = new Date();
    const article = await prisma.article.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: article });
  } catch {
    return NextResponse.json({ success: false, error: { code: "UPDATE_ARTICLE_ERROR", message: "Failed to update article" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ success: true, data: { message: "Article deleted" } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "DELETE_ARTICLE_ERROR", message: "Failed to delete article" } }, { status: 500 });
  }
}
