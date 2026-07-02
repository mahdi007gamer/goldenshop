import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, parsePositiveInt } from "@/lib/auth-utils";

// GET /api/notifications — List current user's notifications
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const take = parsePositiveInt(searchParams.get("take"), 20);
    const skip = parsePositiveInt(searchParams.get("skip"), 0);

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: auth.user.id },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.notification.count({ where: { userId: auth.user.id } }),
      prisma.notification.count({ where: { userId: auth.user.id, read: false } }),
    ]);

    return NextResponse.json({ success: true, data: { notifications, total, unreadCount } });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "NOTIFICATIONS_ERROR", message: "Failed to load notifications" } },
      { status: 500 }
    );
  }
}

// PUT /api/notifications — Mark notifications as read
export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const { ids, markAll } = body;

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: auth.user.id, read: false },
        data: { read: true },
      });
    } else if (Array.isArray(ids) && ids.length > 0) {
      await prisma.notification.updateMany({
        where: { id: { in: ids }, userId: auth.user.id },
        data: { read: true },
      });
    }

    return NextResponse.json({ success: true, data: { message: "Notifications marked as read" } });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_ERROR", message: "Failed to update notifications" } },
      { status: 500 }
    );
  }
}
