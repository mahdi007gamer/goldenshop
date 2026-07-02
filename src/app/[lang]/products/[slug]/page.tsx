"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import SharedProductPage from "@/app/_product/ProductPage";

/**
 * Localized product detail page (e.g., /fa/products/cheat-pubg-aby or /en/products/cheat-pubg-aby).
 *
 * Renders the shared product page component with language detected from URL params.
 * Also sets canonical + hreflang client-side for SEO.
 */
export default function LocalizedProductPage() {
  const params = useParams();
  const lang = (params as { lang?: string }).lang === "en" ? "en" : "fa";

  // Set canonical + hreflang via client-side (runs after hydration)
  useEffect(() => {
    const pathname = window.location.pathname;
    const origin = "https://goldencheat.com";

    // Strip /fa or /en prefix to get base path
    const base = pathname.replace(/^\/(en|fa)/, "") || "/";

    // Build FA and EN URLs with explicit prefixes
    const faPath = `/fa${base}`;
    const enPath = `/en${base}`;

    // Canonical (self-referencing for current page)
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${origin}${pathname}`);

    // Hreflang alternates
    const setAlternate = (hreflang: string, href: string) => {
      let link = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "alternate");
        link.setAttribute("hreflang", hreflang);
        document.head.appendChild(link);
      }
      link.setAttribute("href", href);
    };

    setAlternate("fa", `${origin}${faPath}`);
    setAlternate("en", `${origin}${enPath}`);
    setAlternate("x-default", `${origin}${faPath}`);
  }, [lang]);

  return <SharedProductPage />;
}
