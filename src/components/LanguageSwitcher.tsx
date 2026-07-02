"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/context/LangContext";

/**
 * Language switcher that builds the counterpart URL for the current route.
 *
 * Rules:
 * - `/fa/...` → `/en/...`  (and vice versa)
 * - On `/fa/blog/[slug]` → `/en/blog/[slugEn]`  (fetches counterpart slug from API)
 * - On `/en/blog/[slug]` → `/fa/blog/[slugFa]` (fetches counterpart slug from API)
 * - `/blog/...` → `/en/blog/...` (default Persian rewrite goes to EN)
 *
 * For article pages we fetch the counterpart slug from /api/articles/slug-map
 * so the switcher always jumps to the correct URL, even for new articles.
 */

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang } = useLang();

  const buildCounterpartUrl = (): string => {
    const segments = pathname.split("/").filter(Boolean);

    // Determine current lang from first segment
    let currentLang: "fa" | "en" | null = null;
    if (segments[0] === "fa" || segments[0] === "en") {
      currentLang = segments[0];
    }

    // Handle /blog/... (no lang prefix) → treat as fa, go to /en/blog/...
    if (!currentLang) {
      return `/en/${segments.join("/")}`;
    }

    const targetLang = currentLang === "fa" ? "en" : "fa";
    const rest = segments.slice(1); // remove lang prefix

    // Handle blog article: /[lang]/blog/[slug]
    if (rest[0] === "blog" && rest[1]) {
      // We can't await here in a sync handler, so we navigate to the
      // language-prefixed listing and let the user pick. The actual
      // counterpart slug resolution happens via the async path below.
      return `/${targetLang}/blog`;
    }

    // Default: swap lang prefix
    return `/${targetLang}/${rest.join("/")}`;
  };

  const handleToggle = async () => {
    const segments = pathname.split("/").filter(Boolean);
    let currentLang: "fa" | "en" | null = null;
    if (segments[0] === "fa" || segments[0] === "en") {
      currentLang = segments[0];
    }
    const rest = currentLang ? segments.slice(1) : segments;
    const targetLang = currentLang === "en" ? "fa" : "en";

    // Article page: fetch counterpart slug
    if (rest[0] === "blog" && rest[1]) {
      const currentSlug = decodeURIComponent(rest[1]);
      try {
        const res = await fetch(`/api/articles/slug-map?slug=${encodeURIComponent(currentSlug)}`);
        const data = await res.json();
        const counterpartSlug = currentLang === "fa" ? data.en : data.fa;
        setLang(targetLang);
        if (counterpartSlug) {
          router.push(`/${targetLang}/blog/${counterpartSlug}`);
        } else {
          router.push(`/${targetLang}/blog`);
        }
        return;
      } catch {
        // fallback to listing
      }
    }

    const targetUrl = buildCounterpartUrl();
    setLang(targetLang);
    router.push(targetUrl);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleToggle}
      className="relative flex h-9 items-center gap-1.5 rounded-lg bg-white/5 px-2.5 text-muted transition-colors hover:text-gold"
      aria-label="Toggle language"
    >
      <Globe size={16} />
      <span
        className="text-[10px] font-bold"
        style={{ fontFamily: "'Rajdhani', sans-serif" }}
      >
        {lang === "fa" ? "FA" : "EN"}
      </span>
    </motion.button>
  );
}
