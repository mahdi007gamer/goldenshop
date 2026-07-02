import { NextRequest, NextResponse } from "next/server";
import { createOtp } from "@/lib/services/auth.service";
import { checkPhoneRateLimit, checkIpRateLimit } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (checkIpRateLimit(ip) || checkPhoneRateLimit(phone || "")) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later." } },
        { status: 429 }
      );
    }

    if (!phone || !/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Valid phone number required" } },
        { status: 400 }
      );
    }

    const { code } = await createOtp(phone, "login");

    return NextResponse.json({
      success: true,
      data: { message: "OTP sent", ...(process.env.NODE_ENV === "development" && { code }) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to send SMS";
    return NextResponse.json(
      { success: false, error: { code: "SMS_ERROR", message } },
      { status: 500 }
    );
  }
}
