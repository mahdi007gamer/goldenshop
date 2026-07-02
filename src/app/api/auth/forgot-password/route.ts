import { NextRequest, NextResponse } from "next/server";
import { createOtp } from "@/lib/services/auth.service";
import { prisma } from "@/lib/prisma";
import { checkPhoneRateLimit, checkIpRateLimit } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { step } = body;

    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (checkIpRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later." } },
        { status: 429 }
      );
    }

    if (step === "request-otp") {
      const { phone } = body;

      if (!phone || !/^09\d{9}$/.test(phone)) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "Valid phone number required" } },
          { status: 400 }
        );
      }

      if (checkPhoneRateLimit(phone)) {
        return NextResponse.json(
          { success: false, error: { code: "RATE_LIMITED", message: "Too many OTP requests. Please try again later." } },
          { status: 429 }
        );
      }

      const user = await prisma.user.findUnique({ where: { phone } });
      if (!user) {
        return NextResponse.json(
          { success: false, error: { code: "USER_NOT_FOUND", message: "No account with this phone number" } },
          { status: 404 }
        );
      }

      const { code } = await createOtp(phone, "reset-password");

      return NextResponse.json({
        success: true,
        data: { message: "OTP sent", ...(process.env.NODE_ENV === "development" && { code }) },
      });
    }

    if (step === "reset") {
      const { phone, code, newPassword } = body;

      if (!phone || !code || !newPassword) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "All fields are required" } },
          { status: 400 }
        );
      }

      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "Password must be at least 6 characters" } },
          { status: 400 }
        );
      }

      const { verifyOtp, resetUserPassword } = await import("@/lib/services/auth.service");

      const valid = await verifyOtp(phone, code, "reset-password");
      if (!valid) {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_OTP", message: "Invalid or expired OTP" } },
          { status: 400 }
        );
      }

      await resetUserPassword(phone, newPassword);

      return NextResponse.json({
        success: true,
        data: { message: "Password reset successful" },
      });
    }

    return NextResponse.json(
      { success: false, error: { code: "INVALID_STEP", message: "Invalid step" } },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Password reset failed";
    return NextResponse.json(
      { success: false, error: { code: "RESET_ERROR", message } },
      { status: 500 }
    );
  }
}
