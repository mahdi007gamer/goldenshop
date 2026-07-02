import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { withSecurityHeaders } from "@/lib/security-headers";

/**
 * DELETE /api/admin/licenses/inventory/[id]
 * Remove a license from inventory (only if still "available").
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    const item = await prisma.licenseInventory.findUnique({ where: { id } });
    if (!item) {
      return withSecurityHeaders(
        NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "License not found" } }, { status: 404 })
      );
    }
    if (item.status !== "available") {
      return withSecurityHeaders(
        NextResponse.json(
          { success: false, error: { code: "INVALID_STATUS", message: `Cannot delete — license is ${item.status}` } },
          { status: 400 }
        )
      );
    }

    await prisma.licenseInventory.delete({ where: { id } });
    return withSecurityHeaders(NextResponse.json({ success: true, message: "License removed from inventory" }));
  } catch (err) {
    console.error("[licenses/inventory/:id] DELETE error:", err);
    return withSecurityHeaders(
      NextResponse.json(
        { success: false, error: { code: "DELETE_ERROR", message: "Failed to delete license" } },
        { status: 500 }
      )
    );
  }
}
