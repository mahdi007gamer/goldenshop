import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, sanitizeString, parsePositiveInt } from "@/lib/auth-utils";

// GET /api/tickets — List current user's tickets
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const take = parsePositiveInt(searchParams.get("take"), 20);
    const skip = parsePositiveInt(searchParams.get("skip"), 0);
    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where: { userId: auth.user.id },
        include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.ticket.count({ where: { userId: auth.user.id } }),
    ]);
    return NextResponse.json({ success: true, data: { tickets, total } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "TICKETS_ERROR", message: "Failed to load tickets" } }, { status: 500 });
  }
}

// POST /api/tickets — Create a new ticket
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const subject = sanitizeString(body.subject, 200);
    const game = sanitizeString(body.game, 100) || "General";
    const text = sanitizeString(body.text, 5000);

    if (!subject || !text) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Subject and message are required" } }, { status: 400 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        userId: auth.user.id,
        subject,
        game,
        status: "open",
        messages: {
          create: { userId: auth.user.id, text },
        },
      },
      include: { messages: true },
    });

    return NextResponse.json({ success: true, data: ticket });
  } catch {
    return NextResponse.json({ success: false, error: { code: "CREATE_TICKET_ERROR", message: "Failed to create ticket" } }, { status: 500 });
  }
}
