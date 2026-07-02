"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ArrowRight,
  Clock,
  Upload,
  Search,
  CheckCircle,
  XCircle,
  Loader,
  Ban,
  CreditCard,
  Key,
  FileText,
  AlertTriangle,
  Copy,
  Check,
  ChevronLeft,
} from "lucide-react";
import { useLang } from "@/context/LangContext";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "@/store/toast-store";
import {
  ORDER_STATUS_CONFIG,
  type Order,
  type OrderStatus,
  type BillingCycle,
} from "@/types";
import { formatPriceWithRate } from "@/lib/currency";

// ─── Icon map for status badges ──────────────────────────────────────────────
const STATUS_ICONS: Record<string, React.ReactNode> = {
  Clock: <Clock size={14} />,
  Upload: <Upload size={14} />,
  Search: <Search size={14} />,
  CheckCircle: <CheckCircle size={14} />,
  XCircle: <XCircle size={14} />,
  Loader: <Loader size={14} />,
  Ban: <Ban size={14} />,
};

// ─── Billing cycle labels ───────────────────────────────────────────────────
const BILLING_LABELS: Record<string, { fa: string; en: string }> = {
  daily: { fa: "روزانه", en: "Daily" },
  weekly: { fa: "هفتگی", en: "Weekly" },
  monthly: { fa: "ماهانه", en: "Monthly" },
  lifetime: { fa: "مادام‌العمر", en: "Lifetime" },
};

