import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeString } from "@/lib/auth-utils";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (body.status) data.status = sanitizeString(body.status, 50);
    if (body.expiresAt) data.expiresAt = new Date(body.expiresAt);
    if (body.hwid !== undefined) data.hwid = sanitizeString(body.hwid, 500);
    const license = await prisma.license.update({ where: { id }, data, include: { user: { select: { username: true } } } });
    return NextResponse.json({ success: true, data: license });
  } catch {
    return NextResponse.json({ success: false, error: { code: "UPDATE_LICENSE_ERROR", message: "Failed to update license" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    await prisma.license.update({ where: { id }, data: { status: "revoked" } });
    return NextResponse.json({ success: true, data: { message: "License revoked" } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "REVOKE_LICENSE_ERROR", message: "Failed to revoke license" } }, { status: 500 });
  }
}
