"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, Headphones, Eye, Fingerprint, ShieldCheck, RefreshCw } from "lucide-react";
import { useLang } from "@/context/LangContext";

const features = [
  { icon: Zap, titleKey: "features.instant.title", descKey: "features.instant.desc", color: "text-gold" },
  { icon: Headphones, titleKey: "features.support.title", descKey: "features.support.desc", color: "text-cyber" },
  { icon: Eye, titleKey: "features.undetected.title", descKey: "features.undetected.desc", color: "text-success" },
  { icon: Fingerprint, titleKey: "features.hwid.title", descKey: "features.hwid.desc", color: "text-gold" },
  { icon: ShieldCheck, titleKey: "features.secure.title", descKey: "features.secure.desc", color: "text-cyber" },
  { icon: RefreshCw, titleKey: "features.update.title", descKey: "features.update.desc", color: "text-success" },
];

export default function Features() {
  const { translate: t } = useLang();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="relative py-24" ref={ref}>
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="font-display text-3xl font-black text-gold-gradient sm:text-4xl lg:text-5xl">
            {t("features.title")}
          </h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.titleKey}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card glass-card-hover group rounded-2xl p-8"
              >
                <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 border border-white/10 transition-transform group-hover:scale-110`}>
                  <Icon size={24} className={feature.color} />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-sm leading-relaxed text-gray-400">
                  {t(feature.descKey)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
