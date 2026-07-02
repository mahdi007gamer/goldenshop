import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

/**
 * GET /api/admin/notifications
 * List admin-specific notifications (order events, low stock, etc.)
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const take = Math.min(parseInt(searchParams.get("take") || "20", 10), 50);
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const unreadOnly = searchParams.get("unread") === "true";

    // Get notifications for this admin user
    const where: Record<string, unknown> = { userId: auth.user.id };
    if (unreadOnly) where.read = false;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.notification.count({ where: { userId: auth.user.id } }),
      prisma.notification.count({ where: { userId: auth.user.id, read: false } }),
    ]);

    return NextResponse.json({
      success: true,
      data: { notifications, total, unreadCount },
    });
  } catch (err) {
    console.error("[GET /api/admin/notifications]", err);
    return NextResponse.json(
      { success: false, error: { code: "NOTIFICATIONS_ERROR", message: "Failed to load notifications" } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/notifications
 * Create an admin notification (called internally by order actions).
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { targetAdminId, type, title, message, link } = body;

    // Create notification for specified admin or all admins
    const targetId = targetAdminId || auth.user.id;

    const notification = await prisma.notification.create({
      data: {
        userId: targetId,
        type: type || "system",
        title: title || "Admin Notification",
        message: message || "",
        link: link || null,
      },
    });

    return NextResponse.json({ success: true, data: notification });
  } catch (err) {
    console.error("[POST /api/admin/notifications]", err);
    return NextResponse.json(
      { success: false, error: { code: "NOTIFICATIONS_ERROR", message: "Failed to create notification" } },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/notifications
 * Mark notifications as read.
 */
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
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

    const unreadCount = await prisma.notification.count({
      where: { userId: auth.user.id, read: false },
    });

    return NextResponse.json({ success: true, data: { unreadCount } });
  } catch (err) {
    console.error("[PUT /api/admin/notifications]", err);
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_ERROR", message: "Failed to update notifications" } },
      { status: 500 }
    );
  }
}
