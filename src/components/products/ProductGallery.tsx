"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, Image as ImageIcon } from "lucide-react";

interface GalleryItem {
  url: string;
  captionFa?: string;
  captionEn?: string;
  order?: number;
}

interface ProductGalleryProps {
  items: GalleryItem[];
  accent: string;
  isRTL: boolean;
  productName?: string;
}

export function ProductGallery({ items, accent, isRTL, productName = "" }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  const sorted = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const validItems = sorted.filter((item) => item.url && item.url.trim() !== "");
  const current = validItems[selectedIndex];

  const goPrev = useCallback(() => {
    setSelectedIndex((i) => (i - 1 + validItems.length) % validItems.length);
  }, [validItems.length]);

  const goNext = useCallback(() => {
    setSelectedIndex((i) => (i + 1) % validItems.length);
  }, [validItems.length]);

  // Reset index if items change
  useEffect(() => {
    setSelectedIndex(0);
    setImageError({});
  }, [items]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setLightboxOpen(false); setZoomed(false); }
      if (e.key === "ArrowLeft") { isRTL ? goNext() : goPrev(); setZoomed(false); }
      if (e.key === "ArrowRight") { isRTL ? goPrev() : goNext(); setZoomed(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, goPrev, goNext, isRTL]);

  if (validItems.length === 0) return null;

  const caption = isRTL ? current.captionFa : current.captionEn;
  const hasError = imageError[selectedIndex];

  return (
    <>
      {/* Main Image */}
      <div
        className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/5 cursor-pointer group"
        style={{ background: `linear-gradient(135deg, ${accent}15, #0a0e17, #0a0e17)` }}
        onClick={() => {
          setSelectedIndex(validItems.indexOf(current));
          setLightboxOpen(true);
          setZoomed(false);
        }}
      >
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 40%, ${accent}30 0%, transparent 70%)` }}
        />

        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <ImageIcon size={48} className="mx-auto mb-2 text-gray-600" />
              <p className="text-xs text-gray-500">Image not available</p>
            </div>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.url}
            alt={caption ?? productName ?? "Product image"}
            className="absolute inset-0 w-full h-full object-contain p-4"
            onError={() => setImageError((prev) => ({ ...prev, [selectedIndex]: true }))}
          />
        )}

        {/* Zoom hint */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <ZoomIn size={32} className="text-white opacity-0 group-hover:opacity-70 transition-opacity" />
        </div>

        {/* Nav arrows (desktop, >1 image) */}
        {validItems.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 border border-white/10 text-white/70 hover:text-white hover:bg-black/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              style={{ [isRTL ? "right" : "left"]: 12 }}
              aria-label="Previous image"
            >
              {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 border border-white/10 text-white/70 hover:text-white hover:bg-black/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              style={{ [isRTL ? "left" : "right"]: 12 }}
              aria-label="Next image"
            >
              {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
          </>
        )}

        {/* Image counter */}
        {validItems.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[11px] text-white/70 border border-white/10">
            {selectedIndex + 1} / {validItems.length}
          </div>
        )}

        {/* Caption */}
        {caption && (
          <div className="absolute top-3 left-3 right-3">
            <span className="inline-block px-3 py-1.5 rounded-lg text-[11px] font-medium bg-black/50 border border-white/10 text-gray-300 backdrop-blur-md max-w-full truncate">
              {caption}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {validItems.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {validItems.map((item, i) => {
            const isActive = i === selectedIndex;
            const thumbCaption = isRTL ? item.captionFa : item.captionEn;
            return (
              <button
                key={`${item.url}-${i}`}
                type="button"
                onClick={() => {
                  setSelectedIndex(i);
                  setZoomed(false);
                }}
                className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 ${
                  isActive
                    ? "ring-2 ring-offset-1 ring-offset-obsidian"
                    : "border border-white/10 hover:border-white/30"
                }`}
                style={isActive ? { "--tw-ring-color": accent } as React.CSSProperties : undefined}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={thumbCaption ?? `Gallery image ${i + 1}`}
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    // Hide broken thumbnails
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {isActive && (
                  <motion.div
                    layoutId="gallery-active"
                    className="absolute inset-0 rounded-lg"
                    style={{ boxShadow: `inset 0 0 0 2px ${accent}` }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={() => { setLightboxOpen(false); setZoomed(false); }}
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => { setLightboxOpen(false); setZoomed(false); }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Prev */}
            {validItems.length > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goPrev(); setZoomed(false); }}
                className="absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
                style={{ [isRTL ? "right" : "left"]: 20 }}
              >
                {isRTL ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
              </button>
            )}

            {/* Image */}
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={current.url}
                alt={caption ?? productName ?? "Product image"}
                className={`max-w-full max-h-[80vh] object-contain rounded-lg transition-transform duration-300 ${
                  zoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
                }`}
                onClick={(e) => { e.stopPropagation(); setZoomed((z) => !z); }}
              />

              {/* Caption */}
              {caption && (
                <p className="mt-4 text-sm text-gray-300 text-center max-w-lg">
                  {caption}
                </p>
              )}
            </motion.div>

            {/* Next */}
            {validItems.length > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goNext(); setZoomed(false); }}
                className="absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
                style={{ [isRTL ? "left" : "right"]: 20 }}
              >
                {isRTL ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
              </button>
            )}

            {/* Counter */}
            {validItems.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/10 text-xs text-white/70">
                {selectedIndex + 1} / {validItems.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
