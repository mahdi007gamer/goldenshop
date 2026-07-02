/**
 * Centralized pricing utilities.
 *
 * Client components: import from "@/lib/pricing/shared"
 * Server code: import from "@/lib/pricing/server"
 *
 * For convenience, re-export shared functions here.
 * Server-only functions (DB access) are NOT re-exported to avoid
 * pulling server-only code into client bundles.
 */

export {
  roundToNearestTomanUnit,
  convertUsdToTomanRaw,
  convertUsdToRoundedToman,
  formatToman,
  formatTomanExact,
  getMinimumAvailablePlan,
  getMinimumRoundedTomanPrice,
  getPriceForCycle,
  getRoundedTomanForCycle,
  toFaDigits,
} from "./shared";

export type {
  RoundedTomanPrice,
  MinimumPlanPrice,
  PricingPlan,
} from "./shared";
