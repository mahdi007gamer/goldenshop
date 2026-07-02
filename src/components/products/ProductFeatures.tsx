"use client";

import { motion } from "framer-motion";
import {
  Shield, Zap, Clock, Cpu, Eye, Crosshair, Palette, Radio,
  Star, CheckCircle, Download, RefreshCw, Headphones,
  Target, Lock, Wifi, Monitor, Gamepad2, Brain, Rocket,
  type LucideIcon,
} from "lucide-react";

interface FeatureDetail {
  titleFa: string;
  titleEn: string;
  descriptionFa?: string;
  descriptionEn?: string;
  icon?: string;
}

interface ProductFeaturesProps {
  features: string[];
  featuresDetail: FeatureDetail[];
  accent: string;
  isRTL: boolean;
  dir: "rtl" | "ltr";
}

const ICON_MAP: Record<string, LucideIcon> = {
  Shield, Zap, Clock, Cpu, Eye, Crosshair, Palette, Radio,
  Star, CheckCircle, Download, RefreshCw, Headphones,
  Target, Lock, Wifi, Monitor, Gamepad2, Brain, Rocket,
};

function resolveIcon(name?: string): LucideIcon {
  if (!name) return CheckCircle;
  return ICON_MAP[name] ?? CheckCircle;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Renders ONLY the product features (structured + simple).
 * Used inside the side-by-side section next to the gallery.
 */
export function ProductFeatures({
  features,
  featuresDetail,
  accent,
  isRTL,
  dir,
}: ProductFeaturesProps) {
  const hasDetailFeatures = featuresDetail && featuresDetail.length > 0;
  const hasSimpleFeatures = features && features.length > 0;
  if (!hasDetailFeatures && !hasSimpleFeatures) return null;

  return (
    <div dir={dir} className="space-y-3">
      {/* Structured Features (with icons) */}
      {hasDetailFeatures && (
        <motion.div
          className="flex flex-col gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {featuresDetail.map((f, i) => {
            const Icon = resolveIcon(f.icon);
            const title = isRTL ? f.titleFa : f.titleEn;
            const desc = isRTL ? (f.descriptionFa || f.titleFa) : (f.descriptionEn || f.titleEn);
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3.5"
                whileHover={{ borderColor: `${accent}30`, backgroundColor: `${accent}08` }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${accent}18` }}
                >
                  <Icon size={20} style={{ color: accent }} />
                </div>
                <div className="min-w-0 space-y-1">
                  <span className="text-sm font-semibold text-gray-100 block">{title}</span>
                  {(f.descriptionEn || f.descriptionFa) && (
                    <span className="text-xs text-gray-400 leading-relaxed block">{desc}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Simple text features (fallback) */}
      {!hasDetailFeatures && hasSimpleFeatures && (
        <motion.div
          className="flex flex-col gap-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="flex items-start gap-2.5 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5"
            >
              <CheckCircle size={14} className="text-success mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-300">{f}</span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
