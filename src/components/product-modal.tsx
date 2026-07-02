"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Shield, Star, Zap, ShoppingCart, ChevronLeft, ChevronRight,
  Play, Pause, Volume2, VolumeX, CheckCircle, Clock, ImageIcon,
} from "lucide-react";
import type { Product } from "@/types";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  t: (key: string) => string;
}

const GAME_BADGE: Record<string, string> = {
  "Dota 2": "bg-orange-500/20 text-orange-300",
  "R6 Siege": "bg-blue-500/20 text-blue-300",
  Valorant: "bg-red-500/20 text-red-300",
  CS2: "bg-yellow-500/20 text-yellow-300",
  "Apex Legends": "bg-purple-500/20 text-purple-300",
};

export default function ProductModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
  t,
}: ProductModalProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Reset state when product changes
  useEffect(() => {
    setGalleryIndex(0);
    setAudioPlaying(false);
    setAudioMuted(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [product?.id]);

  // Auto-play audio when modal opens with a product that has audio
  useEffect(() => {
    if (isOpen && product?.audioUrl && audioRef.current) {
      audioRef.current.play().then(() => setAudioPlaying(true)).catch(() => {
        // Autoplay blocked — user will click manually
      });
    }
    if (!isOpen && audioRef.current) {
      audioRef.current.pause();
      setAudioPlaying(false);
    }
  }, [isOpen, product?.audioUrl, product?.id]);

  if (!product) return null;

  // Build gallery: bannerImage + imageUrl + galleryImages
  const gallery: string[] = [];
  if (product.bannerImage) gallery.push(product.bannerImage);
  if (product.imageUrl) gallery.push(product.imageUrl);
  if (product.galleryImages?.length) gallery.push(...product.galleryImages);
  const currentImage = gallery[galleryIndex] || null;

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioRef.current.play().then(() => setAudioPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioMuted;
    setAudioMuted(!audioMuted);
  };

  const formatPrice = () => {
    const parts: string[] = [];
    if (product.priceDaily != null) parts.push(`$${product.priceDaily.toFixed(2)}/day`);
    if (product.priceWeekly != null) parts.push(`$${product.priceWeekly.toFixed(2)}/wk`);
    if (product.priceMonthly != null) parts.push(`$${product.priceMonthly.toFixed(2)}/mo`);
    if (product.priceLifetime != null) parts.push(`$${product.priceLifetime.toFixed(2)}/life`);
    if (parts.length > 0) return parts.join(" · ");
    return `$${product.price.toFixed(2)}`;
  };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.5;
    return Array.from({ length: 5 }, (_, i) => {
      if (i < full) return <Star key={i} size={14} className="fill-gold text-gold" />;
      if (i === full && hasHalf) return <Star key={i} size={14} className="fill-gold/50 text-gold" />;
      return <Star key={i} size={14} className="text-gray-600" />;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[3000] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-obsidian-light border border-white/10 rounded-2xl shadow-2xl shadow-gold/5"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Audio element */}
            {product.audioUrl && (
              <audio
                ref={audioRef}
                src={product.audioUrl}
                loop
                muted={audioMuted}
                className="hidden"
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left: Media Section */}
              <div className="relative">
                {/* Main image / gallery */}
                <div className="relative aspect-square bg-gradient-to-br from-obsidian to-obsidian-light overflow-hidden">
                  {currentImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-24 h-24 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-sm flex items-center justify-center">
                          <Shield size={40} className="text-gold/50" />
                        </div>
                        <span className="text-xs text-gray-600">{t("store.noImage") || "No image"}</span>
                      </div>
                    </div>
                  )}

                  {/* Gallery navigation */}
                  {gallery.length > 1 && (
                    <>
                      <button
                        onClick={() => setGalleryIndex((prev) => (prev - 1 + gallery.length) % gallery.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 border border-white/10 text-white/70 hover:text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setGalleryIndex((prev) => (prev + 1) % gallery.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 border border-white/10 text-white/70 hover:text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                      {/* Dots */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {gallery.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setGalleryIndex(i)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              i === galleryIndex ? "bg-gold w-4" : "bg-white/30 hover:bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Game badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${GAME_BADGE[product.game] || "bg-gray-500/20 text-gray-300"}`}>
                      {product.game}
                    </span>
                  </div>

                  {/* Popular badge */}
                  {product.isPopular && (
                    <div className="absolute top-4 left-24 flex items-center gap-1 rounded-full bg-gold/20 px-2.5 py-1 text-[10px] font-bold text-gold">
                      <span>{"\u{1F525}"}</span> {t("store.sort.popular") || "Popular"}
                    </div>
                  )}
                </div>

                {/* Gallery thumbnails */}
                {gallery.length > 1 && (
                  <div className="flex gap-2 p-3 bg-obsidian/50 border-t border-white/5 overflow-x-auto">
                    {gallery.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setGalleryIndex(i)}
                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                          i === galleryIndex ? "border-gold" : "border-white/10 opacity-60 hover:opacity-100"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Audio player bar */}
                {product.audioUrl && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-obsidian border-t border-white/5">
                    <button
                      onClick={toggleAudio}
                      className="w-9 h-9 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/25 transition-colors"
                    >
                      {audioPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                    </button>
                    <div className="flex-1 flex items-center gap-2">
                      <Volume2 size={12} className="text-gray-500" />
                      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-gold to-gold-dark rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: audioPlaying ? "100%" : "0%" }}
                          transition={{ duration: audioPlaying ? 30 : 0, ease: "linear" }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500">
                        {audioPlaying ? t("store.audioPlaying") || "Playing..." : t("store.audioPaused") || "Paused"}
                      </span>
                    </div>
                    <button onClick={toggleMute} className="text-gray-500 hover:text-white transition-colors">
                      {audioMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                  </div>
                )}

                {/* Video embed */}
                {product.videoUrl && (
                  <div className="border-t border-white/5">
                    <video
                      src={product.videoUrl}
                      controls
                      className="w-full aspect-video bg-black"
                      playsInline
                    />
                  </div>
                )}
              </div>

              {/* Right: Product Info */}
              <div className="p-6 space-y-5">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500 font-medium">{product.category}</span>
                    <span className="text-gray-700">·</span>
                    <span className="text-xs text-gray-500">{product.slug}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white font-display leading-tight">{product.name}</h2>
                </div>

                {/* Rating & Status */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">{renderStars(product.rating)}</div>
                    <span className="text-xs text-gray-400 ml-1">
                      {product.rating} ({product.reviewsCount} {t("store.reviews") || "reviews"})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield size={14} className="text-success" />
                    <span className="text-xs font-medium text-success">{product.bypassRate} Bypass</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`status-dot ${product.updateStatus === "Undetected" ? "status-active" : product.updateStatus === "Testing" ? "status-warning" : "status-danger"}`} />
                    <span className="text-xs text-gray-400">{product.updateStatus}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-400 leading-relaxed">{product.description}</p>

                {/* Features */}
                {product.features?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gold mb-3">
                      {t("store.features") || "Features"}
                    </h4>
                    <ul className="space-y-2">
                      {product.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle size={14} className="text-success mt-0.5 flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Pricing */}
                <div className="border border-white/5 rounded-xl p-4 bg-white/[0.02]">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-gold">{formatPrice()}</span>
                    {product.salePrice != null && product.salePrice < product.price && (
                      <span className="text-sm text-gray-500 line-through">${product.price.toFixed(2)}</span>
                    )}
                  </div>
                  {product.priceMonthly != null && (
                    <p className="text-[10px] text-gray-500">
                      {t("store.monthlyPrice") || "Monthly"} — {t("store.lifetimePriceInfo") || "Lifetime available at 3x"}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onBuyNow(product)}
                    className="btn-gold flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold"
                  >
                    <Zap size={16} />
                    {t("store.buyNow") || "Buy Now"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onAddToCart(product)}
                    className="btn-outline-gold flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold"
                  >
                    <ShoppingCart size={16} />
                    {t("store.addToCart")}
                  </motion.button>
                </div>

                {/* Trust badges */}
                <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <Shield size={12} className="text-success" />
                    {t("store.secureDownload") || "Secure Download"}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <Clock size={12} className="text-cyber" />
                    {t("store.instantDelivery") || "Instant Delivery"}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <ImageIcon size={12} className="text-gold" />
                    {t("store.fullAccess") || "Full Access"}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
