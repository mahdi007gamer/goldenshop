"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart-store";

/**
 * Hook that ensures the cart is hydrated before allowing checkout.
 * Prevents the "cart is empty" flash during page transitions.
 *
 * Usage:
 * ```tsx
 * const { isHydrated, canProceed, itemCount } = useCheckoutGuard();
 *
 * if (!isHydrated) return <CartSkeleton />;
 * // ... render checkout UI
 * ```
 */
export function useCheckoutGuard() {
  const { isHydrated, items } = useCartStore();
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    // Only allow proceeding after hydration is complete AND cart has items
    if (isHydrated && items.length > 0) {
      setCanProceed(true);
    }
  }, [isHydrated, items.length]);

  return {
    isHydrated,
    canProceed,
    itemCount: items.length,
  };
}
