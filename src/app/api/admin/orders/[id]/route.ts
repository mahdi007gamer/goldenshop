import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeString } from "@/lib/auth-utils";
import { withSecurityHeaders } from "@/lib/security-headers";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id }, include: { user: { select: { username: true, phone: true } }, items: true, licenses: { select: { key: true, status: true, productName: true } } } });
    if (!order) return withSecurityHeaders(NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Order not found" } }, { status: 404 }));
    return withSecurityHeaders(NextResponse.json({ success: true, data: order }));
  } catch {
    return withSecurityHeaders(NextResponse.json({ success: false, error: { code: "ORDER_ERROR", message: "Failed to load order" } }, { status: 500 }));
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const body = await request.json();
    const adminInternalNote = sanitizeString(body.adminInternalNote, 1000);
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return withSecurityHeaders(
        NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Order not found" } },
          { status: 404 }
        )
      );
    }
    const updated = await prisma.order.update({ where: { id }, data: { adminInternalNote } });
    return withSecurityHeaders(NextResponse.json({ success: true, data: updated }));
  } catch {
    return withSecurityHeaders(
      NextResponse.json(
        { success: false, error: { code: "UPDATE_ERROR", message: "Failed to update order" } },
        { status: 500 }
      )
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const body = await request.json();
    const status = sanitizeString(body.status, 50);
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return withSecurityHeaders(NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Order not found" } }, { status: 404 }));
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (status === "refunded" && order.status !== "refunded") {
      await prisma.user.update({ where: { id: order.userId }, data: { walletBalance: { increment: order.total } } });
      await prisma.walletTransaction.create({ data: { userId: order.userId, type: "refund", amount: order.total, balance: 0, description: "Refund for order " + id, status: "completed" } });
    }
    const updated = await prisma.order.update({ where: { id }, data: updateData, include: { user: { select: { username: true } }, items: { select: { productName: true } } } });
    return withSecurityHeaders(NextResponse.json({ success: true, data: updated }));
  } catch {
    return withSecurityHeaders(NextResponse.json({ success: false, error: { code: "UPDATE_ORDER_ERROR", message: "Failed to update order" } }, { status: 500 }));
  }
}
