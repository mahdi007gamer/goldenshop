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
        { description: { contains: search } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          _count: { select: { lessons: true } },
        },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.course.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: { courses, total } });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "COURSES_ERROR", message: "Failed to load courses" } },
      { status: 500 }
    );
  }
}
