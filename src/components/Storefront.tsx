"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { useLang } from "@/context/LangContext";
import { toFaDigits } from "@/lib/currency";
import { useCurrency } from "@/hooks/useCurrency";
import {
  Search, Star, Shield, ShoppingCart, Zap, Filter, BadgeCheck,
  Eye, ChevronDown, Crosshair, EyeOff, Monitor, Cpu, Palette,
  Radio, Sparkles, ArrowRight, Clock, CheckCircle, TrendingUp,
} from "lucide-react";
import ProductModal from "@/components/product-modal";
import type { Product } from "@/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const GAMES = ["All Games", "Dota 2", "R6 Siege", "Valorant", "CS2", "Apex Legends"] as const;
const CATEGORIES = ["All Categories", "Aimbot", "Wallhack", "ESP Overlay", "HWID Spoofer", "Skin Changer", "Radar"] as const;
const SORT_OPTIONS = ["Featured", "Price: Low", "Price: High", "Rating", "Popular"] as const;

const GAME_BADGE: Record<string, string> = {
  "Dota 2": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "R6 Siege": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Valorant: "bg-red-500/20 text-red-300 border-red-500/30",
  CS2: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "Apex Legends": "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const GAME_CARD_GRADIENT: Record<string, string> = {
  "Dota 2": "from-amber-950/60 via-obsidian to-obsidian",
  "R6 Siege": "from-blue-950/60 via-obsidian to-obsidian",
  Valorant: "from-red-950/60 via-obsidian to-obsidian",
  CS2: "from-yellow-950/60 via-obsidian to-obsidian",
  "Apex Legends": "from-purple-950/60 via-obsidian to-obsidian",
};

const GAME_GLOW: Record<string, string> = {
  "Dota 2": "shadow-amber-500/10",
  "R6 Siege": "shadow-blue-500/10",
  Valorant: "shadow-red-500/10",
  CS2: "shadow-yellow-500/10",
  "Apex Legends": "shadow-purple-500/10",
};

const GAME_ACCENT: Record<string, string> = {
  "Dota 2": "#C9963A",
  "R6 Siege": "#4A90D9",
  Valorant: "#FF4655",
  CS2: "#E8B030",
  "Apex Legends": "#9B59B6",
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Aimbot: <Crosshair size={14} />,
  "ESP Overlay": <EyeOff size={14} />,
  Wallhack: <Eye size={14} />,
  "HWID Spoofer": <Cpu size={14} />,
  "Skin Changer": <Palette size={14} />,
  Radar: <Radio size={14} />,
};

// ─── Product Image Component ─────────────────────────────────────────────────

function ProductImage({ product }: { product: Product }) {
  const gradient = GAME_CARD_GRADIENT[product.game] || "from-gray-950/60 via-obsidian to-obsidian";
  const accent = GAME_ACCENT[product.game] || "#C9963A";
  const bannerSrc = product.bannerImage || product.imageUrl;
  const hasBanner = bannerSrc && bannerSrc.trim().length > 0;

  return (
    <div className={`relative w-full overflow-hidden bg-gradient-to-br ${gradient}`}>
      {/* ── Banner hero area ── */}
      <div className="relative h-52 sm:h-56 w-full">
        {hasBanner ? (
          <>
            <img
              src={bannerSrc}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            {/* Overlays for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 grid-pattern opacity-20" />
            <div
              className="absolute inset-0 opacity-30"
              style={{ background: `radial-gradient(ellipse at 50% 30%, ${accent}33 0%, transparent 70%)` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div
                  className="h-20 w-20 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm flex items-center justify-center"
                  style={{ borderColor: `${accent}33` }}
                >
                  <Shield size={36} style={{ color: `${accent}99` }} />
                </div>
                <div className="absolute -inset-3 rounded-3xl border opacity-30" style={{ borderColor: accent }} />
              </div>
            </div>
          </>
        )}

        {/* Game + Category badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className="rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md"
            style={{ backgroundColor: `${accent}20`, borderColor: `${accent}40`, color: accent }}
          >
            {product.game}
          </span>
          <span
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-medium backdrop-blur-md border"
            style={{ backgroundColor: "rgba(0,0,0,0.4)", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}
          >
            {CATEGORY_ICONS[product.category] || <Zap size={12} />}
            {product.category}
          </span>
        </div>

        {/* Popular badge */}
        {product.isPopular && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-gold/20 backdrop-blur-md border border-gold/30 px-2.5 py-1.5 text-xs font-bold text-gold">
            <Sparkles size={12} />
            HOT
          </div>
        )}

        {/* Status dot */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{
              background: product.updateStatus === "Undetected" ? "#00ff88" : product.updateStatus === "Testing" ? "#eab308" : "#ef4444",
              boxShadow: `0 0 8px ${product.updateStatus === "Undetected" ? "#00ff88" : product.updateStatus === "Testing" ? "#eab308" : "#ef4444"}`,
            }}
          />
          <span className="text-[10px] font-medium text-white/70">{product.updateStatus}</span>
        </div>

        {/* Product name on banner */}
        <div className="absolute bottom-3 left-3 right-16">
          <h3
            className="text-sm font-bold text-white leading-snug drop-shadow-lg line-clamp-1"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            {product.name}
          </h3>
        </div>
      </div>
    </div>
  );
}

// ─── Star Rating Component ───────────────────────────────────────────────────

function StarRating({ rating, reviewsCount }: { rating: number; reviewsCount: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => {
          if (i < fullStars) return <Star key={i} size={13} className="fill-gold text-gold" />;
          if (i === fullStars && hasHalf) return <Star key={i} size={13} className="fill-gold/50 text-gold" />;
          return <Star key={i} size={13} className="text-gray-700" />;
        })}
      </div>
      <span className="text-xs text-gray-500">
        {rating.toFixed(1)} <span className="text-gray-600">({reviewsCount})</span>
      </span>
    </div>
  );
}

