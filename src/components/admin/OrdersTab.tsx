"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Clock, CheckCircle, XCircle, AlertTriangle,
  Key, Loader2, ChevronDown, ChevronUp, CreditCard, User,
  Hash, Send, PackagePlus, Trash2,
} from "lucide-react";
import { formatPriceWithRate } from "@/lib/currency";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "@/store/toast-store";

// ─── Types ───────────────────────────────────────────────────────────────────

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending_payment: { label: "Pending Payment", color: "#9CA3AF", bg: "rgba(107,114,128,0.15)" },
  payment_submitted: { label: "Submitted", color: "#93C5FD", bg: "rgba(59,130,246,0.15)" },
  payment_verifying: { label: "Verifying", color: "#C4B5FD", bg: "rgba(139,92,246,0.15)" },
  payment_confirmed: { label: "Confirmed", color: "#6EE7B7", bg: "rgba(16,185,129,0.15)" },
  payment_rejected: { label: "Rejected", color: "#FCA5A5", bg: "rgba(239,68,68,0.15)" },
  awaiting_license: { label: "Awaiting License", color: "#FCD34D", bg: "rgba(245,158,11,0.15)" },
  license_out_of_stock: { label: "Out of Stock", color: "#FDBA74", bg: "rgba(249,115,22,0.15)" },
  completed: { label: "Completed", color: "#F0C060", bg: "rgba(201,150,58,0.15)" },
  cancelled: { label: "Cancelled", color: "#6B7280", bg: "rgba(55,65,81,0.15)" },
  refunded: { label: "Refunded", color: "#F9A8D4", bg: "rgba(236,72,153,0.15)" },
};

const PRIORITY_STATUSES = ["payment_submitted", "awaiting_license", "license_out_of_stock"];

interface OrderUser {
  id?: string;
  username: string;
  phone?: string;
}

interface OrderLineItem {
  id: string;
  productName: string;
  price: number;
  quantity: number;
  billingCycle: string;
  productId: string;
}

interface OrderLicense {
  id: string;
  key: string;
  status: string;
  productName: string;
  expiresAt: string;
}

interface OrderLicenseDelivery {
  id: string;
  deliveredAt: string;
  method: string;
  adminName: string;
}

interface OrderStatusLog {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  action: string;
  adminName: string | null;
  note: string | null;
  createdAt: string;
}

export interface ProOrderItem {
  id: string;
  status: string;
  paymentStatus: string;
  total: number;
  last4Digits: string | null;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string | null;
  adminInternalNote?: string | null;
  user: OrderUser | null;
  items: OrderLineItem[];
  licenses: OrderLicense[];
  licenseDeliveries: OrderLicenseDelivery[];
  statusLogs?: OrderStatusLog[];
}

export interface OrderStats {
  pending_payment: number;
  payment_submitted: number;
  payment_verifying: number;
  payment_confirmed: number;
  payment_rejected: number;
  awaiting_license: number;
  license_out_of_stock: number;
  completed: number;
  cancelled: number;
  refunded: number;
}

