import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeString } from "@/lib/auth-utils";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const ticket = await prisma.ticket.findUnique({ where: { id }, include: { user: { select: { username: true, phone: true } }, messages: { orderBy: { createdAt: "asc" } } } });
    if (!ticket) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Ticket not found" } }, { status: 404 });
    return NextResponse.json({ success: true, data: ticket });
  } catch {
    return NextResponse.json({ success: false, error: { code: "TICKET_ERROR", message: "Failed to load ticket" } }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const body = await request.json();
    const status = sanitizeString(body.status, 50);
    const reply = sanitizeString(body.reply, 5000);
    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    const ticket = await prisma.ticket.update({ where: { id }, data });
    if (reply) {
      await prisma.ticketMessage.create({ data: { ticketId: id, userId: auth.user.id, text: reply } });
    }
    return NextResponse.json({ success: true, data: ticket });
  } catch {
    return NextResponse.json({ success: false, error: { code: "UPDATE_TICKET_ERROR", message: "Failed to update ticket" } }, { status: 500 });
  }
}
