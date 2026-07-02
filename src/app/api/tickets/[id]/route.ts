import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, sanitizeString } from "@/lib/auth-utils";

// GET /api/tickets/[id] — Get ticket details (only own tickets)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!ticket) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Ticket not found" } }, { status: 404 });
    // Only own tickets or admin
    if (ticket.userId !== auth.user.id && auth.user.role !== "admin") {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Access denied" } }, { status: 403 });
    }
    return NextResponse.json({ success: true, data: ticket });
  } catch {
    return NextResponse.json({ success: false, error: { code: "TICKET_ERROR", message: "Failed to load ticket" } }, { status: 500 });
  }
}

// POST /api/tickets/[id] — Reply to own ticket
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Ticket not found" } }, { status: 404 });
    if (ticket.userId !== auth.user.id && auth.user.role !== "admin") {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Access denied" } }, { status: 403 });
    }
    const body = await request.json();
    const text = sanitizeString(body.text, 5000);
    if (!text) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Message text is required" } }, { status: 400 });

    const message = await prisma.ticketMessage.create({
      data: { ticketId: id, userId: auth.user.id, text },
    });
    // Reopen if closed
    if (ticket.status === "closed") {
      await prisma.ticket.update({ where: { id }, data: { status: "open" } });
    }
    return NextResponse.json({ success: true, data: message });
  } catch {
    return NextResponse.json({ success: false, error: { code: "REPLY_ERROR", message: "Failed to reply to ticket" } }, { status: 500 });
  }
}
