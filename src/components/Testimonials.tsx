"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInViewSafe } from "@/hooks/useInViewSafe";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { INITIAL_TESTIMONIALS } from "@/data/mockData";
import { useLang } from "@/context/LangContext";

export default function Testimonials() {
  const { isRTL, translate: t } = useLang();
  const faFont = { fontFamily: "'Vazirmatn', 'Inter', sans-serif" };
  const { ref, isInView } = useInViewSafe<HTMLDivElement>({ once: true, margin: "-100px" });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const itemsPerView = 3;
  const maxIndex = Math.max(0, INITIAL_TESTIMONIALS.length - itemsPerView);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, maxIndex]);

  const next = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };
  const prev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={14} className={i < rating ? "fill-gold text-gold" : "text-gray-600"} />
    ));

  // RTL: reverse the slide direction by negating the x offset
  const slideX = isRTL
    ? `${currentIndex * (100 / itemsPerView + 2)}%`
    : `-${currentIndex * (100 / itemsPerView + 2)}%`;

  return (
    <section ref={ref as React.RefObject<HTMLDivElement>} className="relative py-24 px-4" id="testimonials">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent" />
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col items-center justify-between gap-4 sm:flex-row"
        >
          <div style={faFont}>
            <h2 className="text-3xl font-black text-gold-gradient sm:text-4xl" style={faFont}>
              {t("testimonials.title")}
            </h2>
            <p className="mt-2 text-gray-300" style={faFont}>{t("testimonials.subtitle")}</p>
          </div>
          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/20 bg-white/5 text-gold transition-colors hover:bg-gold/10"
            >
              {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/20 bg-white/5 text-gold transition-colors hover:bg-gold/10"
            >
              {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </motion.button>
          </div>
        </motion.div>

        <div className="overflow-hidden">
          <motion.div
            className="flex gap-6"
            animate={{ x: slideX }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {INITIAL_TESTIMONIALS.map((testimonial) => (
              <motion.div key={testimonial.id}
                className="glass-card glass-card-hover w-full min-w-[320px] flex-shrink-0 rounded-2xl p-6 sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                dir="rtl"
              >
                <Quote size={24} className="mb-4 text-gold/30" />
                <div className="mb-3 flex gap-0.5" dir="ltr">{renderStars(testimonial.rating)}</div>
                <p className="mb-6 text-sm leading-relaxed text-gray-200" style={faFont}>«{testimonial.text}»</p>
                <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-xs font-bold text-gold" style={faFont}>
                    {testimonial.avatar}
                  </div>
                  <div style={faFont}>
                    <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                    <p className="text-xs text-gray-400">{testimonial.game}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }, (_, i) => (
            <button key={i} onClick={() => { setCurrentIndex(i); setIsAutoPlaying(false); }}
              className={`h-2 rounded-full transition-all ${i === currentIndex ? "w-8 bg-gold" : "w-2 bg-white/20 hover:bg-white/40"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
