import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeString, parsePositiveInt } from "@/lib/auth-utils";
import { decryptLicenseKey } from "@/lib/license-crypto";

/**
 * GET /api/admin/licenses/list
 * Returns actual License records (not inventory) for the admin LicensesTab.
 * Supports: search, status, take, skip
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const status = sanitizeString(searchParams.get("status"));
    const search = sanitizeString(searchParams.get("search"));
    const take = parsePositiveInt(searchParams.get("take"), 20);
    const skip = parsePositiveInt(searchParams.get("skip"), 0);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { key: { contains: search } },
        { productName: { contains: search } },
        { user: { username: { contains: search } } },
      ];
    }

    const [licenses, total] = await Promise.all([
      prisma.license.findMany({
        where,
        include: {
          user: { select: { username: true } },
          product: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.license.count({ where }),
    ]);

    // Mask license keys for list view (full key only shown on copy/click)
    const masked = licenses.map((l) => ({
      ...l,
      key: l.key.length > 8 ? l.key.slice(0, 4) + "..." + l.key.slice(-4) : l.key,
    }));

    return NextResponse.json({ success: true, data: { licenses: masked, total } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "LICENSES_ERROR", message: "Failed to load licenses" } }, { status: 500 });
  }
}
