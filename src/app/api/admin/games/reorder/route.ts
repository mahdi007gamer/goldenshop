import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

/**
 * Batch-reorder games. Accepts an ordered array of game IDs and assigns
 * sortOrder = 0..N based on position. Used by drag-and-drop in the admin
 * Games tab.
 *
 * Body: { ids: string[] }  — ordered from top to bottom.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const ids = body?.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "ids must be a non-empty array" } },
        { status: 400 }
      );
    }
    // Update each game's sortOrder based on its index in the array.
    await prisma.$transaction(
      ids.map((id: string, index: number) =>
        prisma.game.update({ where: { id }, data: { sortOrder: index } })
      )
    );
    return NextResponse.json({ success: true, message: `${ids.length} games reordered` });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "REORDER_ERROR", message: "Failed to reorder games" } },
      { status: 500 }
    );
  }
}
