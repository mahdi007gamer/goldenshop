"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A safe drop-in replacement for framer-motion's useInView that works
 * reliably with React 19 + Turbopack. Uses IntersectionObserver directly
 * and triggers on the first intersection.
 */
export function useInViewSafe<T extends HTMLElement = HTMLDivElement>(
  options: { once?: boolean; margin?: string; threshold?: number } = {}
) {
  const { once = true, margin = "0px", threshold = 0 } = options;
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If already triggered once, don't re-attach
    if (once && isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setIsInView(false);
          }
        }
      },
      { rootMargin: margin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, margin, threshold, isInView]);

  return { ref, isInView };
}