// ─── Main Storefront Component ───────────────────────────────────────────────

export default function Storefront() {
  const { products, addToCart, triggerDirectPurchase } = useApp();
  const { translate: t, lang } = useLang();
  const isFa = lang === "fa";
  const [selectedGame, setSelectedGame] = useState<string>("All Games");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("Featured");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const { rate: tomanRate } = useCurrency();

  // Helper: format price based on language — Toman in FA, USD in EN
  const formatPriceByLang = (usd: number): string => {
    if (isFa && tomanRate) {
      const toman = Math.round(usd * tomanRate);
      return `${toFaDigits(toman.toLocaleString("fa-IR"))} تومان`;
    }
    return `$${usd.toFixed(2)}`;
  };

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesGame = selectedGame === "All Games" || product.game === selectedGame;
      const matchesCategory = selectedCategory === "All Categories" || product.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGame && matchesCategory && matchesSearch;
    });
    switch (sortBy) {
      case "Price: Low":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case "Price: High":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case "Rating":
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
      case "Popular":
        filtered = [...filtered].sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
        break;
    }
    return filtered;
  }, [products, selectedGame, selectedCategory, searchQuery, sortBy]);

  // Helper: get lowest available price for a product
  const getLowestPrice = (product: Product): number => {
    const prices = [product.price];
    if (product.priceDaily) prices.push(product.priceDaily);
    if (product.priceWeekly) prices.push(product.priceWeekly);
    if (product.priceMonthly) prices.push(product.priceMonthly);
    if (product.priceLifetime) prices.push(product.priceLifetime);
    return Math.min(...prices);
  };

  return (
    <section id="products" className="relative py-24 px-4">
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="relative mx-auto max-w-7xl">
        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-1.5 text-xs font-medium text-gold/80 mb-4">
            <Zap size={12} />
            {t("store.subtitle") || "Premium Game Enhancements"}
          </div>
          <h2 className="font-display text-4xl font-black tracking-tight text-gold-gradient sm:text-5xl">
            {t("store.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-500 text-sm leading-relaxed">
            {t("store.subtitle")}
          </p>
        </motion.div>

        {/* ── Filters ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10 space-y-4"
        >
          {/* Game filter */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={15} className="text-gray-600 mr-1" />
            {GAMES.map((game) => (
              <motion.button
                key={game}
                onClick={() => setSelectedGame(game)}
                whileTap={{ scale: 0.95 }}
                className={`cursor-pointer rounded-lg border px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  selectedGame === game
                    ? "border-gold/40 bg-gold/15 text-gold shadow-lg shadow-gold/5"
                    : "border-white/5 bg-white/[0.02] text-gray-500 hover:border-white/15 hover:text-gray-300"
                }`}
              >
                {game === "All Games" ? t("store.allGames") : game}
              </motion.button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap items-center gap-2">
            <Zap size={15} className="text-gray-600 mr-1" />
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                whileTap={{ scale: 0.95 }}
                className={`cursor-pointer rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? "border-cyber/40 bg-cyber/15 text-cyber"
                    : "border-white/5 bg-white/[0.02] text-gray-500 hover:border-white/15 hover:text-gray-300"
                }`}
              >
                {cat !== "All Categories" && CATEGORY_ICONS[cat]}
                {cat === "All Categories" ? t("store.allCategories") : cat}
              </motion.button>
            ))}
          </div>

          {/* Search + Sort */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type="text"
                placeholder={t("common.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-white/5 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 transition-colors focus:border-gold/30 focus:outline-none focus:bg-white/[0.05]"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-4 py-2.5 text-sm text-gray-400 transition-colors hover:border-white/15"
              >
                <TrendingUp size={14} />
                {t("store.sort")}: {t(`store.sort.${sortBy.toLowerCase().replace(/[: ]/g, "")}`)}
                <ChevronDown size={14} />
              </button>
              <AnimatePresence>
                {showSortDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-obsidian-light shadow-2xl shadow-black/50"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSortBy(option);
                          setShowSortDropdown(false);
                        }}
                        className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${
                          sortBy === option
                            ? "bg-gold/10 text-gold"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {t(`store.sort.${option.toLowerCase().replace(/[: ]/g, "")}`)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ── Product Grid ───────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedGame}-${selectedCategory}-${searchQuery}-${sortBy}`}
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredProducts.map((product) => {
              const accent = GAME_ACCENT[product.game] || "#C9963A";
              return (
                <motion.div
                  key={product.id}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
                  }}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-b ${GAME_CARD_GRADIENT[product.game] || "from-obsidian to-obsidian"} hover:border-white/10 transition-all duration-300 shadow-lg ${GAME_GLOW[product.game] || ""}`}
                >
                  {/* Product Image */}
                  <Link href={`/fa/products/${product.slug}`} className="block">
                    <ProductImage product={product} />
                  </Link>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col p-5">
                    {/* Description */}
                    <p className="mb-3 text-xs leading-relaxed text-gray-500 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Rating */}
                    <div className="mb-3">
                      <StarRating rating={product.rating} reviewsCount={product.reviewsCount} />
                    </div>

                    {/* Features preview */}
                    {product.features && product.features.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-1.5">
                        {product.features.slice(0, 3).map((f, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-md bg-white/[0.03] border border-white/5 px-2 py-0.5 text-[10px] text-gray-500"
                          >
                            <CheckCircle size={8} className="text-success/70" />
                            {f}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bypass rate */}
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Shield size={12} className="text-success" />
                        <span className="text-[10px] font-semibold text-success">{product.bypassRate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-cyber" />
                        <span className="text-[10px] text-gray-500">Instant</span>
                      </div>
                    </div>

                    {/* Price + CTA */}
                    <div className="mt-auto pt-4 border-t border-white/5">
                      {isFa && tomanRate ? (
                        /* ── FA: Show all available prices in Toman ── */
                        <div className="mb-3 space-y-1.5">
                          {product.priceDaily && (
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-gray-500">روزانه</span>
                              <span className="text-sm font-bold text-gold">{formatPriceByLang(product.priceDaily)}</span>
                            </div>
                          )}
                          {product.priceWeekly && (
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-gray-500">هفتگی</span>
                              <span className="text-sm font-bold text-gold">{formatPriceByLang(product.priceWeekly)}</span>
                            </div>
                          )}
                          {product.priceMonthly && (
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-gray-500">ماهانه</span>
                              <span className="text-base font-bold text-gold">{formatPriceByLang(product.priceMonthly)}</span>
                            </div>
                          )}
                          {product.priceLifetime && (
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-gray-500">مادام‌العمر</span>
                              <span className="text-sm font-bold text-gold">{formatPriceByLang(product.priceLifetime)}</span>
                            </div>
                          )}
                          {!product.priceDaily && !product.priceWeekly && !product.priceMonthly && !product.priceLifetime && (
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-gray-500">قیمت</span>
                              <span className="text-xl font-black text-gold">{formatPriceByLang(product.price)}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* ── EN: Show lowest price in USD ── */
                        <div className="flex items-end justify-between mb-3">
                          <div>
                            <span className="text-2xl font-black text-gold">${getLowestPrice(product).toFixed(2)}</span>
                            <span className="text-[10px] text-gray-600 ml-1">
                              {(() => {
                                const lp = getLowestPrice(product);
                                if (lp === product.priceDaily) return "/day";
                                if (lp === product.priceWeekly) return "/wk";
                                if (lp === product.priceMonthly) return "/mo";
                                if (lp === product.priceLifetime) return " lifetime";
                                return "/mo";
                              })()}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-600 line-through">
                            ${(getLowestPrice(product) * 1.5).toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => triggerDirectPurchase(product)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold transition-all duration-200"
                          style={{
                            background: `linear-gradient(135deg, ${accent}22, ${accent}11)`,
                            border: `1px solid ${accent}40`,
                            color: accent,
                          }}
                        >
                          <Zap size={14} />
                          {t("store.quickView")}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => addToCart(product, "monthly")}
                          className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 text-gray-400 transition-colors hover:border-gold/30 hover:text-gold"
                        >
                          <ShoppingCart size={14} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setQuickViewProduct(product)}
                          className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 text-gray-400 transition-colors hover:border-cyber/30 hover:text-cyber"
                        >
                          <Eye size={14} />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Hover glow border */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      boxShadow: `inset 0 0 0 1px ${accent}22, 0 0 30px ${accent}08`,
                    }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* ── Empty State ────────────────────────────────────────── */}
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-24 text-center"
          >
            <BadgeCheck size={48} className="mx-auto mb-4 text-gray-700" />
            <p className="text-lg text-gray-500">{t("store.noProducts")}</p>
            <p className="mt-1 text-sm text-gray-600">{t("store.noProductsDesc")}</p>
          </motion.div>
        )}
      </div>

      {/* ── Quick View Modal ────────────────────────────────────── */}
      <ProductModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(p) => {
          addToCart(p, "monthly");
          setQuickViewProduct(null);
        }}
        onBuyNow={(p) => {
          setQuickViewProduct(null);
          triggerDirectPurchase(p);
        }}
        t={t}
      />
    </section>
  );
}
