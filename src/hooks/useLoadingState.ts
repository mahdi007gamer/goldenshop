import { useState, useCallback } from "react";

/**
 * Hook for managing button loading states.
 * Prevents double-submission and provides start/stop helpers.
 *
 * Usage:
 * ```tsx
 * const { isLoading, startLoading, stopLoading, withLoading } = useLoadingState();
 *
 * // Manual control:
 * startLoading();
 * await doSomething();
 * stopLoading();
 *
 * // Or use the wrapper:
 * await withLoading(() => doSomething());
 * ```
 */
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);

  const withLoading = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    startLoading();
    try {
      return await fn();
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return { isLoading, startLoading, stopLoading, withLoading };
}
