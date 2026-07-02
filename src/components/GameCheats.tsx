"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Crosshair, Eye, Shield, Palette, Radar, CheckCircle, Star,
  Sparkles, Cpu, EyeOff, ShoppingCart, ArrowLeft, ArrowRight,
} from "lucide-react";
import { useLang } from "@/context/LangContext";
import { t } from "@/i18n/translations";
import { useCurrency } from "@/hooks/useCurrency";
import { formatPrice } from "@/utils/priceFormatter";
import { useInViewSafe } from "@/hooks/useInViewSafe";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  nameFa?: string;
  nameEn?: string | null;
  slug: string;
  slugEn?: string | null;
  slugFa?: string;
  game: string;
  category: string;
  price: number;
  rating: number;
  reviewsCount: number;
  features: string[];
  featuresEn?: string[] | null;
  isPopular: boolean;
  bypassRate: string;
  updateStatus: string;
  imageUrl: string | null;
  bannerImage: string | null;
  shortDesc?: string | null;
  shortDescFa?: string | null;
  shortDescEn?: string | null;
  subtitle?: string | null;
  subtitleEn?: string | null;
}

interface Game {
  id: string;
  slug: string;
  slugEn: string | null;
  name: string;
  nameEn: string | null;
  iconUrl: string | null;
  accentColor: string | null;
  description: string | null;
  descriptionEn: string | null;
}

// ─── Category icon map ────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  Aimbot: Crosshair,
  "ESP Overlay": EyeOff,
  Wallhack: Eye,
  "HWID Spoofer": Cpu,
  "Skin Changer": Palette,
  Radar: Radar,
};

const FALLBACK_ICON = Crosshair;

// ─── Game accent colors ───────────────────────────────────────────────────────

