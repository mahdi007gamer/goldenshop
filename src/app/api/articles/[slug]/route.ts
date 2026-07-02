import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const article = await prisma.article.findUnique({ where: { slug } });

    if (!article || article.status !== "published") {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Article not found" } },
        { status: 404 }
      );
    }

    // Increment views count
    const updated = await prisma.article.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "ARTICLE_ERROR", message: "Failed to load article" } },
      { status: 500 }
    );
  }
}
