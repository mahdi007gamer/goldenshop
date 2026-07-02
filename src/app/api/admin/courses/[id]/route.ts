import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: { orderBy: { order: "asc" } },
        product: { select: { id: true, name: true } },
      },
    });
    if (!course) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Course not found" } }, { status: 404 });
    return NextResponse.json({ success: true, data: course });
  } catch {
    return NextResponse.json({ success: false, error: { code: "COURSE_ERROR", message: "Failed to load course" } }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};
    for (const key of [
      "title", "titleEn", "slug", "description", "descriptionEn",
      "fullDescription", "fullDescriptionEn", "prerequisites", "prerequisitesEn",
      "thumbnail", "category", "game", "status", "productId"
    ]) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    const course = await prisma.course.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: course });
  } catch (err) {
    console.error("Update course error:", err);
    return NextResponse.json({ success: false, error: { code: "UPDATE_COURSE_ERROR", message: "Failed to update course" } }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ success: true, data: { message: "Course deleted" } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "DELETE_COURSE_ERROR", message: "Failed to delete course" } }, { status: 500 });
  }
}
