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

interface ProductDescriptionProps {
  description: string;
  features: string[];
  featuresDetail: FeatureDetail[];
  shortDesc?: string | null;
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

export function ProductDescription({
  description,
  features,
  featuresDetail,
  shortDesc,
  accent,
  isRTL,
  dir,
}: ProductDescriptionProps) {
  const hasDetailFeatures = featuresDetail && featuresDetail.length > 0;
  const hasSimpleFeatures = features && features.length > 0;

  return (
    <div dir={dir} className="space-y-8">
      {/* Short Description */}
      {shortDesc && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base leading-relaxed"
          style={{ color: `${accent}cc` }}
        >
          {shortDesc}
        </motion.p>
      )}

      {/* Long Description — rendered with dangerouslySetInnerHTML + comprehensive CSS */}
      {description && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: `${accent}99` }}>
            {isRTL ? 'توضیحات کامل' : 'Full Description'}
          </h3>
          <div
            className="rounded-xl p-5 border leading-relaxed text-gray-300 rich-description"
            style={{
              borderColor: `${accent}18`,
              background: `${accent}06`,
            }}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      )}

      {/* Structured Features (with icons) — enhanced with descriptions */}
      {hasDetailFeatures && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: `${accent}99` }}>
            {isRTL ? 'ویژگی‌های محصول' : 'Product Features'}
          </h3>
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
        </div>
      )}

      {/* Simple text features (fallback) */}
      {!hasDetailFeatures && hasSimpleFeatures && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: `${accent}99` }}>
            {isRTL ? 'ویژگی‌های کلیدی' : 'Key Features'}
          </h3>
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
        </div>
      )}
    </div>
  );
}
