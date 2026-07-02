"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface LoadingButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  variant?: "gold" | "outline-gold" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
}

const variantClasses: Record<string, string> = {
  gold: "btn-gold",
  "outline-gold": "btn-outline-gold",
  danger: "bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20",
  ghost: "bg-transparent border border-white/10 text-gray-400 hover:text-white hover:bg-white/5",
};

const sizeClasses: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function LoadingButton({
  isLoading = false,
  loadingText,
  icon,
  variant = "gold",
  size = "md",
  disabled,
  children,
  className = "",
  onClick,
  type = "button",
}: LoadingButtonProps) {
  return (
    <motion.button
      whileHover={!isLoading && !disabled ? { scale: 1.02 } : undefined}
      whileTap={!isLoading && !disabled ? { scale: 0.98 } : undefined}
      className={`${variantClasses[variant] || variantClasses.gold} ${sizeClasses[size] || sizeClasses.md} flex items-center justify-center gap-2 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={isLoading || disabled}
      onClick={onClick}
      type={type}
    >
      {isLoading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          {loadingText && <span>{loadingText}</span>}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </motion.button>
  );
}
