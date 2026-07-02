"use client";

import { useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
  X,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";
import { useLang } from "@/context/LangContext";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorConfig = {
  success: {
    border: "border-success/40",
    bg: "bg-success/[0.08]",
    glow: "shadow-[0_0_20px_rgba(0,255,136,0.15)]",
    icon: "text-success",
    progress: "bg-success",
    accent: "#00ff88",
  },
  error: {
    border: "border-danger/40",
    bg: "bg-danger/[0.08]",
    glow: "shadow-[0_0_20px_rgba(255,51,102,0.15)]",
    icon: "text-danger",
    progress: "bg-danger",
    accent: "#ff3366",
  },
  warning: {
    border: "border-gold/40",
    bg: "bg-gold/[0.08]",
    glow: "shadow-[0_0_20px_rgba(255,215,0,0.15)]",
    icon: "text-gold",
    progress: "bg-gold",
    accent: "#FFD700",
  },
  info: {
    border: "border-cyber/40",
    bg: "bg-cyber/[0.08]",
    glow: "shadow-[0_0_20px_rgba(0,240,255,0.15)]",
    icon: "text-cyber",
    progress: "bg-cyber",
    accent: "#00f0ff",
  },
};

function ToastNotification({
  toast,
  onRemove,
}: {
  toast: ToastItem;
  onRemove: () => void;
}) {
  const Icon = iconMap[toast.type];
  const config = colorConfig[toast.type];
  const duration = toast.duration || 5000;
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 100 / (duration / 50);
      });
    }, 50);
    return () => clearInterval(interval);
  }, [duration, isPaused]);

  useEffect(() => {
    if (progress <= 0) {
      onRemove();
    }
  }, [progress, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -30, scale: 0.95, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -20, scale: 0.95, filter: "blur(4px)" }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative w-full max-w-md overflow-hidden rounded-2xl border ${config.border} ${config.bg} ${config.glow} backdrop-blur-xl`}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: config.accent }} />

      <div className="flex items-start gap-3 p-4">
        {/* Icon with glow ring */}
        <div
          className="relative flex-shrink-0 mt-0.5"
          style={{ filter: `drop-shadow(0 0 6px ${config.accent}50)` }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${config.accent}15` }}
          >
            <Icon size={20} className={config.icon} />
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white leading-tight">{toast.title}</p>
          {toast.message && (
            <p className="mt-1 text-xs text-gray-400 leading-relaxed line-clamp-2">
              {toast.message}
            </p>
          )}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-xs font-semibold transition-colors hover:underline"
              style={{ color: config.accent }}
            >
              {toast.action.label} →
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onRemove}
          className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all"
        >
          <X size={14} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
        <motion.div
          className={`h-full ${config.progress}`}
          style={{ width: `${progress}%` }}
          initial={false}
          transition={{ duration: 0.05 }}
        />
      </div>
    </motion.div>
  );
}

export function ToastContainer({ toasts, removeToast }: ToastProps) {
  const { isRTL } = useLang();

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-[3000] flex flex-col gap-3 w-full max-w-md px-4`}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for easy toast usage
let toastIdCounter = 0;
export function createToast(
  type: ToastType,
  title: string,
  message?: string,
  options?: Partial<ToastItem>
): ToastItem {
  return {
    id: `toast-${++toastIdCounter}-${Date.now()}`,
    type,
    title,
    message,
    ...options,
  };
}
