import type { Metadata } from "next";
import { Cinzel, Rajdhani, Inter } from "next/font/google";
import { cookies, headers } from "next/headers";
import { LangProvider } from "@/context/LangContext";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { ToastProvider } from "@/components/ToastProvider";
import OrderCompletionListener from "@/components/OrderCompletionListener";
import { getSession } from "@/lib/services/auth.service";
import type { User } from "@/types";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  variable: "--font-rajdhani",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Golden Cheat — Unlock The Ultimate Advantage",
  description:
    "Access Elite Game Hacks with Ancient Security and Total Power. Undetectable. Empowered.",
  keywords: [
    "gaming cheats",
    "aimbot",
    "wallhack",
    "valorant cheats",
    "cs2 cheats",
    "Dota 2 cheats",
    "R6 Siege cheats",
    "apex legends cheats",
    "undetectable cheats",
  ],
  openGraph: {
    title: "Golden Cheat | Unlock the Ultimate Advantage",
    description: "Access Elite Game Hacks with Ancient Security and Total Power.",
    type: "website",
  },
};

/**
 * Server-side session validation.
 * Reads the httpOnly cookie here in the Server Component,
 * so the user is known before the first client render — no flash of unauthenticated state.
 */
async function getInitialUser() {
  try {
    const store = await cookies();
    const token = store.get("gc_session")?.value;
    if (!token) return null;

    const user = await getSession(token);
    if (!user) return null;
    // Cast to User type — getSession returns a generic object from Prisma select
    return {
      id: user.id,
      username: user.username,
      phone: user.phone,
      avatar: (user as any).avatar ?? null,
      role: user.role as "user" | "admin",
      status: user.status as "active" | "suspended",
      walletBalance: (user as any).walletBalance ?? 0,
      createdAt: (user as any).createdAt instanceof Date ? (user as any).createdAt.toISOString() : String((user as any).createdAt),
      updatedAt: (user as any).updatedAt instanceof Date ? (user as any).updatedAt.toISOString() : String((user as any).updatedAt),
    } as User;
  } catch {
    return null;
  }
}

/**
 * Derive the initial language from the request URL or cookie.
 * This ensures the very first HTML paint has the correct <html lang="en" dir="ltr">
 * for /en/* routes — no FOUC, correct for SEO crawlers.
 */
async function getInitialLang(): Promise<"fa" | "en"> {
  try {
    const h = await headers();
    const pathname = h.get("x-invoke-path") || h.get("next-url") || "";
    if (pathname.startsWith("/en")) return "en";
    // Fallback: check the lang cookie set by middleware
    const store = await cookies();
    if (store.get("lang")?.value === "en") return "en";
  } catch {
    // ignore
  }
  return "fa";
}

/**
 * Build alternate language URLs for hreflang + canonical.
 * Canonical is self-referencing: /en/products/X → /en/products/X, /fa/products/X → /fa/products/X
 * Hreflang points to the other language version.
 *
 * Supports three pathname shapes:
 * - /fa/products/X  → canonical=/fa/products/X, en=/en/products/X
 * - /en/products/X → canonical=/en/products/X, fa=/fa/products/X
 * - /products/X     → canonical=/products/X,    en=/en/products/X (legacy, no prefix)
 */
function buildAlternates(pathname: string): { canonical: string; languages: Record<string, string> } {
  // Self-referencing canonical (the current URL as-is)
  const canonical = `https://goldencheat.com${pathname}`;

  // Strip BOTH /fa and /en prefixes to get the base path
  const base = pathname.replace(/^\/(en|fa)/, "") || "/";

  // FA version: if current is /fa/X keep it, otherwise build /fa/base
  const isFa = pathname.startsWith("/fa");
  const faPath = isFa ? pathname : `/fa${base}`;

  // EN version: if current is /en/X keep it, otherwise build /en/base
  const isEn = pathname.startsWith("/en");
  const enPath = isEn ? pathname : `/en${base}`;

  return {
    canonical,
    languages: {
      fa: `https://goldencheat.com${faPath}`,
      en: `https://goldencheat.com${enPath}`,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Resolve the session on the server so the UI starts in the correct auth state.
  const initialUser = await getInitialUser();
  const initialLang = await getInitialLang();
  const initialDir = initialLang === "fa" ? "rtl" : "ltr";

  // Use x-url header from Next.js (set by middleware) to get the original pathname
  let pathname = "";
  try {
    const h = await headers();
    pathname = h.get("x-url") || "";
  } catch {
    // ignore
  }
  // Build cross-language alternates for SEO
  const alternates = buildAlternates(pathname);

  return (
    <html
      lang={initialLang}
      dir={initialDir}
      className={`${cinzel.variable} ${rajdhani.variable} ${inter.variable}`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <LangProvider>
          <AuthProvider initialUser={initialUser}>
            <AppProvider>
              <ToastProvider>
                {children}
                <OrderCompletionListener />
              </ToastProvider>
            </AppProvider>
          </AuthProvider>
        </LangProvider>
      </body>
      {/* Structural SEO — rendered server-side in initial HTML for crawlers */}
      <link rel="canonical" href={alternates.canonical} />
      <link rel="alternate" hrefLang="fa" href={alternates.languages.fa} />
      <link rel="alternate" hrefLang="en" href={alternates.languages.en} />
      <link rel="alternate" hrefLang="x-default" href={alternates.languages.fa} />
    </html>
  );
}
