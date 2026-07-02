"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline-gold";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variants = {
  primary:
    "bg-gradient-to-r from-gold-dark via-gold to-gold-dim text-obsidian font-bold hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] active:scale-[0.98]",
  secondary:
    "bg-obsidian-lighter border border-obsidian-lighter text-gray-300 hover:border-cyber/30 hover:text-cyber",
  ghost:
    "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
  danger:
    "bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20",
  "outline-gold":
    "bg-transparent border border-gold/40 text-gold hover:bg-gold/10 hover:border-gold",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-md",
  md: "px-5 py-2.5 text-sm rounded-lg",
  lg: "px-8 py-3.5 text-base rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
}
