"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { useLang } from "@/context/LangContext";

export default function GoToTop() {
  const { isRTL, translate: t } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className={`fixed bottom-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-obsidian/90 text-gold shadow-lg shadow-gold/20 backdrop-blur-sm transition-colors hover:bg-gold/20 hover:shadow-gold/40 ${isRTL ? "left-6" : "right-6"}`}
          aria-label={t("gotop.aria")}
        >
          <ChevronUp size={22} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
