import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await params;
    const body = await request.json();
    const { title, content, videoUrl, imageUrl, audioUrl, fileUrl, fileName, filePassword, guideContent, duration, order, resources } = body;
    if (!title) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Title is required" } }, { status: 400 });
    const lastLesson = await prisma.lesson.findFirst({ where: { courseId }, orderBy: { order: "desc" } });
    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        title,
        content: content || "",
        videoUrl: videoUrl || null,
        imageUrl: imageUrl || null,
        audioUrl: audioUrl || null,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        filePassword: filePassword || null,
        guideContent: guideContent || "{}",
        duration: duration || 0,
        order: order ?? (lastLesson?.order ?? 0) + 1,
        resources: Array.isArray(resources) ? JSON.stringify(resources) : resources || "[]",
      },
    });
    return NextResponse.json({ success: true, data: lesson });
  } catch (err) {
    console.error("Create lesson error:", err);
    return NextResponse.json({ success: false, error: { code: "CREATE_LESSON_ERROR", message: "Failed to create lesson" } }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: _courseId } = await params;
    const body = await request.json();
    const { lessonId, title, content, videoUrl, imageUrl, audioUrl, fileUrl, fileName, filePassword, guideContent, duration, order, resources } = body;
    if (!lessonId) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "lessonId is required" } }, { status: 400 });
    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;
    if (videoUrl !== undefined) data.videoUrl = videoUrl;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (audioUrl !== undefined) data.audioUrl = audioUrl;
    if (fileUrl !== undefined) data.fileUrl = fileUrl;
    if (fileName !== undefined) data.fileName = fileName;
    if (filePassword !== undefined) data.filePassword = filePassword;
    if (guideContent !== undefined) data.guideContent = guideContent;
    if (duration !== undefined) data.duration = duration;
    if (order !== undefined) data.order = order;
    if (resources !== undefined) data.resources = Array.isArray(resources) ? JSON.stringify(resources) : resources;
    const lesson = await prisma.lesson.update({ where: { id: lessonId }, data });
    return NextResponse.json({ success: true, data: lesson });
  } catch (err) {
    console.error("Update lesson error:", err);
    return NextResponse.json({ success: false, error: { code: "UPDATE_LESSON_ERROR", message: "Failed to update lesson" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");
    if (!lessonId) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "lessonId is required" } }, { status: 400 });
    await prisma.lesson.delete({ where: { id: lessonId } });
    return NextResponse.json({ success: true, data: { message: "Lesson deleted" } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "DELETE_LESSON_ERROR", message: "Failed to delete lesson" } }, { status: 500 });
  }
}