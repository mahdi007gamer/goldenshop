import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!course || course.status !== "published") {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Course not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: course });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "COURSE_ERROR", message: "Failed to load course" } },
      { status: 500 }
    );
  }
}
