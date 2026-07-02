"use client";

import { motion } from "framer-motion";
import { CheckCircle, Crown, Zap, Shield } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { t } from "@/i18n/translations";

const TIERS = [
  {
    nameKey: "pricing.basic.name",
    price: "$19.99",
    durationKey: "pricing.monthly",
    descriptionKey: "pricing.basic.desc",
    icon: Zap,
    featured: false,
    features: [
      "1 Game Access",
      "Basic Aimbot",
      "Wallhack (ESP)",
      "Email Support",
      "7-Day Update Cycle",
      "Standard Security",
    ],
  },
  {
    nameKey: "pricing.elite.name",
    price: "$39.99",
    durationKey: "pricing.monthly",
    descriptionKey: "pricing.elite.desc",
    icon: Crown,
    featured: true,
    features: [
      "3 Game Access",
      "Advanced Aimbot + Triggerbot",
      "Full ESP Suite",
      "Priority 24/7 Support",
      "Daily Updates",
      "HWID Spoofer Included",
      "Macro Support",
      "Custom Configs",
    ],
  },
  {
    nameKey: "pricing.ultimate.name",
    price: "$79.99",
    durationKey: "pricing.lifetime",
    descriptionKey: "pricing.ultimate.desc",
    icon: Shield,
    featured: false,
    features: [
      "All Games Access",
      "All Premium Features",
      "Lifetime Updates",
      "VIP Support Channel",
      "HWID Spoofer + Spoofer Updates",
      "Custom Feature Requests",
      "Private Discord Access",
      "Early Beta Access",
    ],
  },
];

export default function Pricing() {
  // removed in-view detection
  const { lang } = useLang();

  const title = t('pricing.title', lang);
  const subtitle = t('pricing.subtitle', lang);
  const popular = t('pricing.popular', lang);
  const getStarted = t('pricing.getStarted', lang);

  return (
    <section id="pricing" className="relative py-24">
      {/* Background accent */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(201,150,58,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1280px] px-6">
        {/* Section header */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold-text"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            {subtitle}
          </p>
          <h2
            className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {title.split(' ')[0]} <span className="text-gold-gradient">{title.split(' ').slice(1).join(' ')}</span>
          </h2>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid gap-8 lg:grid-cols-3 lg:items-center">
          {TIERS.map((tier, i) => {
            const Icon = tier.icon;
            return (
              <motion.div
                key={tier.nameKey}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
                className={tier.featured ? "pricing-card pricing-card-featured" : "pricing-card"}
              >
                {/* Most Popular badge */}
                {tier.featured && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-obsidian"
                    style={{ fontFamily: "'Rajdhani', sans-serif" }}
                  >
                    {popular}
                  </div>
                )}

                {/* Icon */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gold/10 border border-gold/20">
                  <Icon size={22} className="text-gold" />
                </div>

                {/* Name */}
                <h3
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {t(tier.nameKey, lang)}
                </h3>

                {/* Description */}
                <p className="mt-1 text-sm text-muted">{t(tier.descriptionKey, lang)}</p>

                {/* Price */}
                <div className="mt-4 mb-6">
                  <span
                    className="text-4xl font-bold text-gold-bright"
                    style={{ fontFamily: "'Rajdhani', sans-serif" }}
                  >
                    {tier.price}
                  </span>
                  <span className="ml-2 text-sm text-muted">/ {t(tier.durationKey, lang)}</span>
                </div>

                {/* Divider */}
                <div className="mb-6 h-px bg-gradient-to-r from-transparent via-card-border to-transparent" />

                {/* Features */}
                <ul className="mb-8 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-muted">
                      <CheckCircle size={16} className="mt-0.5 text-gold flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className={tier.featured ? "btn-gold w-full" : "btn-outline-gold w-full"}
                >
                  {getStarted}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
