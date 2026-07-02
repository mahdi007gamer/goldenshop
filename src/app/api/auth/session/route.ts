import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/services/auth.service";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("gc_session")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: "NO_SESSION", message: "Not authenticated" } },
      { status: 401 }
    );
  }

  const user = await getSession(token);

  if (!user) {
    const response = NextResponse.json(
      { success: false, error: { code: "INVALID_SESSION", message: "Session expired" } },
      { status: 401 }
    );
    response.cookies.delete("gc_session");
    return response;
  }

  return NextResponse.json({ success: true, data: user });
}