// ─── API Helper (local, credentials: include) ───────────────────────────────

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: "include" });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Request failed");
  return json.data;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function OrdersTab() {
  const { rate: exchangeRate } = useCurrency();
  const [orders, setOrders] = useState<ProOrderItem[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [verifyingOrder, setVerifyingOrder] = useState<string | null>(null);
  const [deliveringOrder, setDeliveringOrder] = useState<string | null>(null);
  const [licenseKey, setLicenseKey] = useState("");
  const [deliverNote, setDeliverNote] = useState("");
  const [adminNoteDraft, setAdminNoteDraft] = useState<Record<string, string>>({});
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const displayPrice = useCallback(
    (usd: number) => {
      if (exchangeRate) return formatPriceWithRate(usd, exchangeRate, "fa");
      return `$${usd.toFixed(2)}`;
    },
    [exchangeRate]
  );

  const loadOrders = useCallback(
    async (cursor?: string) => {
      try {
        if (cursor) setIsLoadingMore(true);
        else setLoading(true);
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (statusFilter) params.set("status", statusFilter);
        params.set("take", "20");
        if (cursor) params.set("cursor", cursor);
        const [ordersData, statsData] = await Promise.all([
          apiGet<{ orders: ProOrderItem[]; total: number; nextCursor: string | null }>(
            `/api/admin/orders?${params}`
          ),
          apiGet<OrderStats>("/api/admin/orders/stats"),
        ]);
        if (cursor) setOrders((prev) => [...prev, ...ordersData.orders]);
        else setOrders(ordersData.orders);
        setNextCursor(ordersData.nextCursor);
        setStats(statsData);
      } catch {
        toast.error("خطا", "بارگذاری سفارشات با مشکل مواجه شد");
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [search, statusFilter]
  );

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleVerifyPayment = async (orderId: string, approved: boolean) => {
    setVerifyingOrder(orderId);
    try {
      const res = await fetch("/api/admin/orders/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orderId,
          approved,
          rejectionReason: approved ? undefined : "Payment rejected by admin",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(approved ? "Payment verified" : "Payment rejected", data.message || "");
        loadOrders();
      } else {
        toast.error("Action failed", data.error?.message || "Could not complete action");
      }
    } catch {
      toast.error("Network error", "Could not reach server");
    } finally {
      setVerifyingOrder(null);
    }
  };

  const handleManualDeliver = async (orderId: string) => {
    if (!licenseKey.trim()) {
      toast.error("Validation", "License key is required");
      return;
    }
    setDeliveringOrder(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ licenseKey, note: deliverNote }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("License delivered", data.message || "License delivered successfully");
        setLicenseKey("");
        setDeliverNote("");
        setExpandedOrder(null);
        loadOrders();
      } else {
        toast.error("Delivery failed", data.error?.message || "Could not deliver license");
      }
    } catch {
      toast.error("Network error", "Could not reach server");
    } finally {
      setDeliveringOrder(null);
    }
  };

  const handleSaveNote = async (orderId: string) => {
    const note = adminNoteDraft[orderId] ?? "";
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ adminInternalNote: note }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Note saved", "Internal note updated");
      } else {
        toast.error("Save failed", data.error?.message || "Could not save note");
      }
    } catch {
      toast.error("Network error", "Could not reach server");
    }
  };

  const getAdminNote = (order: ProOrderItem) =>
    adminNoteDraft[order.id] ?? order.adminInternalNote ?? "";

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PRIORITY_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? "" : status)}
              className={`p-4 rounded-xl border transition-all ${
                statusFilter === status ? "ring-2 ring-gold/50" : ""
              }`}
              style={{
                background: ORDER_STATUS_CONFIG[status]?.bg || "rgba(255,255,255,0.05)",
                borderColor: ORDER_STATUS_CONFIG[status]?.color || "rgba(255,255,255,0.1)",
              }}
            >
              <p className="text-xs text-gray-400">{ORDER_STATUS_CONFIG[status]?.label}</p>
              <p
                className="text-2xl font-bold mt-1"
                style={{ color: ORDER_STATUS_CONFIG[status]?.color }}
              >
                {stats[status]}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or username..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:border-gold/30 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-gold/30 focus:outline-none"
        >
          <option value="">All Statuses</option>
          {Object.entries(ORDER_STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>
              {cfg.label}
            </option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-gold" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No orders found</div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isExpanded={expandedOrder === order.id}
              onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              onVerify={handleVerifyPayment}
              onDeliver={handleManualDeliver}
              onSaveNote={handleSaveNote}
              verifyingOrder={verifyingOrder}
              deliveringOrder={deliveringOrder}
              licenseKey={licenseKey}
              setLicenseKey={setLicenseKey}
              deliverNote={deliverNote}
              setDeliverNote={setDeliverNote}
              adminNote={getAdminNote(order)}
              setAdminNote={(v) =>
                setAdminNoteDraft((prev) => ({ ...prev, [order.id]: v }))
              }
              displayPrice={displayPrice}
            />
          ))
        )}
      </div>

      {nextCursor && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => loadOrders(nextCursor!)}
            disabled={isLoadingMore}
            className="btn-outline-gold flex items-center gap-2 px-4 py-2 text-xs"
          >
            {isLoadingMore ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Loading...
              </>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Manual Delivery with Inventory Support ──────────────────────────────────

interface InvItem {
  id: string;
  productId: string;
  productName: string | null;
  billingCycle: string | null;
  licenseKey: string;
  status: string;
  product?: { name: string; nameFa: string | null; slug: string };
}

function OrderManualDelivery({
  order,
  licenseKey,
  setLicenseKey,
  deliverNote,
  setDeliverNote,
  onDeliver,
  deliveringOrder,
}: {
  order: ProOrderItem;
  licenseKey: string;
  setLicenseKey: (v: string) => void;
  deliverNote: string;
  setDeliverNote: (v: string) => void;
  onDeliver: (id: string) => void;
  deliveringOrder: string | null;
}) {
  const [showInventory, setShowInventory] = useState(false);
  const [inventory, setInventory] = useState<InvItem[]>([]);
  const [loadingInv, setLoadingInv] = useState(false);
  const [tab, setTab] = useState<"inventory" | "manual">("inventory");

  const loadInventory = async () => {
    setLoadingInv(true);
    try {
      // Fetch available licenses for each item's product+billingCycle
      const results = await Promise.all(
        order.items.map(async (item) => {
          const res = await fetch(
            `/api/admin/licenses/inventory?productId=${item.productId}&billingCycle=${item.billingCycle}&status=available`,
            { credentials: "include" }
          );
          const json = await res.json();
          return json.success ? (json.data?.items || []) as InvItem[] : [];
        })
      );
      setInventory(results.flat());
    } catch {
      setInventory([]);
    } finally {
      setLoadingInv(false);
    }
  };

  useEffect(() => {
    if (showInventory) loadInventory();
  }, [showInventory]);

  return (
    <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
      <p className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
        <Key size={14} /> License Delivery Required
      </p>

      {/* Toggle inventory view */}
      <button
        onClick={() => setShowInventory(!showInventory)}
        className="text-xs text-amber-400/70 hover:text-amber-400 mb-3 flex items-center gap-1 transition-colors"
      >
        <PackagePlus size={12} />
        {showInventory ? "Hide inventory" : "Show available inventory"}
      </button>

      <AnimatePresence>
        {showInventory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-3"
          >
            {/* Tab switch */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setTab("inventory")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  tab === "inventory"
                    ? "bg-gold/20 text-gold border border-gold/30"
                    : "bg-white/5 text-gray-400 border border-white/10"
                }`}
              >
                From Inventory
              </button>
              <button
                onClick={() => setTab("manual")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  tab === "manual"
                    ? "bg-gold/20 text-gold border border-gold/30"
                    : "bg-white/5 text-gray-400 border border-white/10"
                }`}
              >
                Manual Key
              </button>
            </div>

            {tab === "inventory" ? (
              <div className="space-y-2">
                {loadingInv ? (
                  <div className="flex items-center gap-2 py-3 text-xs text-gray-400">
                    <Loader2 size={14} className="animate-spin" /> Loading inventory...
                  </div>
                ) : inventory.length === 0 ? (
                  <div className="py-3 text-xs text-amber-400/70">
                    No available license in inventory for this order&apos;s products.
                    <br />
                    Add licenses via the Licenses tab, or use &quot;Manual Key&quot;.
                  </div>
                ) : (
                  inventory.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5 border border-white/5"
                    >
                      <div>
                        <p className="text-xs text-gray-400">
                          {inv.product?.nameFa || inv.productName || inv.productId}
                          {inv.billingCycle && (
                            <span className="text-gold/60 ml-1">({inv.billingCycle})</span>
                          )}
                        </p>
                        <p className="text-xs font-mono text-gray-300">
                          {inv.licenseKey.length > 16
                            ? `${inv.licenseKey.slice(0, 8)}...${inv.licenseKey.slice(-8)}`
                            : inv.licenseKey}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setLicenseKey(inv.licenseKey);
                          setTab("manual");
                        }}
                        className="px-2.5 py-1 rounded text-xs bg-gold/20 border border-gold/30 text-gold hover:bg-gold/30 transition-colors"
                      >
                        Select
                      </button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="Enter or paste license key..."
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:border-gold/30 focus:outline-none font-mono"
                />
                <input
                  type="text"
                  value={deliverNote}
                  onChange={(e) => setDeliverNote(e.target.value)}
                  placeholder="Note (optional)..."
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:border-gold/30 focus:outline-none"
                />
                <button
                  onClick={() => onDeliver(order.id)}
                  disabled={deliveringOrder === order.id || !licenseKey.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gold/20 border border-gold/30 text-gold text-sm font-medium hover:bg-gold/30 transition-colors disabled:opacity-50"
                >
                  {deliveringOrder === order.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  Deliver License
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact manual deliver when inventory not shown */}
      {!showInventory && (
        <div className="space-y-3">
          <input
            type="text"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            placeholder="Enter license key..."
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:border-gold/30 focus:outline-none font-mono"
          />
          <input
            type="text"
            value={deliverNote}
            onChange={(e) => setDeliverNote(e.target.value)}
            placeholder="Note (optional)..."
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:border-gold/30 focus:outline-none"
          />
          <button
            onClick={() => onDeliver(order.id)}
            disabled={deliveringOrder === order.id || !licenseKey.trim()}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gold/20 border border-gold/30 text-gold text-sm font-medium hover:bg-gold/30 transition-colors disabled:opacity-50"
          >
            {deliveringOrder === order.id ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            Deliver License
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Order Card ──────────────────────────────────────────────────────────────

function OrderCard({
  order,
  isExpanded,
  onToggle,
  onVerify,
  onDeliver,
  onSaveNote,
  verifyingOrder,
  deliveringOrder,
  licenseKey,
  setLicenseKey,
  deliverNote,
  setDeliverNote,
  adminNote,
  setAdminNote,
  displayPrice,
}: {
  order: ProOrderItem;
  isExpanded: boolean;
  onToggle: () => void;
  onVerify: (id: string, approved: boolean) => void;
  onDeliver: (id: string) => void;
  onSaveNote: (id: string) => void;
  verifyingOrder: string | null;
  deliveringOrder: string | null;
  licenseKey: string;
  setLicenseKey: (v: string) => void;
  deliverNote: string;
  setDeliverNote: (v: string) => void;
  adminNote: string;
  setAdminNote: (v: string) => void;
  displayPrice: (usd: number) => string;
}) {
  const statusConfig = ORDER_STATUS_CONFIG[order.status] || {
    label: order.status,
    color: "#9CA3AF",
    bg: "rgba(107,114,128,0.15)",
  };
  const isPendingVerification = order.status === "payment_submitted";
  const isAwaitingLicense =
    order.status === "awaiting_license" || order.status === "license_out_of_stock";
  const isCompleted = order.status === "completed";
  const isRejected = order.status === "payment_rejected";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border overflow-hidden"
      style={{ background: "rgba(10,14,26,0.9)", borderColor: "rgba(201,150,58,0.15)" }}
    >
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gold font-mono">
              #{`${order.id.slice(-8).toUpperCase()}`}
            </span>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: statusConfig.bg, color: statusConfig.color }}
            >
              {statusConfig.label}
            </span>
            {order.last4Digits && (
              <span className="text-xs text-gray-500 font-mono">
                **** {order.last4Digits}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-white">{displayPrice(order.total)}</span>
            {isExpanded ? (
              <ChevronUp size={16} className="text-gray-500" />
            ) : (
              <ChevronDown size={16} className="text-gray-500" />
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <User size={12} /> {order.user?.username || "—"}
          </span>
          <span className="flex items-center gap-1">
            <Hash size={12} /> {order.items.length} items
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} /> {new Date(order.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/5 space-y-4">
              {/* Items */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Items</p>
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 px-3 rounded-lg bg-white/5">
                    <span className="text-sm text-gray-300">
                      {item.productName} ({item.billingCycle})
                    </span>
                    <span className="text-sm text-gray-400">
                      {displayPrice(item.price)} x{item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Payment Verification Actions */}
              {isPendingVerification && (
                <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                  <p className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <CreditCard size={14} /> Payment Verification Required
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onVerify(order.id, true)}
                      disabled={verifyingOrder === order.id}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50"
                    >
                      {verifyingOrder === order.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <CheckCircle size={14} />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => onVerify(order.id, false)}
                      disabled={verifyingOrder === order.id}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                      {verifyingOrder === order.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <XCircle size={14} />
                      )}
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Manual License Delivery */}
              {isAwaitingLicense && (
                <OrderManualDelivery
                  order={order}
                  licenseKey={licenseKey}
                  setLicenseKey={setLicenseKey}
                  deliverNote={deliverNote}
                  setDeliverNote={setDeliverNote}
                  onDeliver={onDeliver}
                  deliveringOrder={deliveringOrder}
                />
              )}

              
              {/* Rejection Reason */}
              {isRejected && order.rejectionReason && (
                <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                  <p className="text-sm font-semibold text-red-400 mb-1 flex items-center gap-2">
                    <AlertTriangle size={14} /> Rejection Reason
                  </p>
                  <p className="text-sm text-red-300">{order.rejectionReason}</p>
                </div>
              )}

              {/* Status Logs (Audit Trail) */}
              {order.statusLogs && order.statusLogs.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Audit Trail
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {order.statusLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center gap-2 text-[11px] text-gray-400 py-1 px-2 rounded bg-white/[0.02]"
                      >
                        <Clock size={10} className="text-gray-600 flex-shrink-0" />
                        <span className="text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                        <span className="text-gray-300">{log.action}</span>
                        {log.adminName && (
                          <span className="text-gray-500">by {log.adminName}</span>
                        )}
                        {log.note && (
                          <span className="text-gray-600 truncate">— {log.note}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Timestamps & License Delivery */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Timeline & License Delivery
                </p>
                <div className="space-y-2">
                  {/* Order Created */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0 mt-1.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500">سفارش ثبت شد</p>
                      <p className="text-sm text-white font-mono">
                        {new Date(order.createdAt).toLocaleString("fa-IR", {
                          year: "numeric", month: "2-digit", day: "2-digit",
                          hour: "2-digit", minute: "2-digit", second: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Payment Submitted */}
                  {(() => {
                    const paymentLog = order.statusLogs?.find((l) => l.toStatus === "payment_submitted");
                    if (!paymentLog) return null;
                    return (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-gray-500">پرداخت کارت به کارت ارسال شد</p>
                          <p className="text-sm text-white font-mono">
                            {new Date(paymentLog.createdAt).toLocaleString("fa-IR", {
                              year: "numeric", month: "2-digit", day: "2-digit",
                              hour: "2-digit", minute: "2-digit", second: "2-digit"
                            })}
                          </p>
                          {paymentLog.adminName && (
                            <p className="text-[10px] text-gray-500">توسط: {paymentLog.adminName}</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Admin Verification */}
                  {(() => {
                    const verifyLog = order.statusLogs?.find((l) => l.toStatus === "payment_confirmed");
                    if (!verifyLog) return null;
                    return (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 mt-1.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-gray-500">تایید توسط ادمین</p>
                          <p className="text-sm text-white font-mono">
                            {new Date(verifyLog.createdAt).toLocaleString("fa-IR", {
                              year: "numeric", month: "2-digit", day: "2-digit",
                              hour: "2-digit", minute: "2-digit", second: "2-digit"
                            })}
                          </p>
                          {verifyLog.adminName && (
                            <p className="text-[10px] text-gray-500">توسط ادمین: {verifyLog.adminName}</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* License Deliveries */}
                  {order.licenseDeliveries && order.licenseDeliveries.length > 0 && (
                    <>
                      {order.licenseDeliveries.map((delivery, idx) => (
                        <div
                          key={delivery.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
                        >
                          <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{
                            backgroundColor: delivery.method === "auto" ? "#00FF88" : "#C9963A"
                          }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-[10px] text-gray-500">لایسنس تحویل داده شد</p>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                                delivery.method === "auto"
                                  ? "bg-success/20 text-success border border-success/30"
                                  : "bg-gold/20 text-gold border border-gold/30"
                              }`}>
                                {delivery.method === "auto" ? "اتوماتیک (از انبار)" : "دستی (توسط ادمین)"}
                              </span>
                            </div>
                            <p className="text-sm text-white font-mono">
                              {new Date(delivery.deliveredAt).toLocaleString("fa-IR", {
                                year: "numeric", month: "2-digit", day: "2-digit",
                                hour: "2-digit", minute: "2-digit", second: "2-digit"
                              })}
                            </p>
                            {delivery.adminName && (
                              <p className="text-[10px] text-gray-500">
                                {delivery.method === "auto" ? "سیستم خودکار" : `توسط ادمین: ${delivery.adminName}`}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Completed */}
                  {order.status === "completed" && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                      <div className="w-2 h-2 rounded-full bg-gold flex-shrink-0 mt-1.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-gray-500">سفارش تکمیل شد</p>
                        <p className="text-sm text-white font-mono">
                          {new Date(order.updatedAt).toLocaleString("fa-IR", {
                            year: "numeric", month: "2-digit", day: "2-digit",
                            hour: "2-digit", minute: "2-digit", second: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* No license delivered yet but status is payment_confirmed or awaiting_license */}
                  {((order.status === "payment_confirmed" || order.status === "awaiting_license" || order.status === "license_out_of_stock") &&
                    (!order.licenseDeliveries || order.licenseDeliveries.length === 0)) && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-amber-400">لایسنس هنوز تحویل داده نشده</p>
                        <p className="text-sm text-amber-300">منتظر تحویل لایسنس (اتوماتیک یا دستی) است...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Internal Note */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Admin Internal Note
                </p>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Internal note (not visible to user)..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:border-gold/30 focus:outline-none resize-none"
                />
                <button
                  onClick={() => onSaveNote(order.id)}
                  className="mt-2 px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 transition-colors"
                >
                  Save Note
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
