"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Lock, User, Eye, EyeOff, Shield, MessageCircle, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useLang } from "@/context/LangContext";
import Modal from "@/components/ui/Modal";

export default function LoginModal() {
  const { loginModalOpen, setLoginModalOpen, login } = useApp();
  const { isRTL, translate: t } = useLang();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError(t("login.errorFillFields") ?? "لطفاً تمام فیلدها را پر کنید.");
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const success = login(username, password);
    setIsLoading(false);
    if (!success) setError(t("login.errorInvalid") ?? "اطلاعات نادرست است. دوباره تلاش کنید.");
  };

  return (
    <Modal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} title={t("login.title")} size="sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10">
            <Crown size={32} className="text-gold" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-white">{t("login.welcome")}</h3>
        </div>
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400">{t("login.username")}</label>
          <div className="relative">
            <User size={16} className={`absolute top-1/2 -translate-y-1/2 text-gray-500 ${isRTL ? "right-3" : "left-3"}`} />
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t("login.username")} className={`input-gold ${isRTL ? "pr-10" : "pl-10"}`} autoComplete="username" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400">{t("login.password")}</label>
          <div className="relative">
            <Lock size={16} className={`absolute top-1/2 -translate-y-1/2 text-gray-500 ${isRTL ? "right-3" : "left-3"}`} />
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("login.password")} className={`input-gold ${isRTL ? "pr-10 pl-10" : "pl-10 pr-10"}`} autoComplete="current-password" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 ${isRTL ? "left-3" : "right-3"}`}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/5 accent-gold" />
            {t("login.remember")}
          </label>
          <button type="button" className="text-sm text-gold hover:underline">{t("login.forgotPassword") ?? "Forgot password?"}</button>
        </div>
        <motion.button type="submit" disabled={isLoading} whileHover={{ scale: isLoading ? 1 : 1.02 }} whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className="btn-gold flex w-full items-center justify-center gap-2 py-3 disabled:opacity-50"
        >
          {isLoading ? (
            <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-5 w-5 rounded-full border-2 border-obsidian border-t-transparent" />{t("common.loading")}</>
          ) : (
            <><Shield size={18} />{t("login.submit")}</>
          )}
        </motion.button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-obsidian-light px-3 text-gray-500">{t("login.orContinueWith") ?? "یا ادامه با"}</span></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm text-gray-300 transition-colors hover:border-indigo-500/30 hover:bg-indigo-500/10"
          >
            <MessageCircle size={16} className="text-indigo-400" />{t("login.discord")}
          </motion.button>
          <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm text-gray-300 transition-colors hover:border-blue-500/30 hover:bg-blue-500/10"
          >
            <X size={16} className="text-blue-400" />{t("login.steam")}
          </motion.button>
        </div>
        <p className="text-center text-xs text-gray-600">{t("login.tip")}</p>
      </form>
    </Modal>
  );
}
