"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart-store";

const HYDRATION_TIMEOUT_MS = 2000;

interface CartHydrationResult {
  /** True when Zustand persist has rehydrated OR timeout has elapsed. */
  hasHydrated: boolean;
  /** True if we gave up waiting for Zustand hydration and used the timeout. */
  timedOut: boolean;
}

/**
 * Hook to safely handle cart hydration.
 *
 * Problem: If Zustand persist's onRehydrateStorage never fires
 * (e.g., corrupted localStorage, quota exceeded), the cart page
 * shows CartSkeleton forever.
 *
 * Solution: Wait for either:
 *   1. Zustand sets isHydrated = true (normal path), OR
 *   2. A 2-second timeout elapses (safety net)
 *
 * After either event, the page renders with whatever cart data is available.
 */
export function useCartHydration(): CartHydrationResult {
  const isHydrated = useCartStore((s) => s.isHydrated);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    // If already hydrated, no need for timeout
    if (isHydrated) return;

    const timer = setTimeout(() => {
      setTimedOut(true);
      // Also force the store to hydrated state so other components work
      useCartStore.setState({ isHydrated: true });
    }, HYDRATION_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isHydrated]);

  return {
    hasHydrated: isHydrated || timedOut,
    timedOut,
  };
}
