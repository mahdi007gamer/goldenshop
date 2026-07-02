"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft,
  ShoppingCart, CreditCard, Shield, LogIn, UserPlus, CheckCircle,
  Loader2, Lock,
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LangContext";
import { t } from "@/i18n/translations";
import { formatPriceWithRate } from "@/lib/currency";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "@/store/toast-store";
import CartSkeleton from "@/components/skeletons/CartSkeleton";
import LoadingButton from "@/components/ui/LoadingButton";
import { useCheckoutGuard } from "@/hooks/useCheckoutGuard";

type CheckoutStep = "auth" | "review" | "payment" | "success";

export default function CartPage() {
  const router = useRouter();
  const { items, total, removeItem, addItem, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuth();
  const { lang, isRTL } = useLang();
  const isFa = lang === "fa";

  const { canProceed } = useCheckoutGuard();
  const [step, setStep] = useState<CheckoutStep>("auth");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { rate: exchangeRate } = useCurrency();
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [pendingOrderError, setPendingOrderError] = useState<string | null>(null);
  const isHydrated = useCartStore((s) => s.isHydrated);

  // Fallback: if persist rehydrate never fires (e.g. parse error), unblock after 1s
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isHydrated) useCartStore.getState().setHydrated();
    }, 1000);
    return () => clearTimeout(timer);
  }, [isHydrated]);

  // Auth form state
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Redirect authenticated users past auth step
  useEffect(() => {
    if (isAuthenticated && step === "auth") {
      setStep("review");
    }
  }, [isAuthenticated, step]);

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const getItemPrice = (item: (typeof items)[number]) => {
    const p = item.product;
    switch (item.billingCycle) {
      case "daily": return p.priceDaily ?? p.price;
      case "weekly": return p.priceWeekly ?? p.price;
      case "monthly": return p.priceMonthly ?? p.price;
      case "lifetime": return p.priceLifetime ?? p.price * 3;
      default: return p.price;
    }
  };

  const getItemSubtotal = (item: (typeof items)[number]) => getItemPrice(item) * item.quantity;

  const displayPrice = (usdAmount: number) => {
    if (isFa && exchangeRate) return formatPriceWithRate(usdAmount, exchangeRate, "fa");
    return `$${usdAmount.toFixed(2)}`;
  };

  const handleIncrement = (item: (typeof items)[number]) => addItem(item.product, item.billingCycle);

  const handleDecrement = (item: (typeof items)[number]) => {
    if (item.quantity <= 1) removeItem(item.id);
    else {
      removeItem(item.id);
      for (let i = 0; i < item.quantity - 1; i++) addItem(item.product, item.billingCycle);
    }
  };

  // ─── Auth handlers ───────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      toast.error(t("common.error", lang), t("auth.fillAllFields", lang));
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/login/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const json = await res.json();
      if (json.success) {
        // Refresh the auth store by calling checkSession
        await fetch("/api/auth/session").catch(() => {});
        // Manually update store via login action
        const { useAuthStore: store } = await import("@/store/auth-store");
        const u = json.data?.user || json.data;
        if (u) {
          store.setState({ user: u, isAuthenticated: true });
        }
        setStep("review");
        toast.success(t("auth.loginSuccess", lang));
      } else {
        toast.error(t("common.error", lang), json.error?.message || t("auth.loginFailed", lang));
      }
    } catch {
      toast.error(t("common.error", lang), t("auth.loginFailed", lang));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !phone || !password) {
      toast.error(t("common.error", lang), t("auth.fillAllFields", lang));
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, phone, password }),
      });
      const json = await res.json();
      if (json.success) {
        const { useAuthStore: store } = await import("@/store/auth-store");
        const u = json.data?.user || json.data;
        if (u) {
          store.setState({ user: u, isAuthenticated: true });
        }
        setStep("review");
        toast.success(t("auth.registerSuccess", lang));
      } else {
        toast.error(t("common.error", lang), json.error?.message || t("auth.registerFailed", lang));
      }
    } catch {
      toast.error(t("common.error", lang), t("auth.registerFailed", lang));
    } finally {
      setAuthLoading(false);
    }
  };

  // ─── Order submission ────────────────────────────────────────────────────

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setPendingOrderError(null);
    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        billingCycle: item.billingCycle,
        quantity: item.quantity,
      }));
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items: orderItems, paymentMethod: "card-to-card" }),
      });
      const json = await res.json();
      if (json.success) {
        const newOrderId = json.data.order?.id || json.data.id;
        setStep("success");
        toast.success(t("checkout.orderPlaced", lang));
        // Redirect to checkout payment page (clear cart after navigation starts)
        router.push(`/checkout/${newOrderId}`);
        // Clear cart state after a tick so the empty-cart UI never flashes
        setTimeout(() => clearCart(), 100);
      } else if (res.status === 409) {
        setPendingOrderError(json.error?.message || "شما یک پرداخت در انتظار تایید دارید. لطفاً منتظر تایید ادمین بمانید.");
      } else {
        toast.error(t("common.error", lang), json.error?.message || t("checkout.failed", lang));
      }
    } catch {
      toast.error(t("common.error", lang), t("checkout.failed", lang));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Empty cart ──────────────────────────────────────────────────────────

  if (!isHydrated) return <CartSkeleton />;

  if (items.length === 0 && step !== "success") {
    return (
      <div className="min-h-screen bg-obsidian text-gray-200">
        <div className="smoke" />
        <div className="relative flex flex-col items-center justify-center min-h-[70vh] px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-obsidian-light border border-gold/20 flex items-center justify-center">
              <ShoppingCart className="w-10 h-10 text-gold/50" />
            </div>
            <h1 className="text-3xl font-bold text-gold mb-3 font-display">{t("cart.empty", lang)}</h1>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">{t("cart.emptyDesc", lang)}</p>
            <Link href="/#products">
              <button className="btn-gold inline-flex items-center gap-2">
                <ArrowIcon className="w-4 h-4" />
                {t("nav.shop", lang)}
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── Main layout ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-obsidian text-gray-200">
      <div className="smoke" />
      <div className="relative max-w-6xl mx-auto px-4 py-12">
        {/* Page Title */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gold font-display flex items-center gap-3">
            <ShoppingBag className="w-8 h-8" />
            {t("cart.title", lang)}
          </h1>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            {(["auth", "review", "payment"] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                  step === s ? "bg-gold text-obsidian border-gold" :
                  (["auth", "review", "payment"].indexOf(step) > i) ? "bg-success/20 text-success border-success/40" :
                  "bg-obsidian-light text-gray-500 border-white/10"
                }`}>
                  {["auth", "review", "payment"].indexOf(step) > i ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${step === s ? "text-gold" : "text-gray-500"}`}>
                  {t(`checkout.step.${s}`, lang)}
                </span>
                {i < 2 && <div className="w-8 h-px bg-white/10" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Step: Auth ─────────────────────────────────────────────────── */}
        {step === "auth" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Lock size={16} className="text-gold" />
                <h2 className="text-lg font-bold text-white font-display">{t("checkout.authRequired", lang)}</h2>
              </div>

              {/* Tab switcher */}
              <div className="flex gap-1 mb-6 bg-obsidian rounded-lg p-1">
                <button onClick={() => setAuthMode("login")} className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${
                  authMode === "login" ? "bg-gold/15 text-gold" : "text-gray-500 hover:text-gray-300"
                }`}>
                  <LogIn size={14} className="inline mr-1" />
                  {t("auth.login", lang)}
                </button>
                <button onClick={() => setAuthMode("register")} className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${
                  authMode === "register" ? "bg-gold/15 text-gold" : "text-gray-500 hover:text-gray-300"
                }`}>
                  <UserPlus size={14} className="inline mr-1" />
                  {t("auth.register", lang)}
                </button>
              </div>

              <form onSubmit={authMode === "login" ? handleLogin : handleRegister} className="space-y-4">
                {authMode === "register" && (
                  <div>
                    <label className="text-[10px] text-gray-500 font-medium block mb-1">{t("auth.username", lang)}</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:border-gold/30 focus:outline-none"
                      placeholder={t("auth.usernamePlaceholder", lang)} />
                  </div>
                )}
                <div>
                  <label className="text-[10px] text-gray-500 font-medium block mb-1">{t("auth.phone", lang)}</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:border-gold/30 focus:outline-none"
                    placeholder={t("auth.phonePlaceholder", lang)} dir="ltr" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-medium block mb-1">{t("auth.password", lang)}</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:border-gold/30 focus:outline-none"
                    placeholder="••••••••" dir="ltr" />
                </div>
                <button type="submit" disabled={authLoading}
                  className="btn-gold w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50">
                  {authLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowIcon size={16} />}
                  {authMode === "login" ? t("auth.login", lang) : t("auth.register", lang)}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* ── Step: Review ───────────────────────────────────────────────── */}
        {step === "review" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Logged-in indicator */}
            <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-success/5 border border-success/20">
              <CheckCircle size={14} className="text-success" />
              <span className="text-xs text-success">
                {t("checkout.loggedInAs", lang)}: <strong>{user?.username}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => (
                    <motion.div key={item.id} layout
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-100 truncate">{item.product.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20">{item.product.game}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyber/10 text-cyber border border-cyber/20">
                            {t(`product.${item.billingCycle}`, lang)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {displayPrice(getItemPrice(item))}
                          {item.billingCycle !== "lifetime" && (
                            <span className="text-gold/60"> / {t(`product.per${item.billingCycle.charAt(0).toUpperCase() + item.billingCycle.slice(1)}`, lang)}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleDecrement(item)} className="w-8 h-8 rounded-lg bg-obsidian-light border border-gold/20 flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold/50 transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-gold font-mono font-bold">{item.quantity}</span>
                        <button onClick={() => handleIncrement(item)} className="w-8 h-8 rounded-lg bg-obsidian-light border border-gold/20 flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold/50 transition-colors">
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="text-left sm:text-right min-w-[100px]">
                        <p className="text-lg font-bold text-gold font-mono">{displayPrice(getItemSubtotal(item))}</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="w-9 h-9 rounded-lg bg-danger/10 border border-danger/20 flex items-center justify-center text-danger/70 hover:text-danger hover:border-danger/50 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Order Summary */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-1">
                <div className="glass-card p-6 sticky top-24">
                  <h2 className="text-lg font-bold text-gold font-display mb-6">{t("checkout.orderSummary", lang)}</h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-400 text-sm">
                      <span>{t("cart.total", lang)}</span>
                      <span className="font-mono">{displayPrice(total)}</span>
                    </div>
                    <div className="border-t border-gold/10 pt-3 flex justify-between text-lg font-bold">
                      <span className="text-gray-200">{t("checkout.total", lang)}</span>
                      <span className="text-gold font-mono">{displayPrice(total)}</span>
                    </div>
                  </div>
                  <LoadingButton
                    onClick={() => setStep("payment")}
                    disabled={!canProceed}
                    icon={<CreditCard size={16} />}
                  >
                    {t("checkout.proceedToPayment", lang)}
                  </LoadingButton>
                  <p className="text-[10px] text-gray-600 text-center mt-3 flex items-center justify-center gap-1">
                    <Shield size={10} /> {t("checkout.encrypted", lang)}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ── Step: Payment ──────────────────────────────────────────────── */}
        {step === "payment" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
            <div className="glass-card p-6">
              {/* Pending order error banner */}
              <AnimatePresence>
                {pendingOrderError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden"
                  >
                    <div className="relative p-4 rounded-xl bg-danger/10 border border-danger/30">
                      <button
                        onClick={() => setPendingOrderError(null)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-danger/20 flex items-center justify-center text-danger hover:bg-danger/30 transition-colors"
                        aria-label="Dismiss"
                      >
                        <span className="text-xs font-bold leading-none">X</span>
                      </button>
                      <div className="flex items-start gap-3 pr-6">
                        <div className="w-8 h-8 rounded-full bg-danger/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Lock size={14} className="text-danger" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-danger mb-1">{t("common.error", lang)}</p>
                          <p className="text-xs text-danger/80 leading-relaxed">{pendingOrderError}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <h2 className="text-lg font-bold text-gold font-display mb-2">{t("checkout.paymentMethod", lang)}</h2>
              <p className="text-xs text-gray-500 mb-6">{t("checkout.paymentDesc", lang)}</p>

              {/* Payment method selection (card-to-card is primary for Iran) */}
              <div className="space-y-3 mb-6">
                <div className="p-4 rounded-xl border border-gold/30 bg-gold/5 flex items-center gap-3 cursor-pointer">
                  <CreditCard size={20} className="text-gold" />
                  <div>
                    <p className="text-sm font-bold text-white">{t("checkout.cardToCard", lang)}</p>
                    <p className="text-[10px] text-gray-500">{t("checkout.cardToCardDesc", lang)}</p>
                  </div>
                  <CheckCircle size={16} className="text-gold ml-auto" />
                </div>
              </div>

              {/* Order total */}
              <div className="bg-obsidian rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">{t("checkout.total", lang)}</span>
                  <span className="text-xl font-bold text-gold font-mono">{displayPrice(total)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={() => setStep("review")} className="btn-outline-gold flex-1 py-3 text-sm flex items-center justify-center gap-2">
                  {isRTL ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
                  {t("checkout.back", lang)}
                </button>
                <LoadingButton
                  onClick={handlePlaceOrder}
                  isLoading={isSubmitting}
                  loadingText={t("checkout.processing", lang)}
                  icon={<Shield size={16} />}
                >
                  {t("checkout.confirmPay", lang)}
                </LoadingButton>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
