"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Send,
  Clock,
  MessageSquare,
  AlertCircle,
  XCircle,
  Loader2,
  Shield,
  CheckCircle,
} from "lucide-react";
import { useLang } from "@/context/LangContext";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "@/store/toast-store";
import type { Ticket, TicketMessage } from "@/types";

const STATUS_CONFIG = {
  open: { variant: "success" as const, label: "باز", icon: Clock },
  answered: { variant: "cyber" as const, label: "پاسخ داده شده", icon: MessageSquare },
  pending: { variant: "warning" as const, label: "در انتظار", icon: AlertCircle },
  closed: { variant: "default" as const, label: "بسته", icon: XCircle },
} as const;

function formatDate(dateStr: string, lang: "fa" | "en"): string {
  try {
    const date = new Date(dateStr);
    if (lang === "fa") {
      return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    }
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return dateStr;
  }
}

function StatusBadge({ status }: { status: Ticket["status"] }) {
  const { lang } = useLang();
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const colorMap = {
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    cyber: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    default: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${colorMap[config.variant]}`}
      style={{ fontFamily: "var(--font-fa)" }}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}

function MessageBubble({
  message,
  isCurrentUser,
  isRTL,
  index,
}: {
  message: TicketMessage;
  isCurrentUser: boolean;
  isRTL: boolean;
  index: number;
}) {
  const { lang } = useLang();
  const isUser = isCurrentUser;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex ${isUser ? (isRTL ? "justify-start" : "justify-end") : (isRTL ? "justify-end" : "justify-start")}`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 sm:px-5 ${
          isUser
            ? "border border-gold/20 bg-gold/10"
            : "glass-card"
        }`}
      >
        <div className="mb-1.5 flex items-center gap-2">
          <span
            className={`text-xs font-semibold ${isUser ? "text-gold" : "text-cyber"}`}
            style={{ fontFamily: "var(--font-fa)" }}
          >
            {isUser ? (lang === "fa" ? "شما" : "You") : (lang === "fa" ? "پشتیبانی" : "Support")}
          </span>
          <span className="text-[10px] text-gray-600">
            {formatDate(message.createdAt, lang)}
          </span>
        </div>
        <p
          className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap"
          style={{ fontFamily: "var(--font-fa)" }}
        >
          {message.text}
        </p>
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-6 w-48 animate-pulse rounded bg-white/5" />
      <div className="rounded-xl border border-obsidian-lighter bg-obsidian-light p-6">
        <div className="space-y-3">
          <div className="h-5 w-3/4 animate-pulse rounded bg-white/5" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-white/5" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-white/5" />
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
          >
            <div className="h-24 w-3/4 max-w-md animate-pulse rounded-2xl bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TicketDetailPage() {
  const params = useParams();
  const { lang, isRTL, dir } = useLang();
  const { user } = useAuthStore();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [closing, setClosing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTicket = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to load ticket");
      }
      setTicket(json.data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "خطا در بارگذاری تیکت";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  useEffect(() => {
    if (ticket?.messages.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [ticket?.messages.length]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "reply", text: replyText.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to send reply");
      }
      setReplyText("");
      toast.success(
        lang === "fa" ? "پیام ارسال شد" : "Message sent",
        lang === "fa" ? "پیام شما با موفقیت ارسال شد." : "Your message has been sent successfully."
      );
      await fetchTicket();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "خطا در ارسال پیام";
      toast.error(
        lang === "fa" ? "خطا" : "Error",
        message
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseTicket = async () => {
    if (closing) return;
    const confirmed = window.confirm(
      lang === "fa"
        ? "آیا از بستن این تیکت اطمینان دارید؟"
        : "Are you sure you want to close this ticket?"
    );
    if (!confirmed) return;

    setClosing(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "close" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to close ticket");
      }
      toast.success(
        lang === "fa" ? "تیکت بسته شد" : "Ticket closed",
        lang === "fa" ? "تیکت با موفقیت بسته شد." : "Ticket has been closed successfully."
      );
      await fetchTicket();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "خطا در بستن تیکت";
      toast.error(
        lang === "fa" ? "خطا" : "Error",
        message
      );
    } finally {
      setClosing(false);
    }
  };

  const isMessageOwner = (msg: TicketMessage) => {
    return user?.id === msg.userId;
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="mx-auto max-w-4xl space-y-6" dir={dir}>
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-sm text-gray-500"
      >
        <a
          href="/dashboard/tickets"
          className="transition-colors hover:text-gold"
          style={{ fontFamily: "var(--font-fa)" }}
        >
          {lang === "fa" ? "پشتیبانی" : "Support"}
        </a>
        <ArrowRight size={14} className="rotate-180" />
        <span className="font-mono text-gold">#{ticketId}</span>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingSkeleton />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 py-16 text-center"
          >
            <AlertCircle size={48} className="mb-4 text-red-400" />
            <h2
              className="mb-2 text-lg font-bold text-white"
              style={{ fontFamily: "var(--font-fa)" }}
            >
              {lang === "fa" ? "خطا" : "Error"}
            </h2>
            <p
              className="mb-6 text-sm text-gray-400"
              style={{ fontFamily: "var(--font-fa)" }}
            >
              {error}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchTicket}
              className="btn-gold px-6 py-2 text-sm"
            >
              {lang === "fa" ? "تلاش مجدد" : "Retry"}
            </motion.button>
          </motion.div>
        ) : ticket ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Ticket Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-xl border border-obsidian-lighter bg-obsidian-light p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-sm text-gray-500">
                  #{ticket.id}
                </span>
                <StatusBadge status={ticket.status} />
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
                  {ticket.game}
                </span>
              </div>
              <h1
                className="mt-3 text-lg font-bold text-white sm:text-xl"
                style={{ fontFamily: "var(--font-fa)" }}
              >
                {ticket.subject}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span style={{ fontFamily: "var(--font-fa)" }}>
                  {lang === "fa" ? "ایجاد شده:" : "Created:"}{" "}
                  {formatDate(ticket.createdAt, lang)}
                </span>
                {ticket.updatedAt !== ticket.createdAt && (
                  <span style={{ fontFamily: "var(--font-fa)" }}>
                    {lang === "fa" ? "آخرین بروزرسانی:" : "Last updated:"}{" "}
                    {formatDate(ticket.updatedAt, lang)}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Messages Thread */}
            <div className="space-y-4">
              {ticket.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-obsidian-lighter bg-obsidian-light py-12 text-center">
                  <MessageSquare size={36} className="mb-3 text-gray-600" />
                  <p
                    className="text-sm text-gray-500"
                    style={{ fontFamily: "var(--font-fa)" }}
                  >
                    {lang === "fa"
                      ? "هنوز پیامی ارسال نشده است."
                      : "No messages yet."}
                  </p>
                </div>
              ) : (
                ticket.messages.map((msg, i) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isCurrentUser={isMessageOwner(msg)}
                    isRTL={isRTL}
                    index={i}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Form & Actions */}
            {ticket.status !== "closed" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                {/* Reply Form */}
                <form
                  onSubmit={handleReply}
                  className="rounded-xl border border-obsidian-lighter bg-obsidian-light p-4 sm:p-5"
                >
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-400">
                    <Shield size={14} className="text-gold" />
                    <span style={{ fontFamily: "var(--font-fa)" }}>
                      {lang === "fa" ? "ارسال پاسخ" : "Send Reply"}
                    </span>
                  </div>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={
                      lang === "fa"
                        ? "پیام خود را بنویسید..."
                        : "Write your message..."
                    }
                    rows={4}
                    className="input-gold resize-none"
                    style={{ fontFamily: "var(--font-fa)" }}
                    disabled={submitting}
                    maxLength={5000}
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-gray-600">
                      {replyText.length}/5000
                    </span>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={submitting || !replyText.trim()}
                      className="btn-gold flex items-center gap-2 px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                      <span style={{ fontFamily: "var(--font-fa)" }}>
                        {submitting
                          ? (lang === "fa" ? "در حال ارسال..." : "Sending...")
                          : (lang === "fa" ? "ارسال" : "Send")}
                      </span>
                    </motion.button>
                  </div>
                </form>

                {/* Close Ticket Button */}
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCloseTicket}
                    disabled={closing}
                    className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {closing ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <XCircle size={14} />
                    )}
                    <span style={{ fontFamily: "var(--font-fa)" }}>
                      {lang === "fa" ? "بستن تیکت" : "Close Ticket"}
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Closed Notice */}
            {ticket.status === "closed" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-500/20 bg-gray-500/5 py-4 text-sm text-gray-400"
              >
                <CheckCircle size={16} />
                <span style={{ fontFamily: "var(--font-fa)" }}>
                  {lang === "fa"
                    ? "این تیکت بسته شده است."
                    : "This ticket is closed."}
                </span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="notfound"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center rounded-xl border border-obsidian-lighter bg-obsidian-light py-16 text-center"
          >
            <AlertCircle size={48} className="mb-4 text-gray-600" />
            <h2
              className="mb-2 text-lg font-bold text-white"
              style={{ fontFamily: "var(--font-fa)" }}
            >
              {lang === "fa" ? "تیکت یافت نشد" : "Ticket Not Found"}
            </h2>
            <p
              className="mb-6 text-sm text-gray-500"
              style={{ fontFamily: "var(--font-fa)" }}
            >
              {lang === "fa"
                ? "تیکت مورد نظر وجود ندارد یا شما دسترسی به آن ندارید."
                : "The requested ticket does not exist or you do not have access to it."}
            </p>
            <a
              href="/dashboard/tickets"
              className="btn-gold flex items-center gap-2 px-6 py-2 text-sm"
            >
              <BackIcon size={16} />
              <span style={{ fontFamily: "var(--font-fa)" }}>
                {lang === "fa" ? "بازگشت به تیکت‌ها" : "Back to Tickets"}
              </span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
