import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-utils";
import { analyzeSEO } from "@/lib/seo/analyzer";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const input = await request.json();
    const result = analyzeSEO(input);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("[SEO Analyze]", err);
    return NextResponse.json(
      { success: false, error: { code: "ANALYSIS_ERROR", message: "Analysis failed" } },
      { status: 500 }
    );
  }
}
