import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const take = parseInt(searchParams.get("take") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");

    const where: Record<string, unknown> = { status: "published" };
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
        { excerpt: { contains: search } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        take,
        skip,
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: { articles, total } });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "ARTICLES_ERROR", message: "Failed to load articles" } },
      { status: 500 }
    );
  }
}
