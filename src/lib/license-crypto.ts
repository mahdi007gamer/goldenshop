import * as crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

/**
 * Get the encryption key from environment variable.
 * In production, LICENSE_ENCRYPTION_KEY MUST be a 64-character hex string (32 bytes).
 * For development, derives a deterministic key from a fallback string.
 */
function getKey(): Buffer {
  const envKey = process.env.LICENSE_ENCRYPTION_KEY;
  if (!envKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("LICENSE_ENCRYPTION_KEY must be set in production");
    }
    // Development fallback — do NOT use in production
    return crypto.scryptSync("dev-only-key-do-not-use-in-prod", "salt", 32);
  }
  if (envKey.length !== 64) {
    throw new Error("LICENSE_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)");
  }
  return Buffer.from(envKey, "hex");
}

/**
 * Encrypt a license key using AES-256-GCM.
 * Returns a string in format: "iv:authTag:encryptedData" (all hex-encoded).
 */
export function encryptLicenseKey(plainText: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt a license key encrypted with `encryptLicenseKey`.
 * Throws if decryption fails (wrong key or tampered data).
 */
export function decryptLicenseKey(encryptedText: string): string {
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted license key format");
  }
  const [ivHex, authTagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * Mask a license key for display: XXXX-XXXX-****-****
 */
export function maskLicenseKey(key: string): string {
  if (key.length < 8) return "****-****-****-****";
  const cleaned = key.replace(/-/g, "");
  if (cleaned.length < 8) return "****-****-****-****";
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-****-****`;
}

/**
 * Generate a random license key in format: XXXX-XXXX-XXXX-XXXX
 */
export function generateLicenseKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.randomBytes(16);
  return Array.from({ length: 4 }, (_, i) =>
    Array.from({ length: 4 }, (_, j) => chars[bytes[i * 4 + j] % chars.length]).join("")
  ).join("-");
}
