import { NextRequest, NextResponse } from "next/server";
import { loginWithPassword } from "@/lib/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usernameOrPhone, password } = body;

    if (!usernameOrPhone || !password) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Username/phone and password are required" } },
        { status: 400 }
      );
    }

    const { user, token, expiresAt } = await loginWithPassword(usernameOrPhone, password);

    const response = NextResponse.json({
      success: true,
      data: { user, message: "Login successful" },
    });

    response.cookies.set("gc_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json(
      { success: false, error: { code: "LOGIN_ERROR", message } },
      { status: 401 }
    );
  }
}
