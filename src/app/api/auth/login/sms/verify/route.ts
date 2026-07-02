import { NextRequest, NextResponse } from "next/server";
import { verifyOtp, createSession } from "@/lib/services/auth.service";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Phone and code are required" } },
        { status: 400 }
      );
    }

    const valid = await verifyOtp(phone, code, "login");
    if (!valid) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_OTP", message: "Invalid or expired OTP" } },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    if (user.status === "suspended") {
      return NextResponse.json(
        { success: false, error: { code: "ACCOUNT_SUSPENDED", message: "Account suspended" } },
        { status: 403 }
      );
    }

    const { user: userData, token, expiresAt } = await createSession(user.id);

    const response = NextResponse.json({
      success: true,
      data: { user: userData, message: "Login successful" },
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
      { status: 500 }
    );
  }
}
