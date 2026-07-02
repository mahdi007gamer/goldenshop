"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Search,
  Clock,
  Upload,
  CheckCircle,
  XCircle,
  Loader,
  Ban,
  ChevronDown,
  ChevronUp,
  CreditCard,
  X,
  Save,
  AlertTriangle,
  Key,
  FileText,
  RefreshCw,
} from "lucide-react";
import { useLang } from "@/context/LangContext";
import { ORDER_STATUS_CONFIG, type Order, type OrderStatus } from "@/types";
import { formatPriceWithRate } from "@/lib/currency";
import { useCurrency } from "@/hooks/useCurrency";

// ─── Icon map for status badges ──────────────────────────────────────────────
const STATUS_ICONS: Record<string, React.ReactNode> = {
  Clock: <Clock size={14} />,
  Upload: <Upload size={14} />,
  Search: <Search size={14} />,
  CheckCircle: <CheckCircle size={14} />,
  XCircle: <XCircle size={14} />,
  Loader: <Loader size={14} />,
  Ban: <Ban size={14} />,
  RotateCcw: <RefreshCw size={14} />,
};

// ─── Billing cycle labels ───────────────────────────────────────────────────
const BILLING_LABELS: Record<string, { fa: string; en: string }> = {
  daily: { fa: "روزانه", en: "Daily" },
  weekly: { fa: "هفتگی", en: "Weekly" },
  monthly: { fa: "ماهانه", en: "Monthly" },
  lifetime: { fa: "مادام‌العمر", en: "Lifetime" },
};

