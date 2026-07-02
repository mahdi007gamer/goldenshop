import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/services/auth.service";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("gc_session")?.value;

  if (token) {
    await destroySession(token);
  }

  const response = NextResponse.json({ success: true, data: { message: "Logged out" } });
  response.cookies.delete("gc_session");
  return response;
}
