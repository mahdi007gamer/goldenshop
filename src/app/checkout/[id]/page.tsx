"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowLeft, Shield,
  AlertTriangle, Copy, Check, ChevronRight, Landmark,
  Hash, CreditCard, FileText, CheckCircle,
} from "lucide-react";
import { useLang } from "@/context/LangContext";
import { useCurrency } from "@/hooks/useCurrency";
import { formatPriceWithRate } from "@/lib/currency";
import type { Order, BankCard } from "@/types";
import LoadingButton from "@/components/ui/LoadingButton";
import OrderStatusTracker from "@/components/OrderStatusTracker";
import { toast } from "@/store/toast-store";

type PaymentStep = "loading" | "details" | "submitted" | "not_found" | "error";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { lang, isRTL } = useLang();
  const isFa = lang === "fa";
  const orderId = params.id as string;
  const { rate: exchangeRate } = useCurrency();

  const [step, setStep] = useState<PaymentStep>("loading");
  const [order, setOrder] = useState<Order | null>(null);
  const [bankCards, setBankCards] = useState<BankCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [last4Digits, setLast4Digits] = useState("");
  const [receiptNote, setReceiptNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  // Fetch order and bank cards
  const fetchData = useCallback(async () => {
    setStep("loading");
    try {
      const [orderRes, cardsRes] = await Promise.all([
        fetch(`/api/orders/${orderId}`, { credentials: "include" }),
        fetch("/api/bank-cards", { credentials: "include" }),
      ]);

      const orderJson = await orderRes.json();
      const cardsJson = await cardsRes.json();

      if (!orderJson.success) {
        setStep("not_found");
        return;
      }

      setOrder(orderJson.data);

      // Check order can be paid
      const status = orderJson.data.status;
      // Statuses that should show the OrderStatusTracker (polling + animation)
      const trackerStatuses = [
        "payment_submitted",
        "payment_verifying",
        "payment_confirmed",
        "awaiting_license",
        "license_out_of_stock",
        "completed",
      ];
      if (trackerStatuses.includes(status)) {
        setStep("submitted");
        return;
      }
      // Terminal states that should NOT show tracker (show error instead)
      if (status === "cancelled" || status === "refunded" || status === "payment_rejected") {
        setStep("error");
        setErrorMsg(
          isFa
            ? "این سفارش دیگر قابل پرداخت نیست"
            : "This order is no longer payable"
        );
        return;
      }

      if (cardsJson.success && Array.isArray(cardsJson.data)) {
        const activeCards = cardsJson.data.filter((c: BankCard) => c.isActive);
        setBankCards(activeCards);
        if (activeCards.length > 0) {
          setSelectedCardId(activeCards[0].id);
        }
      }

      setStep("details");
    } catch {
      setStep("error");
      setErrorMsg(isFa ? "خطا در دریافت اطلاعات" : "Error loading data");
    }
  }, [orderId, isFa]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const displayPrice = (usdAmount: number) => {
    if (isFa && exchangeRate) return formatPriceWithRate(usdAmount, exchangeRate, "fa");
    return `$${usdAmount.toFixed(2)}`;
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(isFa ? "کپی شد!" : "Copied!");
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Only allow digits and exactly 4 chars
  const handleLast4Change = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    setLast4Digits(digits);
  };

  const handleSubmitPayment = async () => {
    if (!selectedCardId) {
      toast.error(isFa ? "خطا" : "Error", isFa ? "لطفاً کارت بانکی را انتخاب کنید" : "Please select a bank card");
      return;
    }
    if (last4Digits.length !== 4) {
      toast.error(isFa ? "خطا" : "Error", isFa ? "چهار رقم آخر کارت را وارد کنید" : "Enter the last 4 digits of your card");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders/submit-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orderId,
          bankCardId: selectedCardId,
          last4Digits,
          receiptNote: receiptNote.trim() || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStep("submitted");
        setOrder(json.data);
        toast.success(isFa ? "پرداخت ثبت شد!" : "Payment submitted!");
      } else if (res.status === 409) {
        setErrorMsg(json.error?.message || (isFa ? "شما یک پرداخت در انتظار تایید دارید" : "You have a pending payment"));
      } else {
        toast.error(
          isFa ? "خطا" : "Error",
          json.error?.message || (isFa ? "خطا در ثبت پرداخت" : "Payment submission failed")
        );
      }
    } catch {
      toast.error(isFa ? "خطا" : "Error", isFa ? "خطا در ارتباط با سرور" : "Server error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (step === "loading") {
    return (
      <div className="min-h-screen bg-obsidian text-gray-200">
        <div className="smoke" />
        <div className="relative flex flex-col items-center justify-center min-h-[70vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-full border-2 border-transparent"
            style={{ borderTopColor: "#C9963A", borderRightColor: "rgba(201,150,58,0.3)" }}
          />
          <p className="mt-4 text-sm text-gray-500">
            {isFa ? "در حال بارگذاری..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // ─── Not found / Error ─────────────────────────────────────────────────────
  if (step === "not_found" || step === "error") {
    return (
      <div className="min-h-screen bg-obsidian text-gray-200">
        <div className="smoke" />
        <div className="relative flex flex-col items-center justify-center min-h-[70vh] px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-danger" />
          </div>
          <h1 className="text-2xl font-bold text-danger mb-3 font-display">
            {step === "not_found"
              ? isFa ? "سفارش یافت نشد" : "Order Not Found"
              : isFa ? "خطا" : "Error"}
          </h1>
          <p className="text-gray-400 mb-6">{errorMsg}</p>
          <Link href="/dashboard/orders">
            <button className="btn-gold inline-flex items-center gap-2">
              <BackIcon className="w-4 h-4" />
              {isFa ? "بازگشت به سفارشات" : "Back to Orders"}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // ─── Submitted confirmation — live status tracker with polling & animation ──
  if (step === "submitted") {
    return <OrderStatusTracker orderId={orderId} />;
  }

  // ─── Payment Details Step ──────────────────────────────────────────────────
  const selectedCard = bankCards.find((c) => c.id === selectedCardId);

  return (
    <div className="min-h-screen bg-obsidian text-gray-200">
      <div className="smoke" />
      <div className="relative max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <Link href="/" className="hover:text-gold transition-colors">{isFa ? "خانه" : "Home"}</Link>
            <ChevronRight size={12} className="text-gray-700" />
            <Link href="/dashboard/orders" className="hover:text-gold transition-colors">{isFa ? "سفارشات" : "Orders"}</Link>
            <ChevronRight size={12} className="text-gray-700" />
            <span className="text-gold">{isFa ? "پرداخت" : "Payment"}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gold font-display flex items-center gap-3">
            <CreditCard className="w-7 h-7" />
            {isFa ? "تکمیل پرداخت" : "Complete Payment"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isFa ? "شماره سفارش" : "Order"}: <span className="font-mono text-gold/70">{orderId}</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Payment Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 space-y-5"
          >
            {/* Step 1: Order Summary (collapsed card) */}
            <div className="glass-card p-5">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText size={14} className="text-gold" />
                {isFa ? "خلاصه سفارش" : "Order Summary"}
              </h2>
              {order?.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-gold">{item.quantity}×</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-200 truncate">{item.productName}</p>
                      <p className="text-[10px] text-gray-500">
                        {isFa
                          ? item.billingCycle === "daily" ? "روزانه"
                            : item.billingCycle === "weekly" ? "هفتگی"
                            : item.billingCycle === "monthly" ? "ماهانه"
                            : "مادام‌العمر"
                          : item.billingCycle.charAt(0).toUpperCase() + item.billingCycle.slice(1)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-mono text-gray-400 shrink-0">
                    {displayPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="mt-4 pt-3 border-t border-gold/10 flex justify-between">
                <span className="text-sm text-gray-400">{isFa ? "مبلغ کل" : "Total"}</span>
                <span className="text-lg font-bold text-gold font-display">
                  {order ? displayPrice(order.total) : "—"}
                </span>
              </div>
            </div>

            {/* Step 2: Bank card selection */}
            <div className="glass-card p-5">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Landmark size={14} className="text-gold" />
                {isFa ? "کارت مقصد را انتخاب کنید" : "Select Destination Card"}
              </h2>
              {bankCards.length === 0 ? (
                <div className="text-center py-6">
                  <AlertTriangle size={24} className="text-warning mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    {isFa ? "هیچ کارت بانکی فعالی یافت نشد" : "No active bank cards found"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bankCards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`w-full text-start p-4 rounded-xl border transition-all ${
                        selectedCardId === card.id
                          ? "border-gold/40 bg-gold/5"
                          : "border-white/5 bg-obsidian-light hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selectedCardId === card.id ? "border-gold" : "border-gray-600"
                        }`}>
                          {selectedCardId === card.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-gold" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <CreditCard size={14} className="text-gold" />
                            <span className="text-sm font-bold text-white">{card.bankName}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/10 text-gold">
                              {card.accountHolder}
                            </span>
                          </div>
                          <p className="font-mono text-xs text-gray-400 tracking-wider" dir="ltr">
                            {card.cardNumber}
                          </p>
                        </div>
                        {selectedCardId === card.id && (
                          <CheckCircle size={16} className="text-gold shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 3: Copy card details */}
            {selectedCard && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="glass-card p-5"
              >
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Copy size={14} className="text-gold" />
                  {isFa ? "اطلاعات کارت (کپی کنید)" : "Card Details (Copy)"}
                </h2>
                <div className="space-y-3">
                  {/* Card Number */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-obsidian border border-white/5">
                    <div>
                      <p className="text-[10px] text-gray-500 mb-0.5">
                        {isFa ? "شماره کارت" : "Card Number"}
                      </p>
                      <p className="font-mono text-sm text-gold tracking-wider" dir="ltr">
                        {selectedCard.cardNumber}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(selectedCard.cardNumber, "cardNumber")}
                      className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors shrink-0"
                    >
                      {copiedField === "cardNumber" ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* Sheba */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-obsidian border border-white/5">
                    <div>
                      <p className="text-[10px] text-gray-500 mb-0.5">
                        {isFa ? "شماره شبا" : "Sheba Number"}
                      </p>
                      <p className="font-mono text-sm text-gray-300 tracking-wider" dir="ltr">
                        {selectedCard.shebaNumber}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(selectedCard.shebaNumber, "sheba")}
                      className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors shrink-0"
                    >
                      {copiedField === "sheba" ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* Amount to pay */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gold/5 border border-gold/15">
                    <div>
                      <p className="text-[10px] text-gold/60 mb-0.5">
                        {isFa ? "مبلغ قابل پرداخت (تومان)" : "Amount to Pay (Toman)"}
                      </p>
                      <p className="font-mono text-base font-bold text-gold" dir="ltr">
                        {order && exchangeRate
                          ? `${(() => { const toman = Math.round(order.total * exchangeRate).toLocaleString("en-US"); return toman; })()}`
                          : "—"}
                        {isFa ? " تومان" : ""}
                      </p>
                    </div>
                    {order && (
                      <button
                        onClick={() => {
                          const toman = Math.round(order.total * (exchangeRate || 500000)).toString();
                          copyToClipboard(toman, "amount");
                        }}
                        className="w-9 h-9 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/25 transition-colors shrink-0"
                      >
                        {copiedField === "amount" ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Payment proof form */}
            <div className="glass-card p-5">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Hash size={14} className="text-gold" />
                {isFa ? "اطلاعات پرداخت شما" : "Your Payment Info"}
              </h2>
              <div className="space-y-4">
                {/* Last 4 digits */}
                <div>
                  <label className="text-[10px] text-gray-500 font-medium block mb-1.5">
                    {isFa ? "چهار رقم آخر کارت شما" : "Last 4 digits of your card"} *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={last4Digits}
                    onChange={(e) => handleLast4Change(e.target.value)}
                    className="w-full px-3 py-2.5 bg-obsidian border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:border-gold/30 focus:outline-none font-mono tracking-[0.3em] text-center placeholder:tracking-normal placeholder:text-center"
                    placeholder="••••"
                    dir="ltr"
                  />
                  <p className="text-[9px] text-gray-600 mt-1">
                    {isFa ? "۴ رقم آخر کارتی که از آن پرداخت کرده‌اید" : "The last 4 digits of the card you paid from"}
                  </p>
                </div>

                {/* Receipt note (optional) */}
                <div>
                  <label className="text-[10px] text-gray-500 font-medium block mb-1.5">
                    {isFa ? "یادداشت (اختیاری)" : "Note (optional)"}
                  </label>
                  <textarea
                    value={receiptNote}
                    onChange={(e) => setReceiptNote(e.target.value)}
                    maxLength={500}
                    rows={3}
                    className="w-full px-3 py-2.5 bg-obsidian border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:border-gold/30 focus:outline-none resize-none"
                    placeholder={isFa ? "مثلاً شماره پیگیری یا زمان انتقال..." : "e.g. tracking number or transfer time..."}
                  />
                </div>
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 flex items-start gap-3">
                    <AlertTriangle size={16} className="text-danger shrink-0 mt-0.5" />
                    <p className="text-sm text-danger">{errorMsg}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                className="btn-outline-gold flex-1 py-3 text-sm flex items-center justify-center gap-2"
              >
                {isRTL ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
                {isFa ? "بازگشت" : "Back"}
              </button>
              <LoadingButton
                onClick={handleSubmitPayment}
                isLoading={isSubmitting}
                loadingText={isFa ? "در حال ثبت..." : "Submitting..."}
                icon={<Shield size={16} />}
                disabled={bankCards.length === 0}
                className="flex-[2]"
              >
                {isFa ? "ثبت پرداخت" : "Submit Payment"}
              </LoadingButton>
            </div>
          </motion.div>

          {/* Right: Order sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="glass-card p-5 sticky top-24 space-y-5">
              {/* Order info */}
              <div>
                <h3 className="text-sm font-bold text-gold font-display mb-4">
                  {isFa ? "جزئیات سفارش" : "Order Details"}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{isFa ? "شماره" : "Order #"}</span>
                    <span className="font-mono text-gold text-xs">{orderId.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{isFa ? "تاریخ" : "Date"}</span>
                    <span className="text-gray-300 text-xs">
                      {order?.createdAt
                        ? new Date(order.createdAt).toLocaleDateString(isFa ? "fa-IR" : "en-US")
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{isFa ? "محصولات" : "Items"}</span>
                    <span className="text-gray-300">{order?.items.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="bg-obsidian rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">{isFa ? "مبلغ قابل پرداخت" : "Total Due"}</span>
                </div>
                <p className="text-2xl font-bold text-gold font-display mt-1">
                  {order ? displayPrice(order.total) : "—"}
                </p>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  {isFa ? "راهنمای پرداخت" : "Payment Instructions"}
                </p>
                <div className="space-y-2">
                  {[
                    isFa ? "مبلغ را به کارت انتخابی واریز کنید" : "Transfer the amount to the selected card",
                    isFa ? "چهار رقم آخر کارت خود را وارد کنید" : "Enter the last 4 digits of your card",
                    isFa ? "پس از ثبت، منتظر تأیید ادمین بمانید" : "After submitting, wait for admin verification",
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[9px] font-bold text-gold">{i + 1}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security badge */}
              <div className="flex items-center gap-2 text-[10px] text-gray-600 pt-2 border-t border-white/5">
                <Shield size={12} />
                <span>{isFa ? "پرداخت امن و رمزنگاری شده" : "Secure encrypted payment"}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
