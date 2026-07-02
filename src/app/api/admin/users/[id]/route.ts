import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAdmin, sanitizeString, sanitizePhone } from "@/lib/auth-utils";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, username: true, phone: true, role: true, status: true, walletBalance: true, createdAt: true, updatedAt: true } });
    if (!user) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, { status: 404 });
    return NextResponse.json({ success: true, data: user });
  } catch {
    return NextResponse.json({ success: false, error: { code: "USER_ERROR", message: "Failed to load user" } }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (body.username !== undefined) data.username = sanitizeString(body.username, 100);
    if (body.phone !== undefined) data.phone = sanitizePhone(body.phone);
    if (body.role !== undefined) data.role = body.role === "admin" ? "admin" : "user";
    if (body.status !== undefined) data.status = ["active", "suspended", "banned"].includes(body.status) ? body.status : "active";
    if (body.walletBalance !== undefined) data.walletBalance = parseFloat(body.walletBalance) || 0;
    if (body.password !== undefined) {
      if (typeof body.password !== "string" || body.password.length < 6) {
        return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Password must be at least 6 characters" } }, { status: 400 });
      }
      data.passwordHash = await bcrypt.hash(body.password, 12);
    }
    const user = await prisma.user.update({ where: { id }, data, select: { id: true, username: true, phone: true, role: true, status: true, walletBalance: true, createdAt: true, updatedAt: true } });
    return NextResponse.json({ success: true, data: user });
  } catch {
    return NextResponse.json({ success: false, error: { code: "UPDATE_USER_ERROR", message: "Failed to update user" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    // Prevent self-deletion
    if (id === auth.user.id) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Cannot delete your own account" } }, { status: 403 });
    }
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true, data: { message: "User deleted" } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "DELETE_USER_ERROR", message: "Failed to delete user" } }, { status: 500 });
  }
}
