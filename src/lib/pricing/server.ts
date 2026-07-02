/**
 * Server-side pricing utilities.
 * Uses the shared pricing functions from ./shared.ts
 * and adds server-specific logic (DB lookups, exchange rate fetching).
 */

import { roundToNearestTomanUnit } from "./shared";

// Re-export shared functions for convenience
export {
  roundToNearestTomanUnit,
  convertUsdToRoundedToman,
  convertUsdToTomanRaw,
  formatToman,
  formatTomanExact,
  getMinimumAvailablePlan,
  getMinimumRoundedTomanPrice,
  getPriceForCycle,
  getRoundedTomanForCycle,
  toFaDigits,
} from "./shared";

export type { RoundedTomanPrice, MinimumPlanPrice, PricingPlan } from "./shared";

// ─── Server-side exchange rate ────────────────────────────────────────────────

/**
 * Get the current exchange rate server-side.
 * Tries the same sources as the client-side currency.ts but from the server.
 * Falls back to a hardcoded rate if all sources fail.
 */
export async function getServerExchangeRate(): Promise<{ rate: number; source: string; cached: boolean }> {
  // Try fetching from external APIs
  const sources = [
    { name: "zipodo", fn: fetchFromZipodo },
    { name: "nobitex", fn: fetchFromNobitex },
  ];

  for (const { name, fn } of sources) {
    try {
      const rate = await fn();
      if (rate && rate > 10000 && rate < 10000000) {
        return { rate, source: name, cached: false };
      }
    } catch {
      // Try next source
    }
  }

  // Fallback rate — update this periodically
  return { rate: 500000, source: "fallback", cached: true };
}

async function fetchFromZipodo(): Promise<number | null> {
  const res = await fetch("https://api.zipodo.ir/usdt/", {
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;
  const json = await res.json();
  const price = json?.price;
  if (typeof price === "number" && price > 0) return price;
  return null;
}

async function fetchFromNobitex(): Promise<number | null> {
  const res = await fetch(
    "https://api.nobitex.ir/market/stats?srcCurrency=usdt&dstCurrency=rls",
    { cache: "no-store", signal: AbortSignal.timeout(5000) },
  );
  if (!res.ok) return null;
  const json = await res.json();
  const stats = json?.stats?.["usdt-rls"];
  if (stats) {
    const price = Number(stats.bestSell || stats.bestBuy || stats.latest || stats.close);
    if (price > 0) return Math.round(price / 10); // Rials to Toman
  }
  return null;
}

// ─── Order pricing calculation ────────────────────────────────────────────────

export interface OrderItemPricing {
  productId: string;
  productName: string;
  productNameFa?: string;
  billingCycle: string;
  priceUSD: number;
  priceTomanRaw: number;
  priceTomanRounded: number;
  quantity: number;
  lineTotalUSD: number;
  lineTotalTomanRounded: number;
}

export interface OrderPricing {
  items: OrderItemPricing[];
  subtotalUSD: number;
  subtotalTomanRaw: number;
  subtotalTomanRounded: number;
  totalUSD: number;
  totalTomanRaw: number;
  totalTomanRounded: number;
  exchangeRate: number;
  roundingUnit: number;
  currency: string;
  formattedTotalToman: string;
}

/**
 * Calculate order pricing server-side.
 * This is the source of truth — never trust client-submitted Toman prices.
 *
 * @param items - Array of { productId, billingCycle, quantity }
 * @param productFetcher - Function to fetch product from DB by ID
 * @param exchangeRate - Current exchange rate (Toman per USD)
 */
export async function calculateOrderPricing(
  items: Array<{ productId: string; billingCycle: string; quantity: number }>,
  productFetcher: (id: string) => {
    id: string;
    name: string;
    nameFa?: string | null;
    price: number;
    priceDaily?: number | null;
    priceWeekly?: number | null;
    priceMonthly?: number | null;
    priceLifetime?: number | null;
  } | null,
  exchangeRate: number,
  roundingUnit = 5000,
): Promise<OrderPricing> {
  const orderItems: OrderItemPricing[] = [];
  let subtotalUSD = 0;
  let subtotalTomanRaw = 0;
  let subtotalTomanRounded = 0;

  for (const item of items) {
    const product = await productFetcher(item.productId);
    if (!product) continue;

    const priceUSD = getPriceForCycleFromProduct(product, item.billingCycle);
    const tomanRaw = priceUSD * exchangeRate;
    const tomanRounded = roundToNearestTomanUnit(tomanRaw, roundingUnit);
    const qty = Math.max(1, Math.min(item.quantity, 10));

    const lineTotalUSD = priceUSD * qty;
    const lineTotalTomanRounded = tomanRounded * qty;

    orderItems.push({
      productId: product.id,
      productName: product.name,
      productNameFa: product.nameFa || undefined,
      billingCycle: item.billingCycle,
      priceUSD,
      priceTomanRaw: tomanRaw,
      priceTomanRounded: tomanRounded,
      quantity: qty,
      lineTotalUSD,
      lineTotalTomanRounded,
    });

    subtotalUSD += lineTotalUSD;
    subtotalTomanRaw += tomanRaw * qty;
    subtotalTomanRounded += lineTotalTomanRounded;
  }

  const totalUSD = subtotalUSD;
  const totalTomanRaw = subtotalTomanRaw;
  const totalTomanRounded = subtotalTomanRounded;

  return {
    items: orderItems,
    subtotalUSD,
    subtotalTomanRaw,
    subtotalTomanRounded,
    totalUSD,
    totalTomanRaw,
    totalTomanRounded,
    exchangeRate,
    roundingUnit,
    currency: "TOMAN",
    formattedTotalToman: `${Math.round(totalTomanRounded).toLocaleString("fa-IR")} تومان`,
  };
}

function getPriceForCycleFromProduct(
  product: {
    price: number;
    priceDaily?: number | null;
    priceWeekly?: number | null;
    priceMonthly?: number | null;
    priceLifetime?: number | null;
  },
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
