import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeString, parsePositiveInt } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const status = sanitizeString(searchParams.get("status"));
    const take = parsePositiveInt(searchParams.get("take"), 50);
    const skip = parsePositiveInt(searchParams.get("skip"), 0);
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({ where, include: { user: { select: { username: true } }, messages: { orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { createdAt: "desc" }, take, skip }),
      prisma.ticket.count({ where }),
    ]);
    return NextResponse.json({ success: true, data: { tickets, total } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "TICKETS_ERROR", message: "Failed to load tickets" } }, { status: 500 });
  }
}
