"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useLang } from "@/context/LangContext";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  hint?: string;
}

export function PasswordModal({ isOpen, onClose, onSubmit, hint }: PasswordModalProps) {
  const { lang } = useLang();
  const isFa = lang === "fa";
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPassword("");
      setShowPassword(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
    setPassword("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-obsidian-light rounded-2xl border border-white/10 p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Lock size={18} className="text-gold" />
                  <h3 className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-fa)" }}>
                    {isFa ? "رمز عبور فایل" : "File Password"}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Hint */}
              {hint && (
                <div className="mb-4 p-3 rounded-lg bg-gold/5 border border-gold/20">
                  <p className="text-xs text-gold" style={{ fontFamily: "var(--font-fa)" }}>
                    {hint}
                  </p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isFa ? "رمز عبور را وارد کنید..." : "Enter password..."}
                    className="w-full px-3 py-2.5 pr-10 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none"
                    style={{ fontFamily: "var(--font-fa)" }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <button
                  type="submit"
                  className="btn-gold w-full mt-4 py-2.5 text-sm"
                >
                  {isFa ? "دانلود فایل" : "Download File"}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}