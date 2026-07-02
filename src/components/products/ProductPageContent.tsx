"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield, Star, Zap, ShoppingCart, ChevronLeft, ChevronRight,
  CheckCircle, Clock, Play, Sparkles,
  Cpu, Eye, Crosshair, Palette, Radio, EyeOff,
  Pause, RotateCcw,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/context/LangContext";
import { t } from "@/i18n/translations";
import { formatPriceWithRate } from "@/lib/currency";
import { useCurrency } from "@/hooks/useCurrency";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "@/store/toast-store";
import { Navbar } from "@/components/hero/Navbar";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductDescription } from "@/components/products/ProductDescription";
import type { BillingCycle, GalleryItem, FeatureDetail } from "@/types";

// ─── SEO Types ───────────────────────────────────────────────────────────────

interface ProductSEO {
  metaTitle?: string | null;
  metaTitleFa?: string | null;
  metaDescription?: string | null;
  metaDescriptionFa?: string | null;
  focusKeyphrase?: string | null;
  focusKeyphraseFa?: string | null;
  metaKeywords?: string[];
  metaKeywordsFa?: string[];
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: string | null;
  canonicalUrl?: string | null;
  schemaType?: string | null;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  nameFa?: string | null;
  nameEn?: string | null;
  slug: string;
  slugEn?: string | null;
  game: string;
  category: string;
  categoryEn?: string | null;
  price: number;
  salePrice: number | null;
  priceDaily: number | null;
  priceWeekly: number | null;
  priceMonthly: number | null;
  priceLifetime: number | null;
  rating: number;
  reviewsCount: number;
  features: string[];
  featuresFa: string[];
  featuresEn: string[];
  featuresDetail: FeatureDetail[];
  description: string;
  descriptionFa?: string | null;
  descriptionEn?: string | null;
  shortDesc?: string | null;
  shortDescFa?: string | null;
  shortDescEn?: string | null;
  longDescription: string | null;
  isPopular: boolean;
  status: "active" | "inactive";
  bypassRate: string;
  updateStatus: "Undetected" | "Updating" | "Testing";
  imageUrl: string | null;
  bannerImage: string | null;
  galleryImages: string[];
  galleryItems: GalleryItem[];
  videoUrl: string | null;
  audioUrl: string | null;
  createdAt: string;
  updatedAt: string;
  // SEO fields
  metaTitle?: string | null;
  metaTitleFa?: string | null;
  metaTitleEn?: string | null;
  metaDescription?: string | null;
  metaDescriptionFa?: string | null;
  metaDescriptionEn?: string | null;
  focusKeyphrase?: string | null;
  focusKeyphraseFa?: string | null;
  focusKeyphraseEn?: string | null;
  metaKeywords?: string[];
  metaKeywordsFa?: string[];
  metaKeywordsEn?: string[];
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogTitleEn?: string | null;
  ogDescriptionEn?: string | null;
  ogImage?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterTitleEn?: string | null;
  twitterDescriptionEn?: string | null;
  twitterImage?: string | null;
  canonicalUrl?: string | null;
  schemaType?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  Aimbot: Crosshair,
  "ESP Overlay": EyeOff,
  Wallhack: Eye,
  "HWID Spoofer": Cpu,
  "Skin Changer": Palette,
  Radar: Radio,
};

const GAME_ACCENT: Record<string, string> = {
  "Dota 2": "#C9963A",
  "R6 Siege": "#4A90D9",
  Valorant: "#FF4655",
  CS2: "#E8B030",
  "Apex Legends": "#9B59B6",
};

const BILLING_CYCLES: BillingCycle[] = ["daily", "weekly", "monthly", "lifetime"];

// ─── Audio Player ────────────────────────────────────────────────────────────

