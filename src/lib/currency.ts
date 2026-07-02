import { Lang } from "@/i18n/translations";

// ─── Exchange Rate Cache ─────────────────────────────────────────────────────

interface RateCache {
  rate: number;
  source: string;
  timestamp: number;
}

// Persisted in localStorage for cross-session survival
const LS_KEY = "gc_usdt_rate";
const LS_META_KEY = "gc_usdt_rate_meta";

interface RateMeta {
  date: string; // YYYY-MM-DD
  fetchCount: number;
}

const MAX_FETCHES_PER_DAY = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

let memoryCache: RateCache | null = null;

// ─── Load from localStorage ──────────────────────────────────────────────────

function loadFromStorage(): RateCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RateCache;
  } catch {
    return null;
  }
}

function saveToStorage(cache: RateCache) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(cache));
  } catch { /* quota exceeded — ignore */ }
}

function loadMeta(): RateMeta {
  if (typeof window === "undefined") return { date: "", fetchCount: 0 };
  try {
    const raw = localStorage.getItem(LS_META_KEY);
    if (!raw) return { date: "", fetchCount: 0 };
    return JSON.parse(raw) as RateMeta;
  } catch {
    return { date: "", fetchCount: 0 };
  }
}

function saveMeta(meta: RateMeta) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_META_KEY, JSON.stringify(meta));
  } catch { /* ignore */ }
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Persian digits ──────────────────────────────────────────────────────────

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toFaDigits(n: number | string): string {
  return String(n).replace(/\d/g, (d) => FA_DIGITS[parseInt(d)]);
}

// ─── API: Multiple fallback sources ───────────────────────────────────────────

