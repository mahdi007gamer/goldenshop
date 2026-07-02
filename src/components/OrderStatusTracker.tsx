"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle, Clock, XCircle, Loader2, Key, Shield,
  AlertTriangle, PartyPopper, BookOpen,
} from "lucide-react";
import { useLang } from "@/context/LangContext";
import Link from "next/link";

type TrackedStatus =
  | "payment_submitted"
  | "payment_verifying"
  | "payment_confirmed"
  | "payment_rejected"
  | "completed"
  | "awaiting_license"
  | "license_out_of_stock";

interface StatusLicense {
  id: string;
  key: string;
  status: string;
  productName: string;
  expiresAt: string;
}

interface StatusResponse {
  id: string;
  status: TrackedStatus;
  paymentStatus: string;
  last4Digits: string | null;
  rejectionReason: string | null;
  remainingSeconds: number;
  estimatedCompletion: string;
  courseSlug: string | null;
  licenses: StatusLicense[];
  licenseDelivery: { id: string; deliveredAt: string; method: string } | null;
  items: { productName: string; billingCycle: string; productId?: string }[];
}

interface OrderStatusTrackerProps {
  orderId: string;
}

export default function OrderStatusTracker({ orderId }: OrderStatusTrackerProps) {
  const { lang } = useLang();
  const isFa = lang === "fa";

  const [status, setStatus] = useState<TrackedStatus>("payment_submitted");
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [license, setLicense] = useState<{ key: string; productName: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [last4Digits, setLast4Digits] = useState<string | null>(null);
  const [courseSlug, setCourseSlug] = useState<string | null>(null);

  const submissionTimeRef = useRef<Date | null>(null);
  const dispatchedRef = useRef(false);
  const initializedFromAPI = useRef(false);

  // Poll for status updates
  const checkStatus = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        const d = data.data as StatusResponse;
        const prevStatus = status;
        setStatus(d.status);

        // Only use API remainingSeconds on first load or when status changes
        // After that, let the local 1-second timer handle smooth countdown
        if (!initializedFromAPI.current || d.status !== prevStatus) {
          setRemainingSeconds(d.remainingSeconds ?? 0);
          initializedFromAPI.current = true;
        }

        setLast4Digits(d.last4Digits);
        setCourseSlug(d.courseSlug || null);
        if (d.licenses?.length > 0) {
          setLicense({ key: d.licenses[0].key, productName: d.licenses[0].productName });
        }
        if (d.rejectionReason) {
          setRejectionReason(d.rejectionReason);
        }

        // Reset initialized flag when leaving waiting states
        if (d.status !== "payment_submitted" && d.status !== "payment_verifying") {
          initializedFromAPI.current = false;
        }
      }
    } catch {
      // silent fail for polling
    } finally {
      setChecking(false);
    }
  }, [orderId, status]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  // Stop polling when we reach a terminal state
  useEffect(() => {
    if (status === "completed" || status === "payment_rejected") {
      // Polling interval already cleaned up by the effect above's cleanup
      // This just prevents re-polling if component stays mounted
    }
  }, [status]);

  // Countdown timer - smooth local decrement, synced with API every 10s
  useEffect(() => {
    if (status === "payment_submitted" || status === "payment_verifying") {
      const timer = setInterval(() => {
        setRemainingSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
    // Reset seconds if we leave the waiting states
    if (status !== "payment_submitted" && status !== "payment_verifying") {
      setRemainingSeconds(0);
    }
  }, [status]);

  // Dispatch custom event when order completes (for global celebration)
  useEffect(() => {
    if (status === "completed" && !dispatchedRef.current) {
      window.dispatchEvent(
        new CustomEvent("order-completed", { detail: { orderId } })
      );
      dispatchedRef.current = true;
    }
  }, [status, orderId, dispatchedRef]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ─── State: Submitted / Verifying ──────────────────────────────────────────
  if (status === "payment_submitted" || status === "payment_verifying") {
    return (
      <div className="min-h-screen bg-obsidian text-gray-200 flex items-center justify-center px-4">
        <div className="smoke" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full relative z-10"
        >
          {/* Animated double-ring spinner */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-transparent"
              style={{ borderTopColor: "#3B82F6", borderRightColor: "rgba(59,130,246,0.3)" }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 rounded-full border-2 border-transparent"
              style={{ borderBottomColor: "#8B5CF6", borderLeftColor: "rgba(139,92,246,0.3)" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Clock size={32} className="text-blue-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-blue-400 mb-2 font-display">
            {isFa ? "پرداخت شما ثبت شد!" : "Payment Submitted!"}
          </h1>
          <p className="text-gray-400 mb-6">
            {isFa ? "در انتظار تأیید توسط ادمین" : "Awaiting admin verification"}
          </p>

          {/* Countdown */}
          <div className="bg-obsidian-light rounded-xl border border-blue-500/20 p-6 mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              {isFa ? "زمان تقریبی تأیید" : "Estimated verification time"}
            </p>
            <motion.p
              key={remainingSeconds}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className="text-4xl font-mono font-bold text-blue-400"
            >
              {formatTime(remainingSeconds)}
            </motion.p>
            <p className="text-xs text-gray-500 mt-2">
              {isFa ? "تا تأیید ادمین" : "Until admin verification"}
            </p>
          </div>

          {checking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-4"
            >
              <Loader2 size={12} className="animate-spin" />
              {isFa ? "در حال بررسی..." : "Checking..."}
            </motion.div>
          )}

          {last4Digits && (
            <div className="bg-obsidian-light rounded-xl border border-white/5 p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {isFa ? "چهار رقم کارت" : "Card last 4"}
                </span>
                <span className="font-mono text-gold">**** {last4Digits}</span>
              </div>
            </div>
          )}

          <div className="bg-obsidian-light rounded-xl border border-white/5 p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">
              {isFa ? "شماره سفارش" : "Order ID"}
            </p>
            <p className="font-mono text-gold">{orderId.slice(-8).toUpperCase()}</p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
            <Shield size={12} />
            <span>{isFa ? "در انتظار تأیید امن" : "Secure verification in progress"}</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── State: Payment Rejected ───────────────────────────────────────────────
  if (status === "payment_rejected") {
    return (
      <div className="min-h-screen bg-obsidian text-gray-200 flex items-center justify-center px-4">
        <div className="smoke" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full relative z-10"
        >
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", damping: 10 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-danger/10 border-2 border-danger/30 flex items-center justify-center"
          >
            <XCircle size={40} className="text-danger" />
          </motion.div>

          <h1 className="text-2xl font-bold text-danger mb-2 font-display">
            {isFa ? "پرداخت رد شد" : "Payment Rejected"}
          </h1>
          <p className="text-gray-400 mb-4">
            {isFa ? "متأسفانه پرداخت شما تأیید نشد" : "Unfortunately your payment was not verified"}
          </p>

          {rejectionReason && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-danger/10 border border-danger/20 mb-6"
            >
              <p className="text-sm text-danger/80">{rejectionReason}</p>
            </motion.div>
          )}

          <p className="text-sm text-gray-500 mb-6">
            {isFa
              ? "می‌توانید اطلاعات پرداخت را اصلاح کرده و مجدداً ارسال کنید"
              : "You can correct your payment info and resubmit"}
          </p>

          <div className="flex flex-col gap-3">
            <Link href={`/checkout/${orderId}`}>
              <button className="btn-gold w-full py-3 flex items-center justify-center gap-2">
                {isFa ? "ارسال مجدد پرداخت" : "Resubmit Payment"}
              </button>
            </Link>
            <Link href="/dashboard/orders">
              <button className="btn-outline-gold w-full py-3 flex items-center justify-center gap-2">
                {isFa ? "مشاهده سفارشات" : "View Orders"}
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
      );
  }

  // ─── State: Completed with License ─────────────────────────────────────────
  if (status === "completed" && license) {
    return (
      <div className="min-h-screen bg-obsidian text-gray-200 flex items-center justify-center px-4 relative overflow-hidden">
        <div className="smoke" />
        {/* Confetti particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -100, x: (i - 10) * 30 }}
            animate={{
              opacity: [0, 1, 0],
              y: 600,
              rotate: i * 45,
            }}
            transition={{
              duration: 3,
              delay: i * 0.15,
              repeat: Infinity,
              repeatDelay: 5,
            }}
            className="absolute top-0 w-2 h-2 rounded-full"
            style={{
              left: `${(i * 5) % 100}%`,
              background: ["#C9963A", "#00F0FF", "#00FF88", "#FF3366"][i % 4],
            }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="text-center max-w-lg w-full relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", damping: 10 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-success/10 border-2 border-success/30 flex items-center justify-center"
          >
            <PartyPopper size={40} className="text-success" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-success mb-2 font-display"
          >
            {isFa ? "سفارش شما تکمیل شد!" : "Order Complete!"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 mb-8"
          >
            {isFa ? "لایسنس شما آماده استفاده است" : "Your license is ready to use"}
          </motion.p>

          {/* License Key Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-success/10 to-gold/10 rounded-2xl border border-success/30 p-6 mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Key size={16} className="text-success" />
              <span className="text-sm font-semibold text-success">{license.productName}</span>
            </div>
            <div className="bg-obsidian rounded-xl p-4 border border-white/10">
              <p className="font-mono text-lg text-success/90 break-all select-all">
                {license.key}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              {isFa
                ? "این کلید را کپی و در برنامه وارد کنید"
                : "Copy this key and enter it in the application"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col gap-3"
          >
            <Link href="/dashboard/licenses">
              <button className="btn-gold w-full py-3 flex items-center justify-center gap-2">
                <Key size={16} />
                {isFa ? "مشاهده لایسنس‌ها" : "View Licenses"}
              </button>
            </Link>
            {courseSlug && (
              <Link href={`/courses/${courseSlug}`}>
                <button className="w-full py-3 flex items-center justify-center gap-2 rounded-xl border border-gold/30 bg-gold/10 text-gold hover:bg-gold/20 transition-colors text-sm font-medium">
                  <BookOpen size={16} />
                  {isFa ? "راهنمای استفاده" : "Usage Guide"}
                </button>
              </Link>
            )}
            <Link href="/">
              <button className="btn-outline-gold w-full py-3 flex items-center justify-center gap-2">
                {isFa ? "بازگشت به خانه" : "Back to Home"}
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
      );
  }

  // ─── State: Awaiting License / Out of Stock ────────────────────────────────
  if (status === "awaiting_license" || status === "license_out_of_stock") {
    return (
      <div className="min-h-screen bg-obsidian text-gray-200 flex items-center justify-center px-4">
        <div className="smoke" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full relative z-10"
        >
          <div className="relative w-32 h-32 mx-auto mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-transparent"
              style={{ borderTopColor: "#F59E0B", borderRightColor: "rgba(245,158,11,0.3)" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <AlertTriangle size={32} className="text-amber-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-amber-400 mb-2 font-display">
            {isFa ? "پرداخت تأیید شد!" : "Payment Confirmed!"}
          </h1>
          <p className="text-gray-400 mb-6">
            {isFa
              ? "در حال آماده‌سازی لایسنس برای شما. این فرآیند ممکن است چند دقیقه طول بکشد."
              : "Preparing your license. This may take a few minutes."}
          </p>

          <div className="bg-amber-500/10 rounded-xl border border-amber-500/20 p-4 mb-6">
            <p className="text-sm text-amber-300">
              {isFa
                ? "لایسنس شما به صورت دستی توسط ادمین ارسال خواهد شد. از طریق ایمیل یا پیامک اطلاع‌رسانی می‌شود."
                : "Your license will be delivered manually by admin. You'll be notified via email or SMS."}
            </p>
          </div>

          <Link href="/dashboard/orders">
            <button className="btn-outline-gold py-3 inline-flex items-center justify-center gap-2 px-6">
              {isFa ? "مشاهده سفارشات" : "View Orders"}
            </button>
          </Link>
        </motion.div>
      </div>
      );
  }

  // ─── State: Payment Confirmed (but not yet awaiting_license/completed) ─────
  if (status === "payment_confirmed") {
    // If license is already assigned, show the completed view
    if (license) {
      return (
        <div className="min-h-screen bg-obsidian text-gray-200 flex items-center justify-center px-4 relative overflow-hidden">
          <div className="smoke" />
          {/* Confetti particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -100, x: (i - 10) * 30 }}
              animate={{
                opacity: [0, 1, 0],
                y: 600,
                rotate: i * 45,
              }}
              transition={{
                duration: 3,
                delay: i * 0.15,
                repeat: Infinity,
                repeatDelay: 5,
              }}
              className="absolute top-0 w-2 h-2 rounded-full"
              style={{
                left: `${(i * 5) % 100}%`,
                background: ["#C9963A", "#00F0FF", "#00FF88", "#FF3366"][i % 4],
              }}
            />
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="text-center max-w-lg w-full relative z-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 10 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-success/10 border-2 border-success/30 flex items-center justify-center"
            >
              <PartyPopper size={40} className="text-success" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-success mb-2 font-display"
            >
              {isFa ? "پرداخت تأیید شد!" : "Payment Confirmed!"}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 mb-8"
            >
              {isFa ? "لایسنس شما آماده استفاده است" : "Your license is ready to use"}
            </motion.p>

            {/* License Key Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-success/10 to-gold/10 rounded-2xl border border-success/30 p-6 mb-6"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <Key size={16} className="text-success" />
                <span className="text-sm font-semibold text-success">{license.productName}</span>
              </div>
              <div className="bg-obsidian rounded-xl p-4 border border-white/10">
                <p className="font-mono text-lg text-success/90 break-all select-all">
                  {license.key}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {isFa
                  ? "این کلید را کپی و در برنامه وارد کنید"
                  : "Copy this key and enter it in the application"}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col gap-3"
            >
              <Link href="/dashboard/licenses">
                <button className="btn-gold w-full py-3 flex items-center justify-center gap-2">
                  <Key size={16} />
                  {isFa ? "مشاهده لایسنس‌ها" : "View Licenses"}
                </button>
              </Link>
              <Link href="/">
                <button className="btn-outline-gold w-full py-3 flex items-center justify-center gap-2">
                  {isFa ? "بازگشت به خانه" : "Back to Home"}
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      );
    }

    // No license yet - show preparing state
    return (
      <div className="min-h-screen bg-obsidian text-gray-200 flex items-center justify-center px-4">
        <div className="smoke" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-success/10 border-2 border-success/30 flex items-center justify-center"
          >
            <CheckCircle size={40} className="text-success" />
          </motion.div>

          <h1 className="text-2xl font-bold text-success mb-2 font-display">
            {isFa ? "پرداخت تأیید شد!" : "Payment Confirmed!"}
          </h1>
          <p className="text-gray-400 mb-6">
            {isFa
              ? "لایسنس شما در حال آماده‌سازی است..."
              : "Your license is being prepared..."}
          </p>

          {checking && (
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-4">
              <Loader2 size={12} className="animate-spin" />
              {isFa ? "در حال بررسی..." : "Checking..."}
            </div>
          )}

          <Link href="/dashboard/orders">
            <button className="btn-outline-gold py-3 inline-flex items-center justify-center gap-2 px-6">
              {isFa ? "مشاهده سفارشات" : "View Orders"}
            </button>
          </Link>
        </motion.div>
      </div>
      );
  }

  // Fallback
  return null;
}