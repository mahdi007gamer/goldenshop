"use client";

import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "gold" | "cyber" | "danger" | "success" | "warning" | "neutral";
  size?: "sm" | "md";
  glowing?: boolean;
}

const variantClasses: Record<string, string> = {
  gold: "bg-gold/15 text-gold border-gold/30",
  cyber: "bg-cyber/15 text-cyber border-cyber/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-gold/15 text-gold border-gold/30",
  neutral: "bg-white/5 text-gray-400 border-white/10",
};

const glowClasses: Record<string, string> = {
  gold: "shadow-[0_0_12px_rgba(255,215,0,0.15)]",
  cyber: "shadow-[0_0_12px_rgba(0,240,255,0.15)]",
  danger: "shadow-[0_0_12px_rgba(255,51,102,0.15)]",
  success: "shadow-[0_0_12px_rgba(0,255,136,0.15)]",
  warning: "shadow-[0_0_12px_rgba(255,215,0,0.15)]",
  neutral: "",
};

const sizeClasses: Record<string, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-3 py-1 text-xs",
};

export default function Badge({
  children,
  variant = "neutral",
  size = "md",
  glowing = false,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border font-semibold uppercase tracking-wider ${variantClasses[variant]} ${sizeClasses[size]} ${glowing ? glowClasses[variant] : ""}`}
    >
      {children}
    </span>
  );
}
