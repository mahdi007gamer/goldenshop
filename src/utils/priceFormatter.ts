/**
 * Price formatting utilities for Toman conversion.
 */

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toFaDigits(n: number | string): string {
  return String(n).replace(/\d/g, (d) => FA_DIGITS[parseInt(d)]);
}

/**
 * Convert USD to Toman, rounded to nearest 5,000.
 * Formula: Math.round(priceToman / 5000) * 5000
 *
 * Examples:
 *   formatToToman(10, 82000)  → "۸۲۰٬۰۰۰ تومان"
 *   formatToToman(10, 81930)  → "۸۲۰٬۰۰۰ تومان"  (819,300 → 820,000)
 *   formatToToman(0.5, 82000) → "۴۱٬۰۰۰ تومان"
 */
export function formatToToman(usdPrice: number, exchangeRate: number): string {
  const priceToman = usdPrice * exchangeRate;
  const roundedPrice = Math.round(priceToman / 5000) * 5000;
  return `${toFaDigits(roundedPrice.toLocaleString("fa-IR"))} تومان`;
}

/**
 * Format a USD price for display in EN mode (no conversion).
 */
export function formatUSD(usdPrice: number): string {
  return `$${usdPrice.toFixed(2)}`;
}

/**
 * Format price based on language.
 * FA → Toman (rounded to 5,000)
 * EN → USD
 */
export function formatPrice(usdPrice: number, exchangeRate: number | null, isFa: boolean): string {
  if (isFa && exchangeRate) {
    return formatToToman(usdPrice, exchangeRate);
  }
  return formatUSD(usdPrice);
}
