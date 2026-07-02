/**
 * Pricing-related types.
 * Re-exports from the centralized pricing utility for use across the app.
 */

export type {
  RoundedTomanPrice,
  MinimumPlanPrice,
  PricingPlan,
} from "@/lib/pricing/shared";

// ─── Cart item with plan data ─────────────────────────────────────────────────

/**
 * Selected plan snapshot stored in cart items.
 * Enough data to display and recalculate price without re-fetching product.
 */
export interface SelectedPlanSnapshot {
  duration: string;
  labelEn?: string;
  labelFa?: string;
  priceUSD: number;
}

/**
 * Enhanced cart item that includes selected plan data and pre-calculated Toman.
 * The Toman values are for UI display only — server recalculates on order creation.
 */
export interface CartItemWithPlan {
  id: string;
  productId: string;
  productName: string;
  productNameFa?: string | null;
  slug?: string;
  image?: string | null;
  quantity: number;
  billingCycle: string;
  selectedPlan: SelectedPlanSnapshot;
  priceUSD: number;
  priceTomanRaw?: number;
  priceTomanRounded?: number;
}

// ─── Order with Toman pricing ─────────────────────────────────────────────────

/**
 * Order extended with Toman pricing fields.
 * Server-side source of truth for payment amounts.
 */
export interface OrderWithTomanPricing {
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
  items: Array<{
    productId: string;
    productName: string;
    productNameFa?: string | null;
    billingCycle: string;
    priceUSD: number;
    priceTomanRaw: number;
    priceTomanRounded: number;
    quantity: number;
    lineTotalUSD: number;
    lineTotalTomanRounded: number;
  }>;
}
