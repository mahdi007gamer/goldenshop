"use client";

import { RefObject } from "react";
import { motion } from "framer-motion";
import { useInViewSafe } from "@/hooks/useInViewSafe";
import { Crown, Sparkles } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { t as translate } from "@/i18n/translations";

export default function CTA() {
  const { lang } = useLang();
  const t = (key: string) => translate(key, lang);
  const { ref, isInView } = useInViewSafe<HTMLDivElement>({ once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-24 px-4">
      <div className="relative mx-auto max-w-5xl">
        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-gold/10 via-gold/5 to-cyber/10 blur-2xl" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl border border-gold/20 bg-obsidian-light p-12 text-center sm:p-16"
        >
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,215,0,0.08) 0%, transparent 70%)" }} />
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 border border-gold/20"
            >
              <Crown size={32} className="text-gold" />
            </motion.div>
            <h2 className="font-display text-3xl font-black text-gold-gradient sm:text-5xl">
              {t("cta.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-400">
              {t("cta.subtitle")}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { const el = document.getElementById("products"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}
              className="btn-gold mt-8 inline-flex items-center gap-3 text-lg"
            >
              <Sparkles size={20} />
              {t("cta.button")}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
