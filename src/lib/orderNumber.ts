import crypto from "crypto";

/**
 * Generate a short, human-friendly order number.
 * Format: 8 uppercase hex chars (e.g. "DFD6NF4N")
 * Collision probability: 1 in 4 billion per pair.
 */
export function generateOrderNumber(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}