// ─── Edit Note Modal ────────────────────────────────────────────────────────
function EditNoteModal({
  isOpen,
  onClose,
  onSave,
  initialNote,
  lang,
  isRTL,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  initialNote: string;
  lang: "fa" | "en";
  isRTL: boolean;
}) {
  const [note, setNote] = useState(initialNote);

  useEffect(() => {
    if (isOpen) setNote(initialNote);
  }, [isOpen, initialNote]);

  const fontFa = "'Vazirmatn', 'IRANYekan', sans-serif";
  const fontEn = "'Inter', sans-serif";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md rounded-2xl border border-[rgba(201,150,58,0.25)] p-6"
            style={{ background: "rgba(6,9,15,0.98)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg font-bold text-white"
                style={{ fontFamily: isRTL ? fontFa : fontEn }}
              >
                {lang === "fa" ? "ویرایش یادداشت" : "Edit Note"}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              maxLength={1000}
              className="w-full rounded-xl p-3 text-sm text-white placeholder-gray-600 outline-none resize-none transition-colors focus:border-[rgba(201,150,58,0.5)]"
              style={{
                background: "rgba(5,8,18,0.8)",
                border: "1.5px solid rgba(201,150,58,0.25)",
                fontFamily: isRTL ? fontFa : fontEn,
                direction: isRTL ? "rtl" : "ltr",
              }}
              placeholder={lang === "fa" ? "یادداشت خود را وارد کنید..." : "Enter your note..."}
            />

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => onSave(note)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-[#060A14] transition-all hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #D4A030, #C9963A)",
                  fontFamily: isRTL ? fontFa : fontEn,
                }}
              >
                <Save size={16} />
                {lang === "fa" ? "ذخیره" : "Save"}
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-gray-400 border border-gray-700 hover:bg-white/5 transition-colors"
                style={{ fontFamily: isRTL ? fontFa : fontEn }}
              >
                {lang === "fa" ? "لغو" : "Cancel"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Order Card ─────────────────────────────────────────────────────────────
function OrderCard({
  order,
  index,
  lang,
  isRTL,
  onCancel,
  onEditNote,
}: {
  order: Order;
  index: number;
  lang: "fa" | "en";
  isRTL: boolean;
  onCancel: (orderId: string) => void;
  onEditNote: (order: Order) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { rate: exchangeRate } = useCurrency();
  const fontFa = "'Vazirmatn', 'IRANYekan', sans-serif";
  const fontEn = "'Inter', sans-serif";
  const fontDisplay = "'Cinzel', serif";
  const isFa = lang === "fa";

  // Normalize status: map legacy "pending" to "pending_payment"
  const normalizedStatus =
    order.status === "pending" || order.status === "paid"
      ? "pending_payment"
      : order.status;

  const statusConfig = ORDER_STATUS_CONFIG[normalizedStatus as OrderStatus];
  const statusLabel = statusConfig
    ? statusConfig.label[lang]
    : order.status;

  const isPendingPayment = normalizedStatus === "pending_payment" || order.status === "pending";
  const isPaymentRejected = normalizedStatus === "payment_rejected";
  const isCompleted = normalizedStatus === "completed";
  const isEditable = order.isEditable !== false && (isPendingPayment || isPaymentRejected);

  const displayPrice = (usdAmount: number) => {
    if (isFa && exchangeRate) return formatPriceWithRate(usdAmount, exchangeRate, "fa");
    return `$${usdAmount.toFixed(2)}`;
  };

  // Format date
  const orderDate = new Date(order.createdAt);
  const formattedDate =
    lang === "fa"
      ? orderDate.toLocaleDateString("fa-IR")
      : orderDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

  // Format time
  const formattedTime =
    lang === "fa"
      ? orderDate.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
      : orderDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", damping: 20 }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background: "rgba(10,14,26,0.9)",
        borderColor: "rgba(201,150,58,0.2)",
      }}
    >
      {/* Card Header */}
      <div
        className="p-4 sm:p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Left: Order number + date */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-sm font-bold text-gold"
                style={{ fontFamily: fontDisplay }}
              >
                #{order.id.slice(-8).toUpperCase()}
              </span>
              {/* Status badge */}
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: statusConfig?.bgColor || "rgba(107,114,128,0.15)",
                  color: statusConfig?.color || "#9CA3AF",
                  fontFamily: isRTL ? fontFa : fontEn,
                }}
              >
                {statusConfig?.icon && STATUS_ICONS[statusConfig.icon]}
                {statusLabel}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span style={{ fontFamily: isRTL ? fontFa : fontEn }}>
                {formattedDate}
              </span>
              <span style={{ fontFamily: isRTL ? fontFa : fontEn }}>
                {formattedTime}
              </span>
            </div>
          </div>

          {/* Right: Total + expand icon */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-end">
              <p
                className="text-xs text-gray-500"
                style={{ fontFamily: isRTL ? fontFa : fontEn }}
              >
                {lang === "fa" ? "مبلغ کل" : "Total"}
              </p>
              <p
                className="text-base font-bold text-white"
                style={{ fontFamily: fontDisplay }}
              >
                {displayPrice(order.total)}
              </p>
            </div>
            <div className="text-gray-600">
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
        </div>

        {/* Quick item preview (collapsed) */}
        {!expanded && order.items.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-400 truncate">
            <Package size={14} className="flex-shrink-0 text-gray-600" />
            <span
              className="truncate"
              style={{ fontFamily: isRTL ? fontFa : fontEn }}
            >
              {order.items
                .map((item) => {
                  const planLabel = BILLING_LABELS[item.billingCycle];
                  const plan = planLabel
                    ? lang === "fa"
                      ? planLabel.fa
                      : planLabel.en
                    : item.billingCycle;
                  return `${item.productName} (${plan})`;
                })
                .join(" + ")}
            </span>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div
              className="px-4 sm:px-5 pb-4 sm:pb-5 border-t"
              style={{ borderColor: "rgba(201,150,58,0.1)" }}
            >
              {/* Items list */}
              <div className="mt-4 space-y-2">
                <p
                  className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3"
                  style={{ fontFamily: isRTL ? fontFa : fontEn }}
                >
                  {lang === "fa" ? "محصولات" : "Items"}
                </p>
                {order.items.map((item) => {
                  const planLabel = BILLING_LABELS[item.billingCycle];
                  const plan = planLabel
                    ? lang === "fa"
                      ? planLabel.fa
                      : planLabel.en
                    : item.billingCycle;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg"
                      style={{ background: "rgba(5,8,18,0.5)" }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Package size={14} className="text-gold/60 flex-shrink-0" />
                        <span
                          className="text-sm text-gray-300 truncate"
                          style={{ fontFamily: isRTL ? fontFa : fontEn }}
                        >
                          {item.productName}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-md flex-shrink-0"
                          style={{
                            background: "rgba(201,150,58,0.1)",
                            color: "#C9963A",
                            fontFamily: isRTL ? fontFa : fontEn,
                          }}
                        >
                          {plan}
                        </span>
                      </div>
                      <span
                        className="text-sm text-gray-400 flex-shrink-0 ms-3"
                        style={{ fontFamily: fontDisplay }}
                      >
                        {displayPrice(item.price)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Rejection reason */}
              {isPaymentRejected && order.rejectionReason && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-3 rounded-xl border"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    borderColor: "rgba(239,68,68,0.25)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} className="text-red-400" />
                    <span
                      className="text-xs font-semibold text-red-400"
                      style={{ fontFamily: isRTL ? fontFa : fontEn }}
                    >
                      {lang === "fa" ? "دلیل رد پرداخت" : "Rejection Reason"}
                    </span>
                  </div>
                  <p
                    className="text-sm text-red-300/80"
                    style={{ fontFamily: isRTL ? fontFa : fontEn }}
                  >
                    {order.rejectionReason}
                  </p>
                </motion.div>
              )}

              {/* User note */}
              {order.userNote && (
                <div
                  className="mt-3 p-3 rounded-xl"
                  style={{ background: "rgba(5,8,18,0.5)" }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={14} className="text-gray-500" />
                    <span
                      className="text-xs font-semibold text-gray-500"
                      style={{ fontFamily: isRTL ? fontFa : fontEn }}
                    >
                      {lang === "fa" ? "یادداشت شما" : "Your Note"}
                    </span>
                  </div>
                  <p
                    className="text-sm text-gray-400"
                    style={{ fontFamily: isRTL ? fontFa : fontEn }}
                  >
                    {order.userNote}
                  </p>
                </div>
              )}

              {/* License keys (completed orders) */}
              {isCompleted && order.licenses && order.licenses.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Key size={14} className="text-green-400" />
                    <span
                      className="text-xs font-semibold text-green-400"
                      style={{ fontFamily: isRTL ? fontFa : fontEn }}
                    >
                      {lang === "fa" ? "کلیدهای لایسنس" : "License Keys"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {order.licenses.map((license, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl border"
                        style={{
                          background: "rgba(34,197,94,0.05)",
                          borderColor: "rgba(34,197,94,0.2)",
                        }}
                      >
                        <div className="min-w-0">
                          <p
                            className="text-xs text-green-400/70"
                            style={{ fontFamily: isRTL ? fontFa : fontEn }}
                          >
                            {license.productName}
                          </p>
                          <p
                            className="text-sm font-mono text-green-300 mt-0.5 truncate"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {license.key}
                          </p>
                        </div>
                        <span
                          className="text-xs px-2 py-1 rounded-md flex-shrink-0 ms-3"
                          style={{
                            background: "rgba(34,197,94,0.15)",
                            color: "#22C55E",
                            fontFamily: isRTL ? fontFa : fontEn,
                          }}
                        >
                          {license.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment info (if submitted) */}
              {order.last4Digits && (
                <div
                  className="mt-3 p-3 rounded-xl"
                  style={{ background: "rgba(5,8,18,0.5)" }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard size={14} className="text-gray-500" />
                    <span
                      className="text-xs font-semibold text-gray-500"
                      style={{ fontFamily: isRTL ? fontFa : fontEn }}
                    >
                      {lang === "fa" ? "اطلاعات پرداخت" : "Payment Info"}
                    </span>
                  </div>
                  <p
                    className="text-sm text-gray-400"
                    style={{ fontFamily: isRTL ? fontFa : fontEn }}
                  >
                    {lang === "fa"
                      ? `چهار رقم کارت: **** ${order.last4Digits}`
                      : `Card last 4: **** ${order.last4Digits}`}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                {/* Continue Payment */}
                {isPendingPayment && (
                  <a
                    href={`/checkout/${order.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[#060A14] transition-all hover:opacity-90"
                    style={{
                      background: "linear-gradient(135deg, #D4A030, #C9963A)",
                      fontFamily: isRTL ? fontFa : fontEn,
                    }}
                  >
                    <CreditCard size={16} />
                    {lang === "fa" ? "ادامه پرداخت" : "Continue Payment"}
                  </a>
                )}

                {/* Resubmit Payment */}
                {isPaymentRejected && isEditable && (
                  <a
                    href={`/checkout/${order.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white border transition-all hover:bg-white/5"
                    style={{
                      borderColor: "rgba(239,68,68,0.4)",
                      fontFamily: isRTL ? fontFa : fontEn,
                    }}
                  >
                    <RefreshCw size={16} />
                    {lang === "fa" ? "ارسال مجدد پرداخت" : "Resubmit Payment"}
                  </a>
                )}

                {/* Edit Note */}
                {isEditable && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditNote(order);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-300 border border-gray-700 hover:bg-white/5 transition-colors"
                    style={{ fontFamily: isRTL ? fontFa : fontEn }}
                  >
                    <FileText size={16} />
                    {lang === "fa" ? "ویرایش یادداشت" : "Edit Note"}
                  </button>
                )}

                {/* Cancel */}
                {isPendingPayment && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancel(order.id);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-red-400 border border-red-900/40 hover:bg-red-500/10 transition-colors"
                    style={{ fontFamily: isRTL ? fontFa : fontEn }}
                  >
                    <Ban size={16} />
                    {lang === "fa" ? "لغو سفارش" : "Cancel"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Orders Page ───────────────────────────────────────────────────────
export default function OrdersPage() {
  const { lang, isRTL } = useLang();
  const fontFa = "'Vazirmatn', 'IRANYekan', sans-serif";
  const fontEn = "'Inter', sans-serif";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data.orders);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter orders by search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase().trim();
    return orders.filter((order) => {
      const orderNumber = order.id.slice(-8).toLowerCase();
      const matchesNumber = orderNumber.includes(q);
      const matchesProduct = order.items.some((item) =>
        item.productName.toLowerCase().includes(q)
      );
      return matchesNumber || matchesProduct;
    });
  }, [orders, searchQuery]);

  // Cancel order handler
  const handleCancel = async (orderId: string) => {
    if (cancelConfirm !== orderId) {
      setCancelConfirm(orderId);
      return;
    }
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "cancel" }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))
        );
      }
    } catch (err) {
      console.error("Failed to cancel order:", err);
    }
    setCancelConfirm(null);
  };

  // Edit note handler
  const handleEditNote = (order: Order) => {
    setEditingOrder(order);
    setEditModalOpen(true);
  };

  const handleSaveNote = async (note: string) => {
    if (!editingOrder) return;
    try {
      const res = await fetch(`/api/orders/${editingOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "update_note", userNote: note }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === editingOrder.id ? { ...o, userNote: note } : o
          )
        );
      }
    } catch (err) {
      console.error("Failed to update note:", err);
    }
    setEditModalOpen(false);
    setEditingOrder(null);
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1
          className="text-2xl font-bold text-white mb-2"
          style={{ fontFamily: isRTL ? fontFa : fontEn }}
        >
          {lang === "fa" ? "سفارشات من" : "My Orders"}
        </h1>
        <p className="text-gray-500" style={{ fontFamily: isRTL ? fontFa : fontEn }}>
          {lang === "fa"
            ? "تاریخچه تمام سفارشات شما"
            : "History of all your orders"}
        </p>
      </motion.div>

      {/* Search Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <div className="relative">
          <div
            className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-gray-500"
          >
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
                ? "جستجو بر اساس شماره سفارش یا نام محصول..."
                : "Search by order number or product name..."
            }
          />
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: "#C9963A",
              borderRightColor: "rgba(201,150,58,0.3)",
            }}
          />
          <p
            className="mt-4 text-sm text-gray-500"
            style={{ fontFamily: isRTL ? fontFa : fontEn }}
          >
            {lang === "fa" ? "در حال بارگذاری..." : "Loading..."}
          </p>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && filteredOrders.length === 0 && (
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
              <Package size={32} className="text-gray-700" />
            </div>
            <p
              className="text-lg text-gray-400 mb-2"
              style={{ fontFamily: isRTL ? fontFa : fontEn }}
            >
              {searchQuery
                ? lang === "fa"
                  ? "نتیجه‌ای یافت نشد"
                  : "No results found"
                : lang === "fa"
                ? "هنوز سفارشی ثبت نکرده‌اید"
                : "You haven't placed any orders yet"}
            </p>
            <p
              className="text-sm text-gray-600 max-w-sm"
              style={{ fontFamily: isRTL ? fontFa : fontEn }}
            >
              {searchQuery
                ? lang === "fa"
                  ? "عبارت جستجو را تغییر دهید"
                  : "Try a different search term"
                : lang === "fa"
                ? "پس از خرید محصولات، سفارشات شما اینجا نمایش داده می‌شود"
                : "After purchasing products, your orders will appear here"}
            </p>
          </div>
        </motion.div>
      )}

      {/* Orders List */}
      {!loading && filteredOrders.length > 0 && (
        <div className="space-y-3">
          {filteredOrders.map((order, idx) => (
            <OrderCard
              key={order.id}
              order={order}
              index={idx}
              lang={lang}
              isRTL={isRTL}
              onCancel={handleCancel}
              onEditNote={handleEditNote}
            />
          ))}
        </div>
      )}

      {/* Edit Note Modal */}
      <EditNoteModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingOrder(null);
        }}
        onSave={handleSaveNote}
        initialNote={editingOrder?.userNote || ""}
        lang={lang}
        isRTL={isRTL}
      />

      {/* Cancel confirmation toast */}
      <AnimatePresence>
        {cancelConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 start-6 end-6 sm:start-auto sm:end-6 sm:w-auto z-[90]"
          >
            <div
              className="flex items-center gap-3 p-4 rounded-xl border"
              style={{
                background: "rgba(10,14,26,0.98)",
                borderColor: "rgba(239,68,68,0.3)",
                backdropFilter: "blur(12px)",
              }}
            >
              <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
              <p
                className="text-sm text-gray-300 flex-1"
                style={{ fontFamily: isRTL ? fontFa : fontEn }}
              >
                {lang === "fa"
                  ? "آیا از لغو این سفارش مطمئن هستید؟"
                  : "Are you sure you want to cancel this order?"}
              </p>
              <button
                onClick={() => handleCancel(cancelConfirm)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-colors flex-shrink-0"
                style={{ fontFamily: isRTL ? fontFa : fontEn }}
              >
                {lang === "fa" ? "بله، لغو کن" : "Yes, Cancel"}
              </button>
              <button
                onClick={() => setCancelConfirm(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-400 border border-gray-700 hover:bg-white/5 transition-colors flex-shrink-0"
                style={{ fontFamily: isRTL ? fontFa : fontEn }}
              >
                {lang === "fa" ? "خیر" : "No"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
