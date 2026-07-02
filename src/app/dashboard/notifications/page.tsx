"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCheck,
  Package,
  Key,
  MessageSquare,
  Wallet,
  Loader2,
} from "lucide-react";
import { useLang } from "@/context/LangContext";
import { toast } from "@/store/toast-store";
import { Button } from "@/components/ui/Button";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  type: "order" | "license" | "ticket" | "system" | "wallet";
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    total: number;
    unreadCount: number;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<string, React.ReactNode> = {
  order: <Package size={18} />,
  license: <Key size={18} />,
  ticket: <MessageSquare size={18} />,
  wallet: <Wallet size={18} />,
  system: <Bell size={18} />,
};

const TYPE_COLORS: Record<string, string> = {
  order: "text-gold bg-gold/10",
  license: "text-cyber bg-cyber/10",
  ticket: "text-success bg-success/10",
  wallet: "text-purple-400 bg-purple-400/10",
  system: "text-gray-400 bg-gray-400/10",
};

const TYPE_LABELS_FA: Record<string, string> = {
  order: "سفارش",
  license: "لایسنس",
  ticket: "تیکت",
  wallet: "کیف پول",
  system: "سیستم",
};

const TYPE_LABELS_EN: Record<string, string> = {
  order: "Order",
  license: "License",
  ticket: "Ticket",
  wallet: "Wallet",
  system: "System",
};

function timeAgo(dateStr: string, lang: "fa" | "en"): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (lang === "fa") {
    if (diffSec < 60) return "همین الان";
    if (diffMin < 60) return `${diffMin} دقیقه پیش`;
    if (diffHour < 24) return `${diffHour} ساعت پیش`;
    if (diffDay < 7) return `${diffDay} روز پیش`;
    if (diffDay < 30) return `${Math.floor(diffDay / 7)} هفته پیش`;
    return `${Math.floor(diffDay / 30)} ماه پیش`;
  }

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
  return `${Math.floor(diffDay / 30)}mo ago`;
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-xl bg-obsidian-light border border-obsidian-lighter p-4 animate-pulse"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/5 rounded w-1/3" />
              <div className="h-3 bg-white/5 rounded w-3/4" />
              <div className="h-3 bg-white/5 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Notification Card ───────────────────────────────────────────────────────

