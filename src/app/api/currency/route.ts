import { NextResponse } from "next/server";
import { getUSDTomanRate } from "@/lib/currency";

// GET /api/currency — returns current USD→Toman exchange rate
export async function GET() {
  try {
    const rate = await getUSDTomanRate();
    return NextResponse.json({
      success: true,
      data: {
        from: "USD",
        to: "IRR",
        rate,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[GET /api/currency]", err);
    return NextResponse.json(
      { success: false, error: { code: "CURRENCY_ERROR", message: "Failed to fetch exchange rate" } },
      { status: 500 }
    );
  }
}
