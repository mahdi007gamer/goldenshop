import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, parsePositiveInt } from "@/lib/auth-utils";

// GET /api/licenses — List current user's licenses
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const take = parsePositiveInt(searchParams.get("take"), 50);
    const skip = parsePositiveInt(searchParams.get("skip"), 0);
    const [licenses, total] = await Promise.all([
      prisma.license.findMany({
        where: { userId: auth.user.id },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.license.count({ where: { userId: auth.user.id } }),
    ]);
    return NextResponse.json({ success: true, data: { licenses, total } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "LICENSES_ERROR", message: "Failed to load licenses" } }, { status: 500 });
  }
}
