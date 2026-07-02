"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { type Lang, t } from "@/i18n/translations";

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  isRTL: boolean;
  dir: "rtl" | "ltr";
  translate: (key: string) => string;
}

const LangContext = createContext<LangContextType | undefined>(undefined);

export function LangProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Derive lang from URL pathname:
  // /en/* routes → "en"
  // /fa/* routes (and everything else like /, /cart, /admin) → "fa"
  const derivedLang: Lang = pathname.startsWith("/en") ? "en" : "fa";
  const [lang, setLangState] = useState<Lang>(derivedLang);

  // Keep lang in sync with URL changes (back/forward navigation, link clicks)
  useEffect(() => {
    setLangState(derivedLang);
  }, [derivedLang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
  }, []);

  // toggleLang: navigate to the same page in the other locale.
  // Reads fresh pathname from window.location to avoid stale usePathname().
  const toggleLang = useCallback(() => {
    const fresh = window.location.pathname;
    const segments = fresh.split("/").filter(Boolean);
    const hasPrefix = segments[0] === "fa" || segments[0] === "en";
    const currentLang = hasPrefix ? segments[0] : "fa";
    const newLang = currentLang === "en" ? "fa" : "en";

    // Update state immediately for snappy UI
    setLangState(newLang);

    if (hasPrefix) {
      segments[0] = newLang;
      router.push(`/${segments.join("/")}`);
    } else {
      router.push(`/${newLang}/${segments.join("/")}`);
    }
  }, [router]);

  const isRTL = lang === "fa";
  const dir = isRTL ? "rtl" : "ltr";

  const translate = useCallback(
    (key: string) => t(key, lang),
    [lang]
  );

  // Update <html> dir and lang attributes whenever language changes
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("dir", isRTL ? "rtl" : "ltr");
    html.setAttribute("lang", lang);
  }, [lang, isRTL]);

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang, isRTL, dir, translate }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LangContext);
  if (!context) throw new Error("useLang must be used within LangProvider");
  return context;
}