// ─── Status timeline steps ──────────────────────────────────────────────────
const TIMELINE_STEPS: Array<{
  status: OrderStatus;
  label: { fa: string; en: string };
}> = [
  { status: "pending_payment", label: { fa: "سفارش ثبت شده", en: "Order Placed" } },
  { status: "payment_submitted", label: { fa: "پرداخت ثبت شده", en: "Payment Submitted" } },
  { status: "payment_verifying", label: { fa: "در حال بررسی", en: "Verifying" } },
  { status: "completed", label: { fa: "تکمیل شده", en: "Completed" } },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function getTimelineProgress(status: string | undefined): number {
  if (!status) return 0;
  if (status === "cancelled" || status === "refunded") return -1;
  if (status === "completed") return 4;
  if (status === "payment_confirmed" || status === "processing") return 3;
  if (status === "payment_verifying") return 2;
  if (status === "payment_submitted") return 1;
  return 0;
}

function formatDate(dateStr: string, lang: "fa" | "en"): string {
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
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateStr: string, lang: "fa" | "en"): string {
  const d = new Date(dateStr);
  if (lang === "fa") {
    return d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────
function OrderDetailSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="h-4 w-32 rounded bg-white/5 mb-4" />
        <div className="h-8 w-48 rounded bg-white/5 mb-2" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border p-6 space-y-4"
        style={{ background: "rgba(10,14,26,0.9)", borderColor: "rgba(201,150,58,0.15)" }}
      >
        <div className="flex items-center justify-between">
          <div className="h-5 w-28 rounded bg-white/5" />
          <div className="h-6 w-24 rounded-full bg-white/5" />
        </div>
        <div className="h-4 w-40 rounded bg-white/5" />
        <div className="border-t border-white/5 pt-4 space-y-3">
          <div className="h-4 w-full rounded bg-white/5" />
          <div className="h-4 w-3/4 rounded bg-white/5" />
          <div className="h-4 w-1/2 rounded bg-white/5" />
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border p-6"
        style={{ background: "rgba(10,14,26,0.9)", borderColor: "rgba(201,150,58,0.15)" }}
      >
        <div className="h-5 w-36 rounded bg-white/5 mb-4" />
        <div className="space-y-3">
          <div className="h-12 w-full rounded-lg bg-white/5" />
          <div className="h-12 w-full rounded-lg bg-white/5" />
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { lang, isRTL } = useLang();
  const { rate: exchangeRate } = useCurrency();

  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fontFa = "'Vazirmatn', 'IRANYekan', sans-serif";
  const fontEn = "'Inter', sans-serif";
  const fontDisplay = "'Cinzel', serif";

  // Fetch order
  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.data) {
        setOrder(data.data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Cancel order handler
  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "cancel" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          lang === "fa" ? "سفارش لغو شد" : "Order Cancelled",
          lang === "fa" ? "سفارش شما با موفقیت لغو شد." : "Your order has been cancelled successfully."
        );
        setOrder(data.data);
      } else {
        toast.error(
          lang === "fa" ? "خطا" : "Error",
          data?.error?.message ||
            (lang === "fa" ? "لغو سفارش ناموفق بود." : "Failed to cancel order.")
        );
      }
    } catch (err) {
      console.error("Cancel order error:", err);
      toast.error(
        lang === "fa" ? "خطا" : "Error",
        lang === "fa" ? "خطا در ارتباط با سرور." : "Server connection error."
      );
    } finally {
      setCancelling(false);
    }
  };

  // Copy license key
  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      toast.success(
        lang === "fa" ? "کپی شد" : "Copied",
        lang === "fa" ? "کلید لایسنس کپی شد." : "License key copied to clipboard."
      );
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error(
        lang === "fa" ? "خطا" : "Error",
        lang === "fa" ? "کپی ناموفق بود." : "Failed to copy."
      );
    }
  };

  // Price display helper
  const displayPrice = (usdAmount: number): string => {
    if (lang === "fa" && exchangeRate) {
      return formatPriceWithRate(usdAmount, exchangeRate, "fa");
    }
    return `$${usdAmount.toFixed(2)}`;
  };

  // Billing cycle label
  const billingLabel = (cycle: BillingCycle): string => {
    const label = BILLING_LABELS[cycle];
    if (!label) return cycle;
    return lang === "fa" ? label.fa : label.en;
  };

  // Normalize status
  const normalizedStatus =
    order?.status === "pending" || order?.status === "paid"
      ? "pending_payment"
      : order?.status;

  const statusConfig = normalizedStatus
    ? ORDER_STATUS_CONFIG[normalizedStatus as OrderStatus]
    : null;

  const statusLabel = statusConfig
    ? statusConfig.label[lang]
    : order?.status || "";

  // Determine action availability
  const isPendingPayment =
    normalizedStatus === "pending_payment" || order?.status === "pending";
  const isPaymentRejected = normalizedStatus === "payment_rejected";
  const isCompleted = normalizedStatus === "completed";
  const canCancel = isPendingPayment;
  const showTimeline =
    isCompleted ||
    isPendingPayment ||
    normalizedStatus === "payment_submitted" ||
    normalizedStatus === "payment_verifying" ||
    normalizedStatus === "payment_confirmed" ||
    normalizedStatus === "processing";

  // Font style helper
  const fontStyle = { fontFamily: isRTL ? fontFa : fontEn };

  // ─── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return <OrderDetailSkeleton />;
  }

  // ─── Error / Not Found ──────────────────────────────────────────────────
  if (error || !order) {
    return (
      <div className="space-y-6 max-w-3xl" dir={isRTL ? "rtl" : "ltr"}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link
              href="/dashboard/orders"
              className="hover:text-gold transition-colors"
              style={fontStyle}
            >
              {lang === "fa" ? "سفارشات" : "Orders"}
            </Link>
            <ArrowRight size={14} className="rotate-180" />
            <span className="text-gold">#{orderId}</span>
          </div>
          <h1
            className="text-2xl font-bold text-white mb-2"
            style={{ fontFamily: "var(--font-fa)" }}
          >
            {lang === "fa" ? "جزئیات سفارش" : "Order Details"}
          </h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border p-8"
          style={{
            background: "rgba(10,14,26,0.9)",
            borderColor: "rgba(201,150,58,0.15)",
          }}
        >
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(239,68,68,0.08)" }}
            >
              <Package size={32} className="text-red-400/60" />
            </div>
            <p
              className="text-lg text-gray-400 mb-2"
              style={{ fontFamily: "var(--font-fa)" }}
            >
              {lang === "fa" ? "سفارش یافت نشد" : "Order Not Found"}
            </p>
            <p
              className="text-sm text-gray-600 max-w-sm"
              style={fontStyle}
            >
              {lang === "fa"
                ? "این سفارش وجود ندارد یا شما اجازه دسترسی به آن را ندارید."
                : "This order does not exist or you do not have permission to view it."}
            </p>
            <Link
              href="/dashboard/orders"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#060A14] transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #D4A030, #C9963A)",
                fontFamily: isRTL ? fontFa : fontEn,
              }}
            >
              <ChevronLeft size={16} className={isRTL ? "rotate-180" : ""} />
              {lang === "fa" ? "بازگشت به سفارشات" : "Back to Orders"}
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Main Render ────────────────────────────────────────────────────────
  const orderDate = formatDate(order.createdAt, lang);
  const orderTime = formatTime(order.createdAt, lang);
  const timelineProgress = getTimelineProgress(normalizedStatus);

  return (
    <div className="space-y-6 max-w-3xl" dir={isRTL ? "rtl" : "ltr"}>
      {/* Breadcrumb + Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link
            href="/dashboard/orders"
            className="hover:text-gold transition-colors"
            style={fontStyle}
          >
            {lang === "fa" ? "سفارشات" : "Orders"}
          </Link>
          <ArrowRight size={14} className="rotate-180" />
          <span className="text-gold font-mono">
            #{order.id.slice(-8).toUpperCase()}
          </span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-fa)" }}
          >
            {lang === "fa" ? "جزئیات سفارش" : "Order Details"}
          </h1>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gold transition-colors"
            style={fontStyle}
          >
            <ChevronLeft size={14} className={isRTL ? "rotate-180" : ""} />
            {lang === "fa" ? "بازگشت" : "Back"}
          </Link>
        </div>
      </motion.div>

      {/* Order Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border p-5"
        style={{
          background: "rgba(10,14,26,0.9)",
          borderColor: "rgba(201,150,58,0.2)",
        }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="text-sm font-bold text-gold font-mono"
                style={{ fontFamily: fontDisplay }}
              >
                #{order.id.slice(-8).toUpperCase()}
              </span>
              {statusConfig && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: statusConfig.bgColor,
                    color: statusConfig.color,
                    fontFamily: isRTL ? fontFa : fontEn,
                  }}
                >
                  {STATUS_ICONS[statusConfig.icon]}
                  {statusLabel}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span style={fontStyle}>{orderDate}</span>
              <span className="text-gray-700">|</span>
              <span style={fontStyle}>{orderTime}</span>
            </div>
          </div>
          <div className="text-end">
            <p
              className="text-xs text-gray-500 mb-0.5"
              style={fontStyle}
            >
              {lang === "fa" ? "مبلغ کل" : "Total"}
            </p>
            <p
              className="text-xl font-bold text-white"
              style={{ fontFamily: fontDisplay }}
            >
              {displayPrice(order.total)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Status Timeline */}
      {showTimeline && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border p-5"
          style={{
            background: "rgba(10,14,26,0.9)",
            borderColor: "rgba(201,150,58,0.15)",
          }}
        >
          <h2
            className="text-sm font-bold text-gray-400 mb-4"
            style={{ fontFamily: "var(--font-fa)" }}
          >
            {lang === "fa" ? "وضعیت سفارش" : "Order Status"}
          </h2>
          <div className="relative">
            <div className="flex items-center justify-between">
              {TIMELINE_STEPS.map((step, idx) => {
                const isActive = timelineProgress >= idx + 1;
                const isCurrent = timelineProgress === idx + 1;
                const stepConfig = ORDER_STATUS_CONFIG[step.status];
                const isLast = idx === TIMELINE_STEPS.length - 1;

                return (
                  <React.Fragment key={step.status}>
                    <div className="flex flex-col items-center relative z-10">
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.15 + idx * 0.08 }}
                        className="w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all"
                        style={{
                          background: isActive
                            ? stepConfig?.bgColor || "rgba(34,197,94,0.15)"
                            : "rgba(10,14,26,0.9)",
                          borderColor: isActive
                            ? stepConfig?.color || "#22C55E"
                            : "rgba(255,255,255,0.1)",
                          boxShadow: isCurrent
                            ? `0 0 12px ${stepConfig?.color || "#22C55E"}40`
                            : "none",
                        }}
                      >
                        {isActive && !isLast ? (
                          <CheckCircle
                            size={16}
                            style={{ color: stepConfig?.color || "#22C55E" }}
                          />
                        ) : isCurrent ? (
                          <Loader
                            size={16}
                            className="animate-spin"
                            style={{ color: stepConfig?.color || "#3B82F6" }}
                          />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-600" />
                        )}
                      </motion.div>
                      <span
                        className="text-[10px] mt-2 text-center leading-tight max-w-[70px]"
                        style={{
                          color: isActive
                            ? stepConfig?.color || "#22C55E"
                            : "#6B7280",
                          fontFamily: isRTL ? fontFa : fontEn,
                        }}
                      >
                        {step.label[lang]}
                      </span>
                    </div>
                    {!isLast && (
                      <div className="flex-1 h-0.5 mx-2 rounded-full overflow-hidden bg-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: isActive ? "100%" : "0%",
                          }}
                          transition={{ delay: 0.2 + idx * 0.08, duration: 0.4 }}
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(${isRTL ? "270deg" : "90deg"}, ${stepConfig?.color || "#22C55E"}, ${TIMELINE_STEPS[idx + 1] ? (ORDER_STATUS_CONFIG[TIMELINE_STEPS[idx + 1].status]?.color || "#22C55E") : "#22C55E"})`,
                          }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Cancelled notice */}
      {normalizedStatus === "cancelled" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border p-4"
          style={{
            background: "rgba(107,114,128,0.08)",
            borderColor: "rgba(107,114,128,0.25)",
          }}
        >
          <div className="flex items-center gap-3">
            <Ban size={20} className="text-gray-400 flex-shrink-0" />
            <div>
              <p
                className="text-sm font-semibold text-gray-300"
                style={{ fontFamily: "var(--font-fa)" }}
              >
                {lang === "fa" ? "این سفارش لغو شده است" : "This order has been cancelled"}
              </p>
              <p
                className="text-xs text-gray-500 mt-0.5"
                style={fontStyle}
              >
                {lang === "fa"
                  ? "این سفارش توسط شما یا مدیر لغو شده و قابل پرداخت نیست."
                  : "This order has been cancelled and cannot be paid."}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Order Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border p-5"
        style={{
          background: "rgba(10,14,26,0.9)",
          borderColor: "rgba(201,150,58,0.15)",
        }}
      >
        <h2
          className="text-sm font-bold text-gray-400 mb-4"
          style={{ fontFamily: "var(--font-fa)" }}
        >
          {lang === "fa" ? "محصولات" : "Items"}
        </h2>
        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              className="flex items-center justify-between py-3 px-4 rounded-lg"
              style={{ background: "rgba(5,8,18,0.5)" }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Package size={16} className="text-gold/60 flex-shrink-0" />
                <div className="min-w-0">
                  <p
                    className="text-sm text-gray-200 truncate"
                    style={{ fontFamily: "var(--font-fa)" }}
                  >
                    {item.productName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-md"
                      style={{
                        background: "rgba(201,150,58,0.1)",
                        color: "#C9963A",
                        fontFamily: isRTL ? fontFa : fontEn,
                      }}
                    >
                      {billingLabel(item.billingCycle)}
                    </span>
                    <span
                      className="text-[10px] text-gray-600"
                      style={fontStyle}
                    >
                      x{item.quantity}
                    </span>
                  </div>
                </div>
              </div>
              <span
                className="text-sm text-gray-300 flex-shrink-0 ms-3 font-mono"
                style={{ fontFamily: fontDisplay }}
              >
                {displayPrice(item.price)}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Price breakdown */}
        <div
          className="mt-4 pt-4 space-y-2 border-t"
          style={{ borderColor: "rgba(201,150,58,0.1)" }}
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500" style={fontStyle}>
              {lang === "fa" ? "جمع جزء" : "Subtotal"}
            </span>
            <span className="text-gray-300 font-mono">
              {displayPrice(order.subtotal)}
            </span>
          </div>
          {order.discount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-500" style={fontStyle}>
                {lang === "fa" ? "تخفیف" : "Discount"}
              </span>
              <span className="text-green-400 font-mono">
                -{displayPrice(order.discount)}
              </span>
            </div>
          )}
          <div
            className="flex items-center justify-between text-base font-bold pt-2 border-t"
            style={{ borderColor: "rgba(201,150,58,0.1)" }}
          >
            <span className="text-gray-300" style={fontStyle}>
              {lang === "fa" ? "مبلغ کل" : "Total"}
            </span>
            <span className="text-white" style={{ fontFamily: fontDisplay }}>
              {displayPrice(order.total)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* License Keys (completed orders) */}
      <AnimatePresence>
        {isCompleted && order.licenses && order.licenses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border p-5"
            style={{
              background: "rgba(10,14,26,0.9)",
              borderColor: "rgba(34,197,94,0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Key size={16} className="text-green-400" />
              <h2
                className="text-sm font-bold text-green-400"
                style={{ fontFamily: "var(--font-fa)" }}
              >
                {lang === "fa" ? "کلیدهای لایسنس" : "License Keys"}
              </h2>
            </div>
            <div className="space-y-2">
              {order.licenses.map((license, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + idx * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl border"
                  style={{
                    background: "rgba(34,197,94,0.05)",
                    borderColor: "rgba(34,197,94,0.2)",
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs text-green-400/70"
                      style={fontStyle}
                    >
                      {license.productName}
                    </p>
                    <p
                      className="text-sm font-mono text-green-300 mt-1 truncate"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {license.key}
                    </p>
                    {license.expiresAt && (
                      <p
                        className="text-[10px] text-gray-500 mt-1"
                        style={fontStyle}
                      >
                        {lang === "fa" ? "انقضا: " : "Expires: "}
                        {formatDate(license.expiresAt, lang)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ms-3 flex-shrink-0">
                    <span
                      className="text-[10px] px-2 py-1 rounded-md"
                      style={{
                        background: "rgba(34,197,94,0.15)",
                        color: "#22C55E",
                        fontFamily: isRTL ? fontFa : fontEn,
                      }}
                    >
                      {license.status}
                    </span>
                    <button
                      onClick={() => handleCopyKey(license.key)}
                      className="p-1.5 rounded-lg text-green-400/60 hover:text-green-300 hover:bg-green-500/10 transition-colors"
                      title={lang === "fa" ? "کپی" : "Copy"}
                    >
                      {copiedKey === license.key ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Info */}
      {order.last4Digits && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border p-5"
          style={{
            background: "rgba(10,14,26,0.9)",
            borderColor: "rgba(201,150,58,0.15)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={16} className="text-gray-500" />
            <h2
              className="text-sm font-bold text-gray-400"
              style={{ fontFamily: "var(--font-fa)" }}
            >
              {lang === "fa" ? "اطلاعات پرداخت" : "Payment Info"}
            </h2>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500" style={fontStyle}>
                {lang === "fa" ? "چهار رقم کارت" : "Card Last 4"}
              </span>
              <span className="text-gray-300 font-mono" dir="ltr">
                **** {order.last4Digits}
              </span>
            </div>
            {order.transactionTime && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500" style={fontStyle}>
                  {lang === "fa" ? "زمان تراکنش" : "Transaction Time"}
                </span>
                <span className="text-gray-300" style={fontStyle}>
                  {formatDate(order.transactionTime, lang)}{" "}
                  {formatTime(order.transactionTime, lang)}
                </span>
              </div>
            )}
            {order.receiptNote && (
              <div className="pt-2">
                <p
                  className="text-xs text-gray-600 mb-1"
                  style={fontStyle}
                >
                  {lang === "fa" ? "یادداشت رسید" : "Receipt Note"}
                </p>
                <p
                  className="text-sm text-gray-400"
                  style={fontStyle}
                >
                  {order.receiptNote}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Rejection Reason */}
      <AnimatePresence>
        {isPaymentRejected && order.rejectionReason && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border p-4"
            style={{
              background: "rgba(239,68,68,0.08)",
              borderColor: "rgba(239,68,68,0.25)",
            }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p
                  className="text-sm font-semibold text-red-400 mb-1"
                  style={{ fontFamily: "var(--font-fa)" }}
                >
                  {lang === "fa" ? "دلیل رد پرداخت" : "Payment Rejection Reason"}
                </p>
                <p
                  className="text-sm text-red-300/80"
                  style={fontStyle}
                >
                  {order.rejectionReason}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Note */}
      {order.userNote && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="rounded-xl border p-4"
          style={{
            background: "rgba(10,14,26,0.9)",
            borderColor: "rgba(201,150,58,0.15)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText size={14} className="text-gray-500" />
            <span
              className="text-xs font-semibold text-gray-500"
              style={{ fontFamily: "var(--font-fa)" }}
            >
              {lang === "fa" ? "یادداشت شما" : "Your Note"}
            </span>
          </div>
          <p className="text-sm text-gray-400" style={fontStyle}>
            {order.userNote}
          </p>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex flex-wrap items-center gap-3 pt-2"
      >
        {/* Continue Payment */}
        {isPendingPayment && (
          <Link
            href={`/checkout/${order.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#060A14] transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #D4A030, #C9963A)",
              fontFamily: isRTL ? fontFa : fontEn,
            }}
          >
            <CreditCard size={16} />
            {lang === "fa" ? "ادامه پرداخت" : "Continue Payment"}
          </Link>
        )}

        {/* Resubmit Payment */}
        {isPaymentRejected && (
          <Link
            href={`/checkout/${order.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white border transition-all hover:bg-white/5"
            style={{
              borderColor: "rgba(239,68,68,0.4)",
              fontFamily: isRTL ? fontFa : fontEn,
            }}
          >
            <Upload size={16} />
            {lang === "fa" ? "ارسال مجدد پرداخت" : "Resubmit Payment"}
          </Link>
        )}

        {/* Cancel Order */}
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-red-400 border border-red-900/40 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: isRTL ? fontFa : fontEn }}
          >
            {cancelling ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <Ban size={16} />
            )}
            {cancelling
              ? lang === "fa"
                ? "در حال لغو..."
                : "Cancelling..."
              : lang === "fa"
              ? "لغو سفارش"
              : "Cancel Order"}
          </button>
        )}

        {/* Back to Orders */}
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-gray-400 border border-gray-700 hover:bg-white/5 transition-colors"
          style={{ fontFamily: isRTL ? fontFa : fontEn }}
        >
          <ChevronLeft size={16} className={isRTL ? "rotate-180" : ""} />
          {lang === "fa" ? "بازگشت به سفارشات" : "Back to Orders"}
        </Link>
      </motion.div>
    </div>
  );
}