// Static fallbacks only — live games read their accentColor from the DB (see
// resolveGameColors below). Keep this small map for any game that has no
// accentColor stored, or as a tailwind-class reference.
const GAME_COLORS: Record<string, { accent: string; gradient: string; badge: string }> = {
  "Dota 2":      { accent: "#C9963A", gradient: "from-amber-950/50 via-obsidian to-obsidian", badge: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  "R6 Siege":    { accent: "#4A90D9", gradient: "from-blue-950/50 via-obsidian to-obsidian",   badge: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  Valorant:      { accent: "#FF4655", gradient: "from-red-950/50 via-obsidian to-obsidian",   badge: "bg-red-500/20 text-red-300 border-red-500/30" },
  CS2:           { accent: "#E8B030", gradient: "from-yellow-950/50 via-obsidian to-obsidian", badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  "Apex Legends":{ accent: "#9B59B6", gradient: "from-purple-950/50 via-obsidian to-obsidian",badge: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  Universal:     { accent: "#06C864", gradient: "from-green-950/50 via-obsidian to-obsidian",  badge: "bg-green-500/20 text-green-300 border-green-500/30" },
};

const DEFAULT_COLOR = { accent: "#C9963A", gradient: "from-gray-950/50 via-obsidian to-obsidian", badge: "bg-gray-500/20 text-gray-300 border-gray-500/30" };

/**
 * Resolve colors for a product. Uses the DB accentColor (fetched via /api/games)
 * when available; falls back to the static GAME_COLORS map, then DEFAULT_COLOR.
 * Returns a style object for the badge so Tailwind doesn't need to scan dynamic
 * class names.
 */
function resolveGameColors(gameName: string, gamesList: Game[]) {
  const fromDb = gamesList.find((g) => g.name === gameName);
  const accent = fromDb?.accentColor || GAME_COLORS[gameName]?.accent || DEFAULT_COLOR.accent;
  const staticEntry = GAME_COLORS[gameName];
  return {
    accent,
    gradient: staticEntry?.gradient || `from-gray-950/50 via-obsidian to-obsidian`,
    badgeStyle: {
      backgroundColor: `${accent}22`,
      color: accent,
      borderColor: `${accent}4D`,
    },
  };
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

function StarRating({ rating, reviews, ratingLabel }: { rating: number; reviews: number; ratingLabel: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={12}
            className={s <= Math.round(rating) ? "fill-gold text-gold" : "text-gray-600"}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-gold">{rating.toFixed(1)}</span>
      <span className="text-[10px] text-muted">
        ({reviews.toLocaleString()} {ratingLabel})
      </span>
    </div>
  );
}

// ─── Single Product Card ─────────────────────────────────────────────────────

function ProductCard({ product, isInView, index, buyNow, ratingLabel, isRtl, gamesList }: {
  product: Product;
  isInView: boolean;
  index: number;
  buyNow: string;
  ratingLabel: string;
  isRtl: boolean;
  gamesList: Game[];
}) {
  const colors = resolveGameColors(product.game, gamesList);
  const IconComp = CATEGORY_ICONS[product.category] || FALLBACK_ICON;
  const bannerSrc = product.bannerImage || product.imageUrl;
  const hasBanner = bannerSrc && /\.(svg|png|jpg|jpeg|webp|gif)$/i.test(bannerSrc);
  const hasPrice = product.price != null && product.price > 0;
  const { rate: exchangeRate } = useCurrency();
  const { lang } = useLang();
  const isFa = lang === "fa";
  // Use EN slug if available in EN locale, else fall back to FA slug.
  const productSlug = isFa ? product.slug : (product.slugEn || product.slug);
  const productHref = `/${lang}/products/${productSlug}`;

  return (
    <Link
      href={productHref}
      aria-label={product.name}
      className="block group relative flex flex-col h-full"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 + index * 0.06 }}
        className="relative flex flex-col h-full group-hover:border-white/[0.12] group-hover:-translate-y-0.5 transition-all duration-300"
        style={{
          overflow: "hidden",
          borderRadius: "0.75rem",
          border: "1px solid rgba(255,255,255,0.06)",
          background: `linear-gradient(180deg, ${colors.accent}08 0%, rgba(6,9,15,0.98) 100%)`,
          boxShadow: `0 4px 24px rgba(0,0,0,0.3)`,
        }}
      >
      {/* Popular badge — compact (positioned relative to the card) */}
      {product.isPopular && (
        <div
          className={`absolute top-3 z-10 flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold border backdrop-blur-md ${isRtl ? "left-3" : "right-3"}`}
          style={{ background: `${colors.accent}15`, borderColor: `${colors.accent}35`, color: colors.accent, letterSpacing: "0.05em" }}
        >
          <Sparkles size={8} />
          POPULAR
        </div>
      )}

      {/* Card header */}
      <div className="relative">
        {/* Banner Image */}
        <div className="relative h-40 w-full overflow-hidden">
          {hasBanner ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bannerSrc!} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
              {/* Bottom-third gradient only — keeps the image visible, readable text on top */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.75) 20%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0) 70%)",
                }}
              />
              {/* Subtle vignette on edges for depth */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at 50% 30%, transparent 50%, rgba(0,0,0,0.35) 100%)",
                }}
              />
            </>
          ) : (
            <>
              <div className="absolute inset-0 grid-pattern opacity-20" />
              <div
                className="absolute inset-0 opacity-30"
                style={{ background: `radial-gradient(ellipse at 50% 30%, ${colors.accent}33 0%, transparent 70%)` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="h-16 w-16 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm flex items-center justify-center"
                  style={{ borderColor: `${colors.accent}33` }}
                >
                  <IconComp size={28} style={{ color: colors.accent }} />
                </div>
              </div>
            </>
          )}
          {/* Glow */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 50% 0%, ${colors.accent}22 0%, transparent 70%)` }}
          />
        </div>

        {/* Product thumbnail overlay (bottom-left of banner) — always shows the product thumbnail (imageUrl), never the banner */}
        {product.imageUrl && /\.(svg|png|jpg|jpeg|webp|gif)$/i.test(product.imageUrl) && (
          <div className="absolute bottom-3 start-3 h-10 w-10 rounded-lg border overflow-hidden shadow-lg" style={{ borderColor: `${colors.accent}40` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Unavailable badge — shown when product has no price */}
        {!hasPrice && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <div className="px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-sm border border-red-500/40 text-red-400 text-xs font-bold tracking-wide whitespace-nowrap">
              {isFa ? "نا موجود" : "Unavailable"}
            </div>
          </div>
        )}
      </div>

      {/* Card body — flex-1 pushes footer down so all cards match height */}
      <div className="p-5 pt-3 flex flex-col flex-1">

        {/* Name — localized */}
        <h3 className="text-base font-bold text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          {isFa ? (product.nameFa || product.name) : (product.nameEn || product.nameFa || product.name)}
        </h3>

        {/* Game badge + subtitle (shown on product card) */}
        <div className="mt-1 flex items-center gap-2">
          <span
            className="rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border flex-shrink-0"
            style={colors.badgeStyle}
          >
            {product.game}
          </span>
          {(() => {
            const tagline = isFa ? product.subtitle || product.subtitleEn : product.subtitleEn || product.subtitle;
            if (!tagline) return null;
            const truncated = tagline.length > 60 ? tagline.slice(0, 60) + "…" : tagline;
            return (
              <>
                <span className="text-muted flex-shrink-0">·</span>
                <span className="text-xs truncate" style={{ color: `${colors.accent}cc` }}>
                  {truncated}
                </span>
              </>
            );
          })()}
        </div>

        {/* Rating */}
        <div className="mt-2">
          <StarRating rating={product.rating} reviews={product.reviewsCount} ratingLabel={ratingLabel} />
        </div>

        {/* Features — mt-auto pushes footer to the bottom */}
        <div className="border-t border-white/5 px-0 pt-3 mt-3 flex-1">
          <ul className="space-y-1.5">
            {(isFa ? product.features : (product.featuresEn || product.features)).slice(0, 4).map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-muted">
                <CheckCircle size={12} style={{ color: `${colors.accent}88` }} className="flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer — Price + Buy (always at the bottom thanks to mt-auto on features) */}
      <div className="border-t border-white/5 px-5 py-4 mt-auto">
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-gold-bright" dir="rtl" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            {formatPrice(product.price, exchangeRate, isFa)}
          </span>

          {/* BUY BUTTON (visual only — the whole card is a link now) */}
          <span className="btn-gold !py-2 !px-4 text-xs inline-flex items-center gap-1.5 pointer-events-none">
            {buyNow}
            {isRtl ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
          </span>
        </div>
      </div>
    </motion.div>
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GameCheats() {
  const { ref, isInView } = useInViewSafe<HTMLDivElement>({ once: true, margin: "-50px" });
  const { lang, isRTL } = useLang();
  const [products, setProducts] = useState<Product[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  // `null` = All Games. Otherwise the DB game name (products reference games by name).
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const title = t("store.title", lang);
  const buyNow = t("store.buyNow", lang);
  const ratingLabel = t("store.rating", lang);
  const allGamesLabel = t("store.allGames", lang);

  // Fetch products from DB
  useEffect(() => {
    fetch("/api/products?take=100")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setProducts(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fetch games from admin DB (synced with admin → Games tab)
  useEffect(() => {
    fetch("/api/games")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setGames(json.data);
        }
      })
      .catch(() => {});
  }, []);

  // Filtered products: by selected game, then sorted (priced first, unpriced last)
  const filteredProducts = selectedGame
    ? products.filter((p) => p.game === selectedGame)
    : products;

  // Build a map: game name → sortOrder (from admin Games tab). Lower = higher priority.
  const gameOrderMap = new Map<string, number>();
  games.forEach((g, i) => {
    if (!gameOrderMap.has(g.name)) gameOrderMap.set(g.name, i);
  });

  const sortedProducts = (() => {
    const priced = filteredProducts.filter((p) => p.price != null && p.price > 0);
    const unpriced = filteredProducts.filter((p) => !(p.price != null && p.price > 0));
    // Sort priced products by game priority (admin sortOrder), then by popularity/rating
    priced.sort((a, b) => {
      const orderA = gameOrderMap.get(a.game) ?? Number.MAX_SAFE_INTEGER;
      const orderB = gameOrderMap.get(b.game) ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      // Secondary: popular first, then higher rating
      if (a.isPopular !== b.isPopular) return a.isPopular ? -1 : 1;
      return b.rating - a.rating;
    });
    return [...priced, ...unpriced];
  })();

  // Build the filter list: games that actually have products (note: the DB already
  // orders by sortOrder, so we keep that order).
  const activeGameNames = new Set(products.map((p) => p.game));
  const filterGames = games.filter((g) => activeGameNames.has(g.name));

  return (
    <section id="game-cheats" className="relative py-24" ref={ref as React.RefObject<HTMLDivElement>}>
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="relative mx-auto max-w-[1280px] px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold-text"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            {t("store.subtitle", lang).split(" ")[0]}
          </p>
          <h2
            className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {title.split(" ")[0]}{" "}
            <span className="text-gold-gradient">{title.split(" ").slice(1).join(" ")}</span>
          </h2>
        </motion.div>

        {/* Game filter — synced with admin Games tab */}
        {!loading && filterGames.length > 0 && (
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {/* "All Games" pill */}
            <button
              onClick={() => setSelectedGame(null)}
              className="rounded-full px-4 py-1.5 text-xs font-bold border transition-all duration-200"
              style={{
                background: selectedGame === null ? "rgba(201,150,58,0.15)" : "rgba(255,255,255,0.03)",
                borderColor: selectedGame === null ? "rgba(201,150,58,0.5)" : "rgba(255,255,255,0.08)",
                color: selectedGame === null ? "#FFD700" : "rgba(255,255,255,0.5)",
                fontFamily: "'Rajdhani', sans-serif",
              }}
            >
              {allGamesLabel}
            </button>
            {filterGames.map((g) => {
              const gameName = lang === "fa" ? g.name : (g.nameEn || g.name);
              const isActive = selectedGame === g.name;
              const accent = g.accentColor || "#C9963A";
              return (
                <button
                  key={g.id}
                  onClick={() => setSelectedGame(isActive ? null : g.name)}
                  className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold border transition-all duration-200"
                  style={{
                    background: isActive ? `${accent}18` : "rgba(255,255,255,0.03)",
                    borderColor: isActive ? `${accent}66` : "rgba(255,255,255,0.08)",
                    color: isActive ? accent : "rgba(255,255,255,0.5)",
                    fontFamily: "'Rajdhani', sans-serif",
                  }}
                >
                  {g.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={g.iconUrl} alt={gameName} className="h-4 w-4 object-contain" />
                  ) : (
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: accent }}
                    />
                  )}
                  {gameName}
                </button>
              );
            })}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-xl border border-white/[0.04] bg-obsidian-light/50 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Product cards from DB — sorted: priced first, unpriced (unavailable) last */}
        {!loading && sortedProducts.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                isInView={isInView}
                index={i}
                buyNow={buyNow}
                ratingLabel={ratingLabel}
                isRtl={isRTL}
                gamesList={games}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && sortedProducts.length === 0 && (
          <div className="py-20 text-center">
            <ShoppingCart size={48} className="mx-auto mb-4 text-gray-700" />
            <p className="text-lg text-gray-500">
              {selectedGame ? t("store.noProducts", lang) : "No products available"}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
