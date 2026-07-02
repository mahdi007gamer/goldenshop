"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  Search,
  Copy,
  CheckCircle,
  Clock,
  ShieldOff,
  Lock,
  CalendarDays,
  Gamepad2,
} from "lucide-react";
import { useLang } from "@/context/LangContext";
import { toast } from "@/store/toast-store";
import type { License } from "@/types";

// ─── Status configuration ───────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  License["status"],
  { label: { fa: string; en: string }; color: string; bgColor: string; icon: React.ReactNode }
> = {
  active: {
    label: { fa: "فعال", en: "Active" },
    color: "#22C55E",
    bgColor: "rgba(34,197,94,0.12)",
    icon: <CheckCircle size={14} />,
  },
  expired: {
    label: { fa: "منقضی", en: "Expired" },
    color: "#EF4444",
    bgColor: "rgba(239,68,68,0.12)",
    icon: <Clock size={14} />,
  },
  revoked: {
    label: { fa: "لغو شده", en: "Revoked" },
    color: "#9CA3AF",
    bgColor: "rgba(156,163,175,0.12)",
    icon: <ShieldOff size={14} />,
  },
  "hardware-locked": {
    label: { fa: "قفل سخت‌افزار", en: "Hardware Locked" },
    color: "#F59E0B",
    bgColor: "rgba(245,158,11,0.12)",
    icon: <Lock size={14} />,
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function maskLicenseKey(key: string): string {
  if (key.length <= 8) return key;
  return `${key.slice(0, 4)}****${key.slice(-4)}`;
}

function formatDate(dateStr: string, lang: "fa" | "en"): string {
  try {
    const d = new Date(dateStr);
    if (lang === "fa") {
      return d.toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ─── Skeleton Card ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="rounded-2xl border p-5 animate-pulse"
      style={{
        background: "rgba(10,14,26,0.9)",
        borderColor: "rgba(201,150,58,0.15)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-5 w-32 rounded-md bg-white/5" />
            <div className="h-5 w-16 rounded-full bg-white/5" />
          </div>
          <div className="h-4 w-48 rounded-md bg-white/5" />
          <div className="h-4 w-40 rounded-md bg-white/5" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-white/5" />
      </div>
    </div>
  );
}

// ─── License Card ───────────────────────────────────────────────────────────
function LicenseCard({
  license,
  index,
  lang,
  isRTL,
  onCopy,
}: {
  license: License;
  index: number;
  lang: "fa" | "en";
  isRTL: boolean;
  onCopy: (key: string) => void;
}) {
  const fontFa = "'Vazirmatn', 'IRANYekan', sans-serif";
  const fontEn = "'Inter', sans-serif";
  const fontMono = "'JetBrains Mono', monospace";

  const statusCfg = STATUS_CONFIG[license.status];
  const statusLabel = statusCfg.label[lang];
  const maskedKey = maskLicenseKey(license.key);

  const isExpired = license.status === "expired";
  const isRevoked = license.status === "revoked";
  const isMuted = isExpired || isRevoked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", damping: 20 }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background: "rgba(10,14,26,0.9)",
        borderColor: isMuted
          ? "rgba(107,114,128,0.2)"
          : "rgba(201,150,58,0.2)",
      }}
    >
      <div className="p-4 sm:p-5">
        {/* Top row: product name + status badge */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className="text-base font-bold text-white truncate"
                style={{ fontFamily: isRTL ? fontFa : fontEn }}
              >
                {license.productName}
              </h3>
              {/* Game badge */}
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0"
                style={{
                  background: "rgba(0,240,255,0.08)",
                  color: "#00f0ff",
                  fontFamily: isRTL ? fontFa : fontEn,
                }}
              >
                <Gamepad2 size={12} />
                {license.game}
              </span>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: statusCfg.bgColor,
                  color: statusCfg.color,
                  fontFamily: isRTL ? fontFa : fontEn,
                }}
              >
                {statusCfg.icon}
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Copy button */}
          <button
            onClick={() => onCopy(license.key)}
            disabled={isMuted}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: isMuted
                ? "rgba(107,114,128,0.1)"
                : "linear-gradient(135deg, #D4A030, #C9963A)",
              color: isMuted ? "#9CA3AF" : "#060A14",
              fontFamily: isRTL ? fontFa : fontEn,
            }}
          >
            <Copy size={14} />
            {lang === "fa" ? "کپی" : "Copy"}
          </button>
        </div>

        {/* Key display */}
        <div
          className="mt-4 p-3 rounded-xl border flex items-center justify-between gap-3"
          style={{
            background: isMuted ? "rgba(5,8,18,0.4)" : "rgba(34,197,94,0.04)",
            borderColor: isMuted
              ? "rgba(107,114,128,0.15)"
              : "rgba(34,197,94,0.15)",
          }}
        >
          <div className="min-w-0 flex-1">
            <p
              className="text-xs mb-1"
              style={{
                color: isMuted ? "#6B7280" : "rgba(34,197,94,0.6)",
                fontFamily: isRTL ? fontFa : fontEn,
              }}
            >
              {lang === "fa" ? "کلید لایسنس" : "License Key"}
            </p>
            <p
              className="text-sm font-mono truncate tracking-wide"
              style={{
                color: isMuted ? "#6B7280" : "#4ADE80",
                fontFamily: fontMono,
                direction: "ltr",
                textAlign: "left",
              }}
            >
              {maskedKey}
            </p>
          </div>
          <button
            onClick={() => onCopy(license.key)}
            disabled={isMuted}
            className="p-2 rounded-lg transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5"
            title={lang === "fa" ? "کپی کلید" : "Copy key"}
          >
            <Copy
              size={16}
              style={{ color: isMuted ? "#6B7280" : "#4ADE80" }}
            />
          </button>
        </div>

        {/* Bottom info row */}
        <div className="mt-4 flex items-center gap-4 flex-wrap text-xs">
          {/* Expiry date */}
          <div className="flex items-center gap-1.5">
            <CalendarDays size={12} className="text-gray-600" />
            <span className="text-gray-500" style={{ fontFamily: isRTL ? fontFa : fontEn }}>
              {lang === "fa" ? "انقضا:" : "Expires:"}
            </span>
            <span
              className="font-medium"
              style={{
                color: isExpired ? "#EF4444" : "#9CA3AF",
                fontFamily: isRTL ? fontFa : fontEn,
              }}
            >
              {formatDate(license.expiresAt, lang)}
            </span>
          </div>

          {/* HWID (if present) */}
          {license.hwid && (
            <div className="flex items-center gap-1.5">
              <Lock size={12} className="text-gray-600" />
              <span className="text-gray-500" style={{ fontFamily: isRTL ? fontFa : fontEn }}>
                {lang === "fa" ? "HWID:" : "HWID:"}
              </span>
              <span
                className="font-mono text-gray-400"
                style={{ fontFamily: fontMono, direction: "ltr" }}
              >
                {license.hwid.length > 12 ? `${license.hwid.slice(0, 12)}...` : license.hwid}
              </span>
            </div>
          )}

          {/* Purchase date */}
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-gray-600" />
            <span className="text-gray-500" style={{ fontFamily: isRTL ? fontFa : fontEn }}>
              {lang === "fa" ? "خرید:" : "Purchased:"}
            </span>
            <span
              className="text-gray-400"
              style={{ fontFamily: isRTL ? fontFa : fontEn }}
            >
              {formatDate(license.createdAt, lang)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Licenses Page ─────────────────────────────────────────────────────
export default function LicensesPage() {
  const { lang, isRTL } = useLang();
  const fontFa = "'Vazirmatn', 'IRANYekan', sans-serif";
  const fontEn = "'Inter', sans-serif";

  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Fetch licenses
  const fetchLicenses = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await fetch("/api/licenses", { credentials: "include" });
      const data = await res.json();
      if (data.success && data.data?.licenses) {
        setLicenses(data.data.licenses);
      } else {
        setFetchError(true);
      }
    } catch (err) {
      console.error("Failed to fetch licenses:", err);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);

  // Client-side filtering
  const filteredLicenses = useMemo(() => {
    let result = licenses;

    // Filter by search query (productName)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.productName.toLowerCase().includes(q) ||
          l.game.toLowerCase().includes(q)
      );
    }

    // Filter by status
    if (statusFilter) {
      result = result.filter((l) => l.status === statusFilter);
    }

    return result;
  }, [licenses, searchQuery, statusFilter]);

  // Copy to clipboard handler
  const handleCopyKey = useCallback(
    async (key: string) => {
      try {
        await navigator.clipboard.writeText(key);
        toast.success(
          lang === "fa" ? "کپی شد!" : "Copied!",
          lang === "fa" ? "کلید لایسنس در کلیپ‌بورد کپی شد" : "License key copied to clipboard"
        );
      } catch {
        toast.error(
          lang === "fa" ? "خطا" : "Error",
          lang === "fa" ? "کپی کلید با خطا مواجه شد" : "Failed to copy key"
        );
      }
    },
    [lang]
  );

  // Status filter options
  const statusOptions: { value: License["status"] | ""; label: { fa: string; en: string } }[] = [
    { value: "", label: { fa: "همه وضعیت‌ها", en: "All Statuses" } },
    { value: "active", label: { fa: "فعال", en: "Active" } },
    { value: "expired", label: { fa: "منقضی", en: "Expired" } },
    { value: "revoked", label: { fa: "لغو شده", en: "Revoked" } },
    { value: "hardware-locked", label: { fa: "قفل سخت‌افزار", en: "Hardware Locked" } },
  ];

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1
          className="text-2xl font-bold text-white mb-2"
          style={{ fontFamily: isRTL ? fontFa : fontEn }}
        >
          {lang === "fa" ? "لایسنس‌های من" : "My Licenses"}
        </h1>
        <p className="text-gray-500" style={{ fontFamily: isRTL ? fontFa : fontEn }}>
          {lang === "fa"
            ? "مدیریت لایسنس‌های فعال و مشاهده کلیدها"
            : "Manage active licenses and view keys"}
        </p>
      </motion.div>

      {/* Search + Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-gray-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-11 pe-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-[rgba(201,150,58,0.5)] focus:ring-1 focus:ring-[rgba(201,150,58,0.2)]"
            style={{
              background: "rgba(10,14,26,0.9)",
              border: "1.5px solid rgba(201,150,58,0.2)",
              fontFamily: isRTL ? fontFa : fontEn,
              direction: isRTL ? "rtl" : "ltr",
            }}
            placeholder={
              lang === "fa"
                ? "جستجوی نام محصول یا بازی..."
                : "Search by product name or game..."
            }
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-xl text-sm text-gray-300 outline-none transition-all focus:border-[rgba(201,150,58,0.5)] cursor-pointer appearance-none"
          style={{
            background: "rgba(10,14,26,0.9)",
            border: "1.5px solid rgba(201,150,58,0.2)",
            fontFamily: isRTL ? fontFa : fontEn,
            direction: isRTL ? "rtl" : "ltr",
            minWidth: isRTL ? "auto" : "180px",
          }}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0A0E1A] text-gray-300">
              {lang === "fa" ? opt.label.fa : opt.label.en}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      {!loading && fetchError && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-8"
          style={{
            background: "rgba(10,14,26,0.9)",
            borderColor: "rgba(239,68,68,0.25)",
          }}
        >
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(239,68,68,0.08)" }}
            >
              <ShieldOff size={32} className="text-red-400" />
            </div>
            <p
              className="text-lg text-gray-300 mb-2"
              style={{ fontFamily: isRTL ? fontFa : fontEn }}
            >
              {lang === "fa" ? "خطا در دریافت اطلاعات" : "Error fetching data"}
            </p>
            <p
              className="text-sm text-gray-500 mb-4"
              style={{ fontFamily: isRTL ? fontFa : fontEn }}
            >
              {lang === "fa"
                ? "لطفاً اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید"
                : "Please check your connection and try again"}
            </p>
            <button
              onClick={fetchLicenses}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#060A14] transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #D4A030, #C9963A)",
                fontFamily: isRTL ? fontFa : fontEn,
              }}
            >
              <Search size={16} />
              {lang === "fa" ? "تلاش مجدد" : "Retry"}
            </button>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && !fetchError && filteredLicenses.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border p-8"
          style={{
            background: "rgba(10,14,26,0.9)",
            borderColor: "rgba(201,150,58,0.15)",
          }}
        >
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(201,150,58,0.08)" }}
            >
              <Key size={32} className="text-gray-700" />
            </div>
            <p
              className="text-lg text-gray-400 mb-2"
              style={{ fontFamily: isRTL ? fontFa : fontEn }}
            >
              {searchQuery || statusFilter
                ? lang === "fa"
                  ? "نتیجه‌ای یافت نشد"
                  : "No results found"
                : lang === "fa"
                ? "هنوز لایسنسی ندارید"
                : "You have no licenses yet"}
            </p>
            <p
              className="text-sm text-gray-600 max-w-sm"
              style={{ fontFamily: isRTL ? fontFa : fontEn }}
            >
              {searchQuery || statusFilter
                ? lang === "fa"
                  ? "فیلترها را تغییر دهید یا عبارت جستجو را اصلاح کنید"
                  : "Try changing filters or search term"
                : lang === "fa"
                ? "پس از خرید محصولات، لایسنس‌های شما اینجا نمایش داده می‌شود"
                : "After purchasing products, your licenses will appear here"}
            </p>
          </div>
        </motion.div>
      )}

      {/* Licenses List */}
      {!loading && !fetchError && filteredLicenses.length > 0 && (
        <div className="space-y-3">
          {/* Count summary */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-gray-600 mb-1"
            style={{ fontFamily: isRTL ? fontFa : fontEn }}
          >
            {lang === "fa"
              ? `${filteredLicenses.length} لایسنس از ${licenses.length}`
              : `${filteredLicenses.length} of ${licenses.length} licenses`}
          </motion.p>

          {filteredLicenses.map((license, idx) => (
            <LicenseCard
              key={license.id}
              license={license}
              index={idx}
              lang={lang}
              isRTL={isRTL}
              onCopy={handleCopyKey}
            />
          ))}
        </div>
      )}
    </div>
  );
}
