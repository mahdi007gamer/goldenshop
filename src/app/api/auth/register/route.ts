import { NextRequest, NextResponse } from "next/server";
import { createOtp, registerUser, verifyOtp } from "@/lib/services/auth.service";
import { checkPhoneRateLimit, checkIpRateLimit } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { step } = body;

    // Rate limiting check
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (checkIpRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later." } },
        { status: 429 }
      );
    }

    if (step === "request-otp") {
      const { username, phone, password } = body;

      if (!username || !phone || !password) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "All fields are required" } },
          { status: 400 }
        );
      }

      if (!/^09\d{9}$/.test(phone)) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "Phone must be 11 digits starting with 09" } },
          { status: 400 }
        );
      }

      if (typeof password !== "string" || password.length < 6) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "Password must be at least 6 characters" } },
          { status: 400 }
        );
      }

      if (checkPhoneRateLimit(phone)) {
        return NextResponse.json(
          { success: false, error: { code: "RATE_LIMITED", message: "Too many OTP requests. Please try again later." } },
          { status: 429 }
        );
      }

      const { code } = await createOtp(phone, "register");

      return NextResponse.json({
        success: true,
        data: { message: "OTP sent", ...(process.env.NODE_ENV === "development" && { code }) },
      });
    }

    if (step === "verify") {
      const { username, phone, password, code } = body;

      if (!username || !phone || !password || !code) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "All fields are required" } },
          { status: 400 }
        );
      }

      const valid = await verifyOtp(phone, code, "register");
      if (!valid) {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_OTP", message: "Invalid or expired OTP" } },
          { status: 400 }
        );
      }

      const { user, token, expiresAt } = await registerUser(username, phone, password);

      const response = NextResponse.json({
        success: true,
        data: { user, message: "Registration successful" },
      });

      response.cookies.set("gc_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: { code: "INVALID_STEP", message: "Invalid step" } },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json(
      { success: false, error: { code: "REGISTER_ERROR", message } },
      { status: 400 }
    );
  }
}
