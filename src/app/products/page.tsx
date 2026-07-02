import { redirect } from "next/navigation";

/**
 * Redirect legacy /products → /fa/products (301).
 *
 * The FA products listing now lives under /fa/products for explicit locale routing.
 */
export default function LegacyProductsRedirect() {
  redirect("/fa/products");
}
