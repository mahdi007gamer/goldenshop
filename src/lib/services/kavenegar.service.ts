const API_KEY = process.env.KAVENEGAR_API_KEY ?? "";
const TEMPLATE = process.env.KAVENEGAR_TEMPLATE ?? "verify";

export async function sendOtp(phone: string, token: string): Promise<boolean> {
  try {
    const url = `https://api.kavenegar.com/v1/${API_KEY}/verify/lookup.json`;
    const params = new URLSearchParams({
      receptor: phone,
      token: token,
      template: TEMPLATE,
    });

    const response = await fetch(`${url}?${params.toString()}`, {
      method: "GET",
    });

    const data = await response.json();
    return data.return?.status === 200;
  } catch {
    console.error("Kavenegar SMS failed");
    return false;
  }
}

import crypto from "crypto";

export function generateOtpCode(): string {
  // Cryptographically secure 6-digit OTP
  const bytes = crypto.randomBytes(4);
  const num = bytes.readUInt32BE(0) % 1_000_000;
  return num.toString().padStart(6, "0");
}
