"use client";

import { motion } from "framer-motion";
import { MessageCircle, AtSign, Code } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { t } from "@/i18n/translations";

const socialLinks = [
  { icon: MessageCircle, label: "Discord", href: "#" },
  { icon: AtSign, label: "Twitter", href: "#" },
  { icon: Code, label: "Telegram", href: "#" },
];

export default function Footer() {
  const { lang, isRTL } = useLang();
  const fontFa = isRTL ? "'Vazirmatn', sans-serif" : "'Inter', sans-serif";
  const fontEn = "'Rajdhani', sans-serif";

  return (
    <footer className="relative mt-20" style={{ backgroundColor: "#06090F" }}>
      {/* Gold top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-card-border to-transparent" />

      {/* Main footer */}
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M2 17L4 5L8 10L12 3L16 10L20 5L22 17H2Z"
                  stroke="#C9963A"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  fill="rgba(201,150,58,0.15)"
                />
                <path d="M2 17H22V20H2V17Z" fill="#C9963A" opacity="0.8" />
                <circle cx="4" cy="5" r="1.5" fill="#F0C060" />
                <circle cx="12" cy="3" r="1.5" fill="#F0C060" />
                <circle cx="20" cy="5" r="1.5" fill="#F0C060" />
              </svg>
              <span
                className="text-gold-gradient text-base font-bold"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                GOLDEN CHEAT
              </span>
            </div>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted" style={{ fontFamily: fontFa }}>
              {t('footer.description', lang)}
            </p>

            {/* Social icons */}
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-card-border bg-white/5 text-muted transition-colors hover:bg-gold/10 hover:text-gold hover:border-gold/30"
                  aria-label={social.label}
                >
                  <social.icon size={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h4
              className="mb-4 text-xs font-bold uppercase tracking-wider text-white"
              style={{ fontFamily: fontEn, letterSpacing: "0.1em" }}
            >
              {t('footer.products', lang)}
            </h4>
            <ul className="space-y-2.5">
              {["Valorant", "CS2", "Dota 2", "R6 Siege", "Apex Legends"].map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-muted transition-colors hover:text-gold" style={{ fontFamily: fontFa }}>
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4
              className="mb-4 text-xs font-bold uppercase tracking-wider text-white"
              style={{ fontFamily: fontEn, letterSpacing: "0.1em" }}
            >
              {t('footer.company', lang)}
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: t('nav.faq', lang), href: '/#faq' },
                { label: t('footer.contact', lang), href: '#' },
                { label: 'Discord Server', href: '#' },
                { label: t('nav.support', lang), href: '#' },
              ].map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-muted transition-colors hover:text-gold" style={{ fontFamily: fontFa }}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4
              className="mb-4 text-xs font-bold uppercase tracking-wider text-white"
              style={{ fontFamily: fontEn, letterSpacing: "0.1em" }}
            >
              {t('footer.legal', lang)}
            </h4>
            <ul className="space-y-2.5">
              {[t('footer.terms', lang), t('footer.privacy', lang), 'Refund Policy', 'Disclaimer'].map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-muted transition-colors hover:text-gold" style={{ fontFamily: fontFa }}>
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div
          className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row"
        >
          <p className="text-xs text-muted" style={{ fontFamily: fontFa }}>
            &copy; {new Date().getFullYear()} Golden Cheat. {t('footer.rights', lang)}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_6px_#00ff88]" />
              {t('footer.status', lang)}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
