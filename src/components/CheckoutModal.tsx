"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Bitcoin, Shield, Check, Loader2, Copy, Crown } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useLang } from "@/context/LangContext";
import Modal from "@/components/ui/Modal";
import type { BillingCycle, GeneratedLicense } from "@/types";

type Step = "review" | "payment" | "processing" | "success";

let _keyCounter = 0;
function generateLicenseKey(): string {
  _keyCounter++;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let seed = _keyCounter * 2654435761;
  const segments: string[] = [];
  for (let s = 0; s < 4; s++) {
    let seg = "";
    for (let i = 0; i < 4; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      seg += chars[seed % chars.length];
    }
    segments.push(seg);
  }
  return segments.join("-");
}

function generateHWID(): string {
  let seed = (_keyCounter + 1) * 1103515245;
  return Array.from({ length: 32 }, () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed % 16).toString(16);
  }).join("");
}

export default function CheckoutModal() {
  const { checkoutOpen, setCheckoutOpen, cart, directProduct, directBillingCycle, handleSuccessPay } = useApp();
  const { translate: t } = useLang();
  const [step, setStep] = useState<Step>("review");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "btc" | "xmr">("btc");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(directBillingCycle);
  const [generatedLicenses, setGeneratedLicenses] = useState<GeneratedLicense[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [counter, setCounter] = useState(0);

  const items = directProduct
    ? [{ product: directProduct, quantity: 1, billingCycle }]
    : cart.map((item) => ({ ...item, billingCycle: item.billingCycle }));

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const lifetimeMultiplier = billingCycle === "lifetime" ? 3 : 1;
  const total = subtotal * lifetimeMultiplier;

  const handlePayment = async () => {
    setStep("processing");
    await new Promise((r) => setTimeout(r, 2500));
    setCounter((c) => c + 1);
    const ts = Date.now();
    const licenses: GeneratedLicense[] = items.map((item, idx) => ({
      id: `LIC-${ts}-${counter}-${idx}`,
      productName: item.product.name,
      game: item.product.game,
      licenseKey: generateLicenseKey(),
      purchaseDate: new Date(ts).toISOString().split("T")[0],
      expiryDate: billingCycle === "lifetime" ? "Never" : new Date(ts + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Active",
      hwid: generateHWID(),
    }));
    setGeneratedLicenses(licenses);
    setStep("success");
    handleSuccessPay(licenses);
  };

  const handleClose = () => {
    setCheckoutOpen(false);
    setTimeout(() => { setStep("review"); setGeneratedLicenses([]); }, 300);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Modal isOpen={checkoutOpen} onClose={handleClose}
      title={step === "success" ? t("checkout.success") : step === "processing" ? t("checkout.processing") : t("checkout.title")}
      size={step === "success" ? "md" : "lg"}
    >
      <AnimatePresence mode="wait">
        {step === "review" && (
          <motion.div key="review" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold">{t("checkout.orderSummary")}</h4>
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">{item.product.name}</p>
                      <p className="text-xs text-gray-500">{item.product.game} &bull; Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-gold">${(item.product.price * item.quantity * lifetimeMultiplier).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold">{t("checkout.billingCycle")}</h4>
              <div className="grid grid-cols-2 gap-3">
                {(["monthly", "lifetime"] as const).map((cycle) => (
                  <button key={cycle} onClick={() => setBillingCycle(cycle)}
                    className={`rounded-xl border p-4 text-left transition-all ${billingCycle === cycle ? "border-gold/40 bg-gold/10" : "border-white/10 bg-white/[0.02] hover:border-white/20"}`}
                  >
                    <p className="text-sm font-bold text-white">{cycle === "monthly" ? t("store.monthly") : t("store.lifetime")}</p>
                    <p className="text-xs text-gray-500">{cycle === "monthly" ? `$${subtotal.toFixed(2)} ${t("store.perMonth")}` : `$${(subtotal * 3).toFixed(2)} ${t("store.oneTime")}`}</p>
                    {cycle === "lifetime" && <span className="mt-1 inline-block rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold">{t("store.save40")}</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-gold/20 bg-gold/5 px-5 py-4">
              <span className="text-sm text-gray-400">{t("checkout.total")}</span>
              <span className="text-2xl font-black text-gold">${total.toFixed(2)}</span>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold">{t("checkout.paymentMethod")}</h4>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "btc" as const, label: "Bitcoin", icon: Bitcoin },
                  { id: "xmr" as const, label: "Monero", icon: Shield },
                  { id: "card" as const, label: "Card", icon: CreditCard },
                ].map((method) => (
                  <button key={method.id} onClick={() => setPaymentMethod(method.id)}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${paymentMethod === method.id ? "border-gold/40 bg-gold/10" : "border-white/10 bg-white/[0.02] hover:border-white/20"}`}
                  >
                    <method.icon size={24} className={paymentMethod === method.id ? "text-gold" : "text-gray-400"} />
                    <span className="text-xs text-gray-300">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handlePayment}
              className="btn-gold flex w-full items-center justify-center gap-2 py-3.5 text-base"
            >
              <Shield size={18} />{t("checkout.pay")} ${total.toFixed(2)}
            </motion.button>
            <p className="text-center text-xs text-gray-600">{t("checkout.encrypted")}</p>
          </motion.div>
        )}

        {step === "processing" && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-12">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="mb-6">
              <Loader2 size={48} className="text-gold" />
            </motion.div>
            <h3 className="text-lg font-bold text-white">{t("checkout.processing")}</h3>
            <p className="mt-2 text-sm text-gray-400">{t("checkout.processingText")}</p>
            <div className="mt-6 flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="h-2 w-2 rounded-full bg-gold" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
              ))}
            </div>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="flex justify-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex h-20 w-20 items-center justify-center rounded-full border border-success/30 bg-success/10"
              >
                <Check size={40} className="text-success" />
              </motion.div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white">{t("checkout.success")}</h3>
              <p className="mt-1 text-sm text-gray-400">{t("checkout.successMsg")}</p>
            </div>
            <div className="space-y-3">
              {generatedLicenses.map((lic) => (
                <div key={lic.id} className="rounded-xl border border-gold/20 bg-gold/5 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{lic.productName}</span>
                    <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">{t("licenses.active")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg bg-black/40 px-3 py-2 font-mono text-xs text-gold">{lic.licenseKey}</code>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => copyToClipboard(lic.licenseKey, lic.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/20 bg-gold/10 text-gold transition-colors hover:bg-gold/20"
                    >
                      {copiedId === lic.id ? <Check size={14} /> : <Copy size={14} />}
                    </motion.button>
                  </div>
                  <p className="mt-2 text-[10px] text-gray-500">{t("checkout.expires")}: {lic.expiryDate}</p>
                </div>
              ))}
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleClose}
              className="btn-gold flex w-full items-center justify-center gap-2 py-3"
            >
              <Crown size={18} />{t("checkout.goDashboard")}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