function NotificationCard({
  notification,
  index,
  isRTL,
  lang,
  onMarkRead,
}: {
  notification: Notification;
  index: number;
  isRTL: boolean;
  lang: "fa" | "en";
  onMarkRead: (id: string, link: string | null) => void;
}) {
  const icon = TYPE_ICONS[notification.type] ?? <Bell size={18} />;
  const colorClass = TYPE_COLORS[notification.type] ?? "text-gray-400 bg-gray-400/10";
  const typeLabel =
    lang === "fa"
      ? TYPE_LABELS_FA[notification.type]
      : TYPE_LABELS_EN[notification.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      onClick={() => onMarkRead(notification.id, notification.link)}
      className={`group relative rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
        notification.read
          ? "bg-obsidian-light/50 border-obsidian-lighter/50 hover:border-obsidian-lighter"
          : "bg-obsidian-light border-obsidian-lighter hover:border-gold/20"
      }`}
    >
      {/* Unread indicator dot */}
      {!notification.read && (
        <div
          className="absolute w-2 h-2 rounded-full bg-gold"
          style={{
            top: "1rem",
            ...(isRTL ? { right: "-0.35rem" } : { left: "-0.35rem" }),
          }}
        />
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {typeLabel}
            </span>
            <span className="text-xs text-gray-600">
              {timeAgo(notification.createdAt, lang)}
            </span>
          </div>
          <h3
            className={`text-sm font-semibold mb-1 ${
              notification.read ? "text-gray-300" : "text-white"
            }`}
            style={{ fontFamily: "var(--font-fa)" }}
          >
            {notification.title}
          </h3>
          <p
            className="text-xs text-gray-500 line-clamp-2"
            style={{ fontFamily: "var(--font-fa)" }}
          >
            {notification.message}
          </p>
        </div>

        {/* Read indicator */}
        {notification.read && (
          <div className="flex-shrink-0 mt-1">
            <CheckCheck size={14} className="text-gray-600" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { isRTL, lang } = useLang();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);

  // Fetch notifications on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) throw new Error("Failed to fetch");
        const json: NotificationsResponse = await res.json();
        if (cancelled) return;

        if (json.success) {
          setNotifications(json.data.notifications);
          setUnreadCount(json.data.unreadCount);
          setTotal(json.data.total);
        }
      } catch {
        if (!cancelled) {
          toast.error(
            lang === "fa" ? "خطا در بارگذاری" : "Load Error",
            lang === "fa"
              ? "بارگذاری اعلان‌ها با خطا مواجه شد"
              : "Failed to load notifications"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchNotifications();
    return () => {
      cancelled = true;
    };
  }, [lang]);

  // Mark a single notification as read
  const handleMarkRead = useCallback(
    async (id: string, link: string | null) => {
      // Optimistic UI update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await fetch("/api/notifications", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: [id] }),
        });
      } catch {
        // Revert on failure
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: false } : n))
        );
        setUnreadCount((prev) => prev + 1);
        toast.error(
          lang === "fa" ? "خطا" : "Error",
          lang === "fa"
            ? "خطا در بروزرسانی اعلان"
            : "Failed to update notification"
        );
        return;
      }

      // Navigate to link if present
      if (link) {
        window.location.href = link;
      }
    },
    [lang]
  );

  // Mark all as read
  const handleMarkAllRead = useCallback(async () => {
    if (unreadCount === 0) return;
    setMarkingRead(true);

    // Optimistic update
    const previousNotifications = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (!res.ok) throw new Error("Failed");

      toast.success(
        lang === "fa" ? "انجام شد" : "Done",
        lang === "fa"
          ? "همه اعلان‌ها خوانده شدند"
          : "All notifications marked as read"
      );
    } catch {
      // Revert
      setNotifications(previousNotifications);
      setUnreadCount(previousNotifications.filter((n) => !n.read).length);
      toast.error(
        lang === "fa" ? "خطا" : "Error",
        lang === "fa" ? "خطا در بروزرسانی" : "Failed to mark all as read"
      );
    } finally {
      setMarkingRead(false);
    }
  }, [unreadCount, notifications, lang]);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-bold text-white mb-2 flex items-center gap-2"
              style={{ fontFamily: "var(--font-fa)" }}
            >
              {lang === "fa" ? "اعلان‌ها" : "Notifications"}
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-obsidian bg-gold rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-gray-400" style={{ fontFamily: "var(--font-fa)" }}>
              {lang === "fa"
                ? `${total} اعلان · ${unreadCount} خوانده نشده`
                : `${total} total · ${unreadCount} unread`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={
              markingRead ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCheck className="w-4 h-4" />
              )
            }
            onClick={handleMarkAllRead}
            disabled={markingRead || unreadCount === 0}
          >
            {lang === "fa" ? "خواندن همه" : "Mark all read"}
          </Button>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl bg-obsidian-light border border-obsidian-lighter p-4 sm:p-6"
      >
        {loading ? (
          <NotificationSkeleton />
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Bell size={32} className="text-gray-700" />
            </div>
            <p
              className="text-gray-500 text-lg mb-2"
              style={{ fontFamily: "var(--font-fa)" }}
            >
              {lang === "fa" ? "اعلانی وجود ندارد" : "No notifications"}
            </p>
            <p
              className="text-gray-600 text-sm"
              style={{ fontFamily: "var(--font-fa)" }}
            >
              {lang === "fa"
                ? "اعلان‌های جدید اینجا نمایش داده می‌شوند"
                : "New notifications will appear here"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {notifications.map((notification, index) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  index={index}
                  isRTL={isRTL}
                  lang={lang}
                  onMarkRead={handleMarkRead}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