async function fetchFromZipodo(): Promise<number | null> {
  try {
    const res = await fetch("https://api.zipodo.ir/usdt/", {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const price = json?.price;
    if (typeof price === "number" && price > 0) return price;
    return null;
  } catch {
    return null;
  }
}

async function fetchFromWallex(): Promise<number | null> {
  try {
    const res = await fetch("https://api.wallex.ir/v1/markets", {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    // Find USDT/IRR pair
    const markets = json?.result?.markets || json?.data || json?.markets || [];
    if (Array.isArray(markets)) {
      const usdt = markets.find((m: Record<string, unknown>) =>
        String(m.symbol || m.name || m.pair || "").toLowerCase().includes("usdt") &&
        (String(m.symbol || m.name || m.pair || "").toLowerCase().includes("rls") ||
         String(m.symbol || m.name || m.pair || "").toLowerCase().includes("irr") ||
         String(m.symbol || m.name || m.pair || "").toLowerCase().includes("toman"))
      );
      if (usdt) {
        const price = Number(usdt.price || usdt.lastPrice || usdt.closePrice || usdt.last);
        if (price > 0) return Math.round(price / 10); // Convert Rials to Toman if needed
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchFromNobitex(): Promise<number | null> {
  try {
    const res = await fetch("https://api.nobitex.ir/market/stats?srcCurrency=usdt&dstCurrency=rls", {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const stats = json?.stats?.["usdt-rls"];
    if (stats) {
      const price = Number(stats.bestSell || stats.bestBuy || stats.latest || stats.close);
      if (price > 0) return Math.round(price / 10); // Rials to Toman
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchFromBinanceP2P(): Promise<number | null> {
  try {
    const res = await fetch("https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: 1, rows: 5, payTypes: [], asset: "USDT", tradeType: "SELL",
        fiat: "IRR", publisherType: null, merchantCheck: false,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const ads = json?.data;
    if (Array.isArray(ads) && ads.length > 0) {
      // Average of first 3 ads
      const prices = ads.slice(0, 3).map((a: Record<string, unknown>) => {
        const adv = a.adv as Record<string, unknown> | undefined;
        return Number(adv?.price || a.price);
      }).filter((p: number) => p > 0);
      if (prices.length > 0) {
        const avg = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
        return Math.round(avg / 10); // Rials to Toman
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchUSDTomanRateFromAPI(): Promise<{ rate: number; source: string } | null> {
  // Try each source in order
  const sources = [
    { name: "zipodo", fn: fetchFromZipodo },
    { name: "nobitex", fn: fetchFromNobitex },
    { name: "wallex", fn: fetchFromWallex },
    { name: "binanceP2P", fn: fetchFromBinanceP2P },
  ];

  for (const { name, fn } of sources) {
    const rate = await fn();
    if (rate && rate > 10000 && rate < 10000000) {
      return { rate, source: name };
    }
  }

  return null;
}

// ─── Core: get rate with daily fetch limit ───────────────────────────────────

export async function getUSDTomanRate(): Promise<number> {
  // 1. Use memory cache if from today
  if (memoryCache) {
    const age = Date.now() - memoryCache.timestamp;
    if (age < DAY_MS) {
      return memoryCache.rate;
    }
  }

  // 2. Use localStorage cache if from today
  const stored = loadFromStorage();
  if (stored) {
    const age = Date.now() - stored.timestamp;
    if (age < DAY_MS) {
      memoryCache = stored;
      return stored.rate;
    }
  }

  // 3. Check daily fetch limit
  const meta = loadMeta();
  const today = todayString();
  const isNewDay = meta.date !== today;
  const currentCount = isNewDay ? 0 : meta.fetchCount;

  if (currentCount >= MAX_FETCHES_PER_DAY) {
    // Daily limit reached — use last known rate
    if (stored && stored.rate > 0) {
      memoryCache = stored;
      return stored.rate;
    }
    if (memoryCache && memoryCache.rate > 0) {
      return memoryCache.rate;
    }
    return 500000; // ultimate fallback
  }

  // 4. Fetch fresh rate
  const freshRate = await fetchFromZipodo();
  const newCount = currentCount + 1;

  saveMeta({ date: today, fetchCount: newCount });

  if (freshRate && freshRate > 0) {
    const newCache: RateCache = {
      rate: freshRate,
      source: "zipodo",
      timestamp: Date.now(),
    };
    memoryCache = newCache;
    saveToStorage(newCache);
    return freshRate;
  }

  // 5. Fetch failed — use last known rate
  if (stored && stored.rate > 0) {
    // Using last known rate from cache
    memoryCache = stored;
    return stored.rate;
  }

  if (memoryCache && memoryCache.rate > 0) {
    return memoryCache.rate;
  }

  return 500000; // ultimate fallback
}

// ─── Get current rate (sync from cache) ─────────────────────────────────────

export function getCachedRate(): number | null {
  if (memoryCache) return memoryCache.rate;
  const stored = loadFromStorage();
  return stored?.rate ?? null;
}

// ─── Format price ────────────────────────────────────────────────────────────

export function formatPrice(amountUSD: number, lang: Lang): string {
  if (lang === "fa") {
    const rate = getCachedRate() ?? 500000;
    const toman = Math.round(amountUSD * rate);
    return `${toFaDigits(toman.toLocaleString("fa-IR"))} تومان`;
  }
  return `$${amountUSD.toFixed(2)}`;
}

export function formatPriceWithRate(amountUSD: number, rate: number, lang: Lang): string {
  if (lang === "fa") {
    const toman = Math.round(amountUSD * rate);
    return `${toFaDigits(toman.toLocaleString("fa-IR"))} تومان`;
  }
  return `$${amountUSD.toFixed(2)}`;
}

// ─── Format all product prices for FA ─────────────────────────────────────────

export interface ProductPrices {
  price: number;
  priceDaily: number | null;
  priceWeekly: number | null;
  priceMonthly: number | null;
  priceLifetime: number | null;
}

export function formatAllPricesInToman(prices: ProductPrices, rate: number): {
  price: string;
  daily: string | null;
  weekly: string | null;
  monthly: string | null;
  lifetime: string | null;
} {
  const fmt = (usd: number) => {
    const toman = Math.round(usd * rate);
    return `${toFaDigits(toman.toLocaleString("fa-IR"))} تومان`;
  };

  return {
    price: fmt(prices.price),
    daily: prices.priceDaily ? fmt(prices.priceDaily) : null,
    weekly: prices.priceWeekly ? fmt(prices.priceWeekly) : null,
    monthly: prices.priceMonthly ? fmt(prices.priceMonthly) : null,
    lifetime: prices.priceLifetime ? fmt(prices.priceLifetime) : null,
  };
}
