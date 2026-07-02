/**
 * Centralized pricing utility — shared (client + server safe).
 *
 * All Toman prices MUST go through these functions.
 * Never duplicate rounding/conversion logic in components.
 *
 * Rounding rule: Math.round(priceToman / 5000) * 5000
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RoundedTomanPrice {
  priceUSD: number;
  exchangeRate: number;
  tomanRaw: number;
  tomanRounded: number;
  roundingUnit: number;
  formatted: string;
}

export interface MinimumPlanPrice {
  duration?: string;
  labelEn?: string;
  labelFa?: string;
  priceUSD: number;
  tomanRaw: number;
  tomanRounded: number;
  formatted: string;
}

export interface PricingPlan {
  id?: string;
  duration?: string;
  labelEn: string;
  labelFa: string;
  priceUSD: number;
  isPopular?: boolean;
  isAvailable?: boolean;
}

// ─── Persian digits ───────────────────────────────────────────────────────────

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toFaDigits(n: number | string): string {
  return String(n).replace(/\d/g, (d) => FA_DIGITS[parseInt(d)]);
}

// ─── Core rounding ────────────────────────────────────────────────────────────

/**
 * Round a Toman amount to the nearest unit (default 5000).
 * Returns 0 for non-finite inputs.
 */
export function roundToNearestTomanUnit(amount: number, unit = 5000): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount / unit) * unit;
}

// ─── Conversion ───────────────────────────────────────────────────────────────

/**
 * Convert USD to raw Toman using exchange rate.
 * exchangeRate = Toman per 1 USD.
 */
export function convertUsdToTomanRaw(priceUSD: number, exchangeRate: number): number {
  if (!Number.isFinite(priceUSD) || !Number.isFinite(exchangeRate)) return 0;
  return priceUSD * exchangeRate;
}

/**
 * Convert USD to Toman and round to nearest 5000.
 * Returns full breakdown.
 */
export function convertUsdToRoundedToman(
  priceUSD: number,
  exchangeRate: number,
  roundingUnit = 5000,
): RoundedTomanPrice {
  const tomanRaw = convertUsdToTomanRaw(priceUSD, exchangeRate);
  const tomanRounded = roundToNearestTomanUnit(tomanRaw, roundingUnit);
  return {
    priceUSD,
    exchangeRate,
    tomanRaw,
    tomanRounded,
    roundingUnit,
    formatted: formatToman(tomanRounded),
  };
}

// ─── Formatting ───────────────────────────────────────────────────────────────

/**
 * Format a Toman number for Persian display.
 * Example: 820000 → "۸۲۰٬۰۰۰ تومان"
 */
export function formatToman(amount: number): string {
  const rounded = roundToNearestTomanUnit(amount);
  return `${toFaDigits(rounded.toLocaleString("fa-IR"))} تومان`;
}

/**
 * Format a Toman number WITHOUT re-rounding (already rounded).
 * Use this when you already have a rounded value.
 */
export function formatTomanExact(amount: number): string {
  return `${toFaDigits(Math.round(amount).toLocaleString("fa-IR"))} تومان`;
}

// ─── Minimum plan helpers ─────────────────────────────────────────────────────

/**
 * Product-like object that may have priceDaily, priceWeekly, priceMonthly, priceLifetime.
 * We find the minimum available price among all defined duration prices.
 */
export interface ProductWithDurationPrices {
  price: number;
  priceDaily?: number | null;
  priceWeekly?: number | null;
  priceMonthly?: number | null;
  priceLifetime?: number | null;
  name?: string;
  nameFa?: string | null;
}

/**
 * Get the minimum available plan from a product with duration-based prices.
 * Returns the duration key and priceUSD, or null if no valid prices.
 */
export function getMinimumAvailablePlan(
  product: ProductWithDurationPrices,
): { duration: string; priceUSD: number } | null {
  const candidates: Array<{ duration: string; priceUSD: number }> = [];

  if (typeof product.priceDaily === "number" && product.priceDaily > 0 && Number.isFinite(product.priceDaily)) {
    candidates.push({ duration: "daily", priceUSD: product.priceDaily });
  }
  if (typeof product.priceWeekly === "number" && product.priceWeekly > 0 && Number.isFinite(product.priceWeekly)) {
    candidates.push({ duration: "weekly", priceUSD: product.priceWeekly });
  }
  if (typeof product.priceMonthly === "number" && product.priceMonthly > 0 && Number.isFinite(product.priceMonthly)) {
    candidates.push({ duration: "monthly", priceUSD: product.priceMonthly });
  }
  if (typeof product.priceLifetime === "number" && product.priceLifetime > 0 && Number.isFinite(product.priceLifetime)) {
    candidates.push({ duration: "lifetime", priceUSD: product.priceLifetime });
  }
  // Fallback to base price if no duration prices exist
  if (candidates.length === 0 && typeof product.price === "number" && product.price > 0 && Number.isFinite(product.price)) {
    candidates.push({ duration: "monthly", priceUSD: product.price });
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => a.priceUSD - b.priceUSD);
  return candidates[0];
}

/**
 * Get the minimum available plan price converted to rounded Toman.
 * This is the primary function used by ProductCard.
 */
export function getMinimumRoundedTomanPrice(
  product: ProductWithDurationPrices,
  exchangeRate: number,
): MinimumPlanPrice | null {
  const minPlan = getMinimumAvailablePlan(product);
  if (!minPlan) return null;

  const { tomanRaw, tomanRounded, formatted } = convertUsdToRoundedToman(
    minPlan.priceUSD,
    exchangeRate,
  );

  return {
    duration: minPlan.duration,
    priceUSD: minPlan.priceUSD,
    tomanRaw,
    tomanRounded,
    formatted,
  };
}

// ─── Price for a specific billing cycle ───────────────────────────────────────

/**
 * Get the USD price for a specific billing cycle from a product.
 */
export function getPriceForCycle(
  product: ProductWithDurationPrices,
  billingCycle: string,
): number {
  switch (billingCycle) {
    case "daily":
      return product.priceDaily ?? product.price;
    case "weekly":
      return product.priceWeekly ?? product.price;
    case "monthly":
      return product.priceMonthly ?? product.price;
    case "lifetime":
      return product.priceLifetime ?? product.price * 3;
    default:
      return product.price;
  }
}

/**
 * Get the rounded Toman price for a specific billing cycle.
 */
export function getRoundedTomanForCycle(
  product: ProductWithDurationPrices,
  billingCycle: string,
  exchangeRate: number,
): RoundedTomanPrice {
  const priceUSD = getPriceForCycle(product, billingCycle);
  return convertUsdToRoundedToman(priceUSD, exchangeRate);
}