function AudioPlayer({ src, accent }: { src: string; accent: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  const onTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };
  const onLoaded = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };
  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = v;
    setCurrentTime(v);
  };
  const restart = () => {
    if (audioRef.current) { audioRef.current.currentTime = 0; setCurrentTime(0); }
  };
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-xl p-4 border" style={{ background: `${accent}08`, borderColor: `${accent}20` }}>
      <audio ref={audioRef} src={src} onTimeUpdate={onTimeUpdate} onLoadedMetadata={onLoaded} onEnded={() => setPlaying(false)} />
      <div className="flex items-center gap-3">
        <button onClick={toggle} className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors" style={{ background: accent, color: "#0a0e17" }}>
          {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>
        <button onClick={restart} className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-white/10 text-gray-400 hover:text-white transition-colors">
          <RotateCcw size={12} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="relative h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="absolute inset-y-0 left-0 rounded-full transition-all" style={{ width: `${progress}%`, background: accent }} />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-gray-500">
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>
        <input type="range" min={0} max={duration || 0} value={currentTime} onChange={seek} className="sr-only" />
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ProductPageContent() {
  const params = useParams();
  const router = useRouter();
  const { lang, isRTL } = useLang();
  const dir = isRTL ? "rtl" : "ltr";
  const isFa = lang === "fa";
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>("monthly");
  const [addedToCart, setAddedToCart] = useState(false);
  const { rate } = useCurrency();

  // Reviews state
  const [reviews, setReviews] = useState<Array<{
    id: string; rating: number; comment: string | null;
    createdAt: string; user: { id: string; username: string; avatar: string | null };
  }>>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [canReview, setCanReview] = useState<{ canReview: boolean; reason?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const cartAddItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  const sessionToken = typeof document !== "undefined"
    ? document.cookie.split("; ").find((r) => r.startsWith("gc_session="))?.split("=")[1] || null
    : null;

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setProduct(json.data);
          const p = json.data;
          if (p.priceDaily) setSelectedCycle("daily");
          else if (p.priceWeekly) setSelectedCycle("weekly");
          else if (p.priceMonthly) setSelectedCycle("monthly");
          else if (p.priceLifetime) setSelectedCycle("lifetime");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  // ─── Fetch reviews after product loads ─────────────────────────────────

  useEffect(() => {
    if (!product) return;
    const pid = product.id;
    let cancelled = false;

    async function fetchReviews() {
      setReviewsLoading(true);
      try {
        const res = await fetch(`/api/products/${pid}/reviews`);
        const json = await res.json();
        if (json.success && !cancelled) setReviews(json.data.reviews);
      } catch { /* ignore */ }
      if (!cancelled) setReviewsLoading(false);
    }

    async function fetchCanReview() {
      try {
        const res = await fetch(`/api/products/${pid}/reviews/can-review`);
        const json = await res.json();
        if (!cancelled) setCanReview(json.data);
      } catch { /* ignore */ }
    }

    fetchReviews();
    fetchCanReview();
    return () => { cancelled = true; };
  }, [product]);

  const submitReview = async () => {
    if (!product || reviewRating === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment || null }),
      });
      const json = await res.json();
      if (json.success) {
        setReviews((prev) => [json.data, ...prev]);
        setReviewRating(0);
        setReviewComment("");
        setReviewSubmitted(true);
        setCanReview({ canReview: false, reason: "ALREADY_REVIEWED" });
        toast.success(t("reviews.thanksRating", lang));
        // Refresh product rating
        const pres = await fetch(`/api/products/${slug}`);
        const pj = await pres.json();
        if (pj.success && pj.data) setProduct(pj.data);
      } else {
        toast.error(json.error?.message || "Failed to submit review");
      }
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── SEO: Dynamic meta tags + JSON-LD (always runs, guards inside) ──────

  useEffect(() => {
    if (!product) return;

    const seoTitle = isFa
      ? (product.metaTitleFa || product.metaTitle || product.name)
      : (product.metaTitleEn || product.metaTitle || product.nameEn || product.name);
    const seoDesc = isFa
      ? (product.metaDescriptionFa || product.metaDescription || product.shortDesc || "")
      : (product.metaDescriptionEn || product.metaDescription || product.shortDescEn || product.shortDesc || "");
    const seoOgTitle = isFa
      ? (product.metaTitleFa || product.ogTitle || product.metaTitle || product.name)
      : (product.ogTitleEn || product.metaTitleEn || product.ogTitle || product.metaTitle || product.nameEn || product.name);
    const seoOgDesc = isFa
      ? (product.metaDescriptionFa || product.ogDescription || product.metaDescription || product.shortDesc || "")
      : (product.ogDescriptionEn || product.metaDescriptionEn || product.ogDescription || product.metaDescription || product.shortDescEn || product.shortDesc || "");
    const seoOgImage = product.ogImage || product.imageUrl || product.bannerImage || "";
    const seoSlug = isFa ? product.slug : (product.slugEn || product.slug);
    const seoCanonical = product.canonicalUrl || `https://goldencheat.com/${lang}/products/${seoSlug}`;
    const seoKeywords = isFa
      ? (product.metaKeywordsFa?.length ? product.metaKeywordsFa : product.metaKeywords)
      : (product.metaKeywordsEn?.length ? product.metaKeywordsEn : product.metaKeywords);

    document.title = seoTitle;

    const setMeta = (name: string, content: string, isProperty = false) => {
      if (!content) return;
      const attr = isProperty ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (el) {
        el.setAttribute("content", content);
      } else {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        el.setAttribute("content", content);
        document.head.appendChild(el);
      }
    };

    setMeta("description", seoDesc);
    setMeta("keywords", seoKeywords?.join(", ") || "");
    setMeta("og:title", seoOgTitle, true);
    setMeta("og:description", seoOgDesc, true);
    setMeta("og:image", seoOgImage, true);
    setMeta("og:url", seoCanonical, true);
    setMeta("og:type", "product", true);
    setMeta("og:site_name", "Golden Cheat", true);
    const twTitle = isFa
      ? (product.twitterTitle || seoOgTitle)
      : (product.twitterTitleEn || product.twitterTitle || seoOgTitle);
    const twDesc = isFa
      ? (product.twitterDescription || seoOgDesc)
      : (product.twitterDescriptionEn || product.twitterDescription || seoOgDesc);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", twTitle);
    setMeta("twitter:description", twDesc);
    setMeta("twitter:image", product.twitterImage || seoOgImage);

    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute("href", seoCanonical);

    // JSON-LD
    const existingScript = document.querySelector('script[type="application/ld+json"][data-product-seo]');
    if (existingScript) existingScript.remove();

    const schemaType = product.schemaType || "Product";
    const offers: Record<string, unknown>[] = [];
    if (product.priceDaily) offers.push({ "@type": "Offer", price: product.priceDaily, priceCurrency: "USD", name: "Daily", availability: "https://schema.org/InStock" });
    if (product.priceWeekly) offers.push({ "@type": "Offer", price: product.priceWeekly, priceCurrency: "USD", name: "Weekly", availability: "https://schema.org/InStock" });
    if (product.priceMonthly) offers.push({ "@type": "Offer", price: product.priceMonthly, priceCurrency: "USD", name: "Monthly", availability: "https://schema.org/InStock" });
    if (product.priceLifetime) offers.push({ "@type": "Offer", price: product.priceLifetime, priceCurrency: "USD", name: "Lifetime", availability: "https://schema.org/InStock" });
    if (offers.length === 0) offers.push({ "@type": "Offer", price: product.price, priceCurrency: "USD", availability: "https://schema.org/InStock" });

    const jsonLdName = isFa ? (product.nameFa || product.name) : (product.nameEn || product.name);
    const jsonLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": schemaType,
      name: jsonLdName,
      description: seoDesc,
      url: seoCanonical,
      image: seoOgImage,
      brand: { "@type": "Brand", name: "Golden Cheat" },
      category: isFa ? (product.category || "") : (product.categoryEn || product.category || ""),
      keywords: seoKeywords?.join(", ") || "",
      offers: offers.length === 1 ? offers[0] : { "@type": "AggregateOffer", lowPrice: Math.min(...offers.map(o => o.price as number)), highPrice: Math.max(...offers.map(o => o.price as number)), priceCurrency: "USD", offerCount: offers.length, offers },
    };

    const script = document.createElement("script");
    script.setAttribute("type", "application/ld+json");
    script.setAttribute("data-product-seo", "true");
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      const cleanup = document.querySelector('script[type="application/ld+json"][data-product-seo]');
      if (cleanup) cleanup.remove();
    };
  }, [product, isFa]);

  const getCyclePrice = (): number => {
    if (!product) return 0;
    switch (selectedCycle) {
      case "daily": return product.priceDaily ?? product.price;
      case "weekly": return product.priceWeekly ?? product.price;
      case "monthly": return product.priceMonthly ?? product.price;
      case "lifetime": return product.priceLifetime ?? product.price * 3;
      default: return product.price;
    }
  };

  const cyclePrice = getCyclePrice();
  const accent = GAME_ACCENT[product?.game ?? ""] || "#C9963A";
  const IconComp = CATEGORY_ICONS[product?.category ?? ""] || Crosshair;

  const isInCart = product
    ? cartItems.some((item) => item.product.id === product.id && item.billingCycle === selectedCycle)
    : false;

  const addToCart = () => {
    if (!product) return;
    cartAddItem(product, selectedCycle);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const buyNow = () => {
    addToCart();
    router.push("/cart");
  };

  // ─── Loading ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#05080E" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">{t("common.loading", lang)}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#05080E" }}>
        <div className="text-center">
          <Shield size={48} className="mx-auto mb-4 text-gray-700" />
          <p className="text-lg text-gray-500 mb-4">Product not found</p>
          <Link href="/#products" className="btn-gold !px-6 !py-2 text-sm">{t("product.backToShop", lang)}</Link>
        </div>
      </div>
    );
  }

  // ─── Derived data ────────────────────────────────────────────────────────

  const statusColor =
    product.updateStatus === "Undetected" ? "#00ff88"
    : product.updateStatus === "Testing" ? "#eab308"
    : "#ef4444";

  const statusLabel =
    product.updateStatus === "Undetected" ? t("product.undetected", lang)
    : product.updateStatus === "Testing" ? t("product.testing", lang)
    : t("product.updating", lang);

  const displayName = isFa
    ? (product.nameFa || product.name)
    : (product.nameEn || product.name);
  const displayDesc = isFa
    ? (product.descriptionFa || product.description)
    : (product.descriptionEn || product.description);
  const displayShortDesc = isFa
    ? (product.shortDescFa || product.shortDesc)
    : (product.shortDescEn || product.shortDesc);
  const displayFeatures = isFa
    ? (product.featuresFa?.length ? product.featuresFa : product.features)
    : (product.featuresEn?.length ? product.featuresEn : product.features);
  const displayFeaturesDetail = product.featuresDetail?.length ? product.featuresDetail : [];

  // Build gallery items: merge rich galleryItems with simple galleryImages (deduplicate by URL)
  const richItems: GalleryItem[] = Array.isArray(product.galleryItems) ? product.galleryItems : [];
  const simpleUrls: string[] = Array.isArray(product.galleryImages) ? product.galleryImages : [];
  const existingUrls = new Set(richItems.map((item) => item.url));
  const additionalItems: GalleryItem[] = simpleUrls
    .filter((url) => url && !existingUrls.has(url))
    .map((url, i) => ({ url, order: richItems.length + i }));
  const galleryItems: GalleryItem[] = [...richItems, ...additionalItems]
    .filter((item) => item.url && item.url.trim() !== "")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen text-white" style={{ backgroundColor: "#05080E" }} dir={dir}>
      <Navbar />
      <div className="smoke" />

      <main className="relative pt-24 pb-20 px-4">
        <div className="mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <Link
            href="/#products"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gold transition-colors mb-8 group"
          >
            {isRTL ? (
              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            ) : (
              <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            )}
            {t("product.backToShop", lang)}
          </Link>

          {/* ── Banner Hero ─────────────────────────────────────────────── */}
          {product.bannerImage && (
            <div className="relative mb-10 rounded-2xl overflow-hidden border border-white/5 h-48 sm:h-64 lg:h-80">
              <div className="absolute inset-0">
                <img src={product.bannerImage} alt={displayName} className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#05080E] via-[#05080E]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#05080E]/80 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg text-xs font-bold border backdrop-blur-md" style={{ backgroundColor: `${accent}20`, borderColor: `${accent}40`, color: accent }}>
                    {product.game}
                  </span>
                  <span className="px-3 py-1 rounded-lg text-xs font-bold border backdrop-blur-md border-white/10 text-white/80">
                    {product.category}
                  </span>
                  {product.isPopular && (
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gold/15 border border-gold/30 text-gold backdrop-blur-md flex items-center gap-1">
                      <Sparkles size={12} /> Popular
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: statusColor, boxShadow: `0 0 8px ${statusColor}` }} />
                  <span className="text-xs font-medium text-white/80">{statusLabel}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Top section: Gallery + Info ─────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Gallery */}
            <div className="space-y-4">
              {galleryItems.length > 0 ? (
                <ProductGallery items={galleryItems} accent={accent} isRTL={isRTL} />
              ) : (
                <div
                  className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/5"
                  style={{ background: `linear-gradient(135deg, ${accent}15, #0a0e17, #0a0e17)` }}
                >
                  <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 40%, ${accent}30 0%, transparent 70%)` }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-28 w-28 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-sm flex items-center justify-center" style={{ borderColor: `${accent}33` }}>
                      <IconComp size={48} style={{ color: `${accent}88` }} />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold border backdrop-blur-md" style={{ backgroundColor: `${accent}15`, borderColor: `${accent}30`, color: accent }}>
                      {product.game}
                    </span>
                    {product.isPopular && (
                      <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gold/15 border border-gold/30 text-gold backdrop-blur-md flex items-center gap-1">
                        <Sparkles size={12} /> Popular
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Video */}
              {product.videoUrl && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold/70">{t("product.video", lang)}</h3>
                  <video src={product.videoUrl} controls className="w-full aspect-video bg-black rounded-xl" playsInline />
                </div>
              )}

              {/* Audio */}
              {product.audioUrl && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold/70">{t("product.audio", lang)}</h3>
                  <AudioPlayer src={product.audioUrl} accent={accent} />
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="space-y-5">
              {/* Status bar */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: statusColor, boxShadow: `0 0 8px ${statusColor}` }} />
                  <span className="text-sm text-gray-400">{statusLabel}</span>
                </div>
                <span className="text-gray-700">·</span>
                <span className="text-sm text-gray-500">{product.category}</span>
                <span className="text-gray-700">·</span>
                <span className="text-sm text-gray-500">{product.game}</span>
              </div>

              {/* Title */}
              <h1
                className="text-3xl lg:text-4xl font-black text-white font-display leading-tight"
                style={{ fontFamily: isRTL ? "'Vazirmatn', sans-serif" : "'Rajdhani', sans-serif" }}
              >
                {displayName}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} className={s <= Math.round(product.rating) ? "fill-gold text-gold" : "text-gray-700"} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {product.rating.toFixed(1)} ({product.reviewsCount} {t("product.reviews", lang)})
                </span>
              </div>

              {/* Short Description */}
              {displayShortDesc && <p className="text-gray-400 leading-relaxed">{displayShortDesc}</p>}

              {/* ── Pricing Plan Selector ──────────────────────────────── */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gold/70">{t("product.selectPlan", lang)}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {BILLING_CYCLES.map((cycle) => {
                    const price = (() => {
                      switch (cycle) {
                        case "daily": return product.priceDaily;
                        case "weekly": return product.priceWeekly;
                        case "monthly": return product.priceMonthly;
                        case "lifetime": return product.priceLifetime;
                      }
                    })();
                    if (price == null) return null;

                    const isSelected = selectedCycle === cycle;
                    const cycleLabel = t(`product.${cycle}`, lang);
                    const cyclePer = t(`product.per${cycle.charAt(0).toUpperCase() + cycle.slice(1)}`, lang);

                    return (
                      <button
                        key={cycle}
                        onClick={() => setSelectedCycle(cycle)}
                        className="relative rounded-xl p-3 text-left transition-all duration-200 border"
                        style={{
                          background: isSelected ? `${accent}12` : "rgba(255,255,255,0.02)",
                          borderColor: isSelected ? `${accent}60` : "rgba(255,255,255,0.06)",
                          boxShadow: isSelected ? `0 0 20px ${accent}15` : "none",
                        }}
                      >
                        {isSelected && (
                          <div className="absolute top-2 w-2 h-2 rounded-full" style={{ [isRTL ? "left" : "right"]: "0.5rem", background: accent }} />
                        )}
                        <div className="text-xs text-gray-400 mb-1">{cycleLabel}</div>
                        <div className="text-lg font-bold" style={{ color: isSelected ? accent : "#fff", fontFamily: "'Rajdhani', sans-serif" }}>
                          {rate ? formatPriceWithRate(price, rate, lang) : `$${price.toFixed(2)}`}
                        </div>
                        {/* Debug subtitle showing raw USD */}
                        {isFa && rate && <div className="text-[9px] text-gray-600 mt-0.5">${price.toFixed(2)}</div>}
                        {cycle !== "lifetime" && <div className="text-[10px] text-gray-600 mt-0.5">/{cyclePer}</div>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Action Buttons ─────────────────────────────────────── */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={buyNow}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                    color: "#0a0e17",
                    boxShadow: `0 4px 20px ${accent}30`,
                    fontFamily: isRTL ? "'Vazirmatn', sans-serif" : "'Rajdhani', sans-serif",
                  }}
                >
                  <Zap size={18} />
                  {t("product.buyNow", lang)}
                </button>
                <button
                  onClick={addToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold rounded-xl border transition-all duration-200 ${
                    addedToCart || isInCart ? "border-success bg-success/10 text-success" : "border-white/10 bg-white/5 text-white hover:border-gold/30 hover:bg-gold/5"
                  }`}
                  style={{ fontFamily: isRTL ? "'Vazirmatn', sans-serif" : "'Rajdhani', sans-serif" }}
                >
                  {addedToCart || isInCart ? <CheckCircle size={18} /> : <ShoppingCart size={18} />}
                  {addedToCart || isInCart ? t("toast.addedToCart", lang) : t("product.addToCart", lang)}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <Shield size={18} className="text-success" />
                  <span className="text-[10px] text-gray-500 font-medium">{t("product.secureDownload", lang)}</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <Clock size={18} className="text-cyber" />
                  <span className="text-[10px] text-gray-500 font-medium">{t("product.instantDelivery", lang)}</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <Zap size={18} className="text-gold" />
                  <span className="text-[10px] text-gray-500 font-medium">{t("product.support247", lang)}</span>
                </div>
              </div>

              {/* Simple Features (if no structured features) */}
              {displayFeaturesDetail.length === 0 && displayFeatures.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gold/70">{t("product.keyFeatures", lang)}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {displayFeatures.map((f, i) => (
                      <div key={i} className="flex items-start gap-2.5 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
                        <CheckCircle size={14} className="text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Bottom section: Full Description ────────────────────────── */}
          <div className="mt-12 pt-8 border-t border-white/5">
            <ProductDescription
              description={displayDesc}
              features={displayFeatures}
              featuresDetail={displayFeaturesDetail}
              shortDesc={null} // already shown above
              accent={accent}
              isRTL={isRTL}
              dir={dir}
            />
          </div>

          {/* ── Reviews Section ──────────────────────────────────────────── */}
          {product && (
            <div className="mt-12 pt-8 border-t border-white/5">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2
                    className="text-xl font-bold text-white"
                    style={{ fontFamily: isRTL ? "'Vazirmatn'" : "'Rajdhani', sans-serif" }}
                  >
                    {t("reviews.title", lang)}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{t("reviews.subtitle", lang)}</p>
                </div>
                {product.reviewsCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={18} className={s <= Math.round(product.rating) ? "fill-gold text-gold" : "text-gray-700"} />
                      ))}
                    </div>
                    <span className="text-lg font-bold text-gold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                      {product.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({product.reviewsCount} {t("product.reviews", lang)})
                    </span>
                  </div>
                )}
              </div>

              {/* Review Form */}
              {canReview && (
                <div className="mb-8 rounded-xl border border-white/10 bg-white/[0.02] p-5">
                  {canReview.canReview ? (
                    <div>
                      <h3
                        className="text-sm font-bold text-white mb-4"
                        style={{ fontFamily: isRTL ? "'Vazirmatn'" : "'Rajdhani', sans-serif" }}
                      >
                        {t("reviews.writeReview", lang)}
                      </h3>
                      {/* Star selector */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs text-gray-400">{t("reviews.outOf5", lang)}:</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setReviewRating(s)}
                              onMouseEnter={() => setReviewHover(s)}
                              onMouseLeave={() => setReviewHover(0)}
                              className="p-0.5 transition-transform hover:scale-110"
                            >
                              <Star
                                size={24}
                                className={
                                  s <= (reviewHover || reviewRating)
                                    ? "fill-gold text-gold"
                                    : "text-gray-700"
                                }
                              />
                            </button>
                          ))}
                        </div>
                        {reviewRating > 0 && (
                          <span className="text-xs text-gold font-bold" style={{ fontFamily: "'Rajdhani'" }}>
                            {reviewRating}/5
                          </span>
                        )}
                      </div>
                      {/* Comment textarea */}
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder={t("reviews.placeholder", lang)}
                        maxLength={1000}
                        rows={3}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-gold/40 transition-colors resize-vertical"
                        dir={dir}
                        style={{ fontFamily: isRTL ? "'Vazirmatn'" : "'Inter', sans-serif" }}
                      />
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[10px] text-gray-600">{reviewComment.length}/1000</span>
                        <button
                          onClick={submitReview}
                          disabled={reviewRating === 0 || submitting}
                          className="px-5 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{
                            background: reviewRating > 0 ? `linear-gradient(135deg, ${accent}, ${accent}cc)` : "rgba(255,255,255,0.05)",
                            color: reviewRating > 0 ? "#0a0e17" : "rgba(255,255,255,0.3)",
                            fontFamily: isRTL ? "'Vazirmatn'" : "'Rajdhani', sans-serif",
                          }}
                        >
                          {submitting ? "..." : t("reviews.submit", lang)}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 py-2">
                      {canReview.reason === "UNAUTHORIZED" ? (
                        <Link
                          href={`/login?redirect=/products/${slug}`}
                          className="text-sm text-gold hover:underline"
                          style={{ fontFamily: isRTL ? "'Vazirmatn'" : "'Inter', sans-serif" }}
                        >
                          {t("reviews.loginRequired", lang)}
                        </Link>
                      ) : canReview.reason === "ALREADY_REVIEWED" ? (
                        <span className="text-sm text-gray-400" style={{ fontFamily: isRTL ? "'Vazirmatn'" : "'Inter', sans-serif" }}>
                          {t("reviews.alreadyReviewed", lang)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400" style={{ fontFamily: isRTL ? "'Vazirmatn'" : "'Inter', sans-serif" }}>
                          {t("reviews.purchaseRequired", lang)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Reviews list */}
              {reviewsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <Star size={32} className="mx-auto mb-3 text-gray-700" />
                  <p className="text-sm text-gray-500" style={{ fontFamily: isRTL ? "'Vazirmatn'" : "'Inter', sans-serif" }}>
                    {t("reviews.noReviews", lang)}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{
                              background: `${accent}20`,
                              color: accent,
                              fontFamily: "'Rajdhani', sans-serif",
                            }}
                          >
                            {review.user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white" style={{ fontFamily: isRTL ? "'Vazirmatn'" : "'Inter', sans-serif" }}>
                                {review.user.username}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success font-bold" style={{ fontFamily: "'Rajdhani'" }}>
                                {t("reviews.verifiedPurchase", lang)}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-600">
                              {new Date(review.createdAt).toLocaleDateString(isFa ? "fa-IR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={14} className={s <= review.rating ? "fill-gold text-gold" : "text-gray-700"} />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-300 leading-relaxed mt-2" dir={dir} style={{ fontFamily: isRTL ? "'Vazirmatn'" : "'Inter', sans-serif" }}>
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
