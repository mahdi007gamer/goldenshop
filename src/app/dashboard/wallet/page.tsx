"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  CreditCard,
  Tag,
  Clock,
  Check,
  Building2,
  Hash,
  UserCircle,
  ArrowDown,
  ArrowUp,
  ShoppingCart,
  RotateCcw,
  Filter,
  ListX,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useLang } from "@/context/LangContext";
import { useCurrency } from "@/hooks/useCurrency";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "@/store/toast-store";

interface BankCard {
  id: string;
  cardNumber: string;
  shebaNumber: string;
  bankName: string;
  accountHolder: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type TransactionType = "deposit" | "withdrawal" | "purchase" | "refund" | "promo";
type TransactionStatus = "completed" | "pending" | "failed";

interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balance: number;
  description: string;
  referenceId: string | null;
  status: TransactionStatus;
  createdAt: string;
}

interface WalletData {
  balance: number;
  transactions: Transaction[];
  total: number;
}

const TRANSACTION_TYPE_CONFIG: Record<
  TransactionType,
  { label: string; icon: typeof ArrowDown; colorClass: string; bgClass: string }
> = {
  deposit: {
    label: "واریز",
    icon: ArrowDown,
    colorClass: "text-success",
    bgClass: "bg-success/10",
  },
  withdrawal: {
    label: "برداشت",
    icon: ArrowUp,
    colorClass: "text-danger",
    bgClass: "bg-danger/10",
  },
  purchase: {
    label: "خرید",
    icon: ShoppingCart,
    colorClass: "text-cyber",
    bgClass: "bg-cyber/10",
  },
  refund: {
    label: "بازگشت وجه",
    icon: RotateCcw,
    colorClass: "text-amber-400",
    bgClass: "bg-amber-400/10",
  },
  promo: {
    label: "کد تخفیف",
    icon: Tag,
    colorClass: "text-purple-400",
    bgClass: "bg-purple-400/10",
  },
};

const STATUS_CONFIG: Record<
  TransactionStatus,
  { label: string; className: string }
> = {
  completed: {
    label: "موفق",
    className: "bg-success/10 text-success border-success/20",
  },
  pending: {
    label: "در انتظار",
    className: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  },
  failed: {
    label: "ناموفق",
    className: "bg-danger/10 text-danger border-danger/20",
  },
};

const FILTER_OPTIONS: { value: TransactionType | "all"; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "deposit", label: "واریز" },
  { value: "withdrawal", label: "برداشت" },
  { value: "purchase", label: "خرید" },
  { value: "refund", label: "بازگشت وجه" },
];

function formatRelativeTime(dateStr: string, lang: "fa" | "en"): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (lang === "fa") {
    if (diffSec < 60) return "همین الان";
    if (diffMin < 60) return `${diffMin} دقیقه پیش`;
    if (diffHour < 24) return `${diffHour} ساعت پیش`;
    if (diffDay < 7) return `${diffDay} روز پیش`;
    return date.toLocaleDateString("fa-IR");
  }

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US");
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function WalletPage() {
  const { user } = useAuthStore();
  const { lang, dir } = useLang();
  const faFont = { fontFamily: "var(--font-fa)" };
  const isFA = lang === "fa";
  const { rate: currencyRate } = useCurrency();

  const [depositAmount, setDepositAmount] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [reference, setReference] = useState("");
  const [bankCards, setBankCards] = useState<BankCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [loadingCards, setLoadingCards] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Transaction history state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [activeFilter, setActiveFilter] = useState<TransactionType | "all">("all");

  const fetchBankCards = useCallback(async () => {
    try {
      const res = await fetch("/api/bank-cards");
      const json = await res.json();
      if (json.success) {
        setBankCards(json.data);
        if (json.data.length > 0 && !selectedCardId) {
          setSelectedCardId(json.data[0].id);
        }
      }
    } catch {
      toast.error("خطا", "خطا در دریافت اطلاعات کارتهای بانکی");
    } finally {
      setLoadingCards(false);
    }
  }, [selectedCardId]);

  const fetchTransactions = useCallback(async () => {
    setLoadingTransactions(true);
    try {
      const res = await fetch("/api/wallet?take=50");
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data.transactions);
      }
    } catch {
      toast.error("خطا", "خطا در دریافت تاریخچه تراکنش‌ها");
    } finally {
      setLoadingTransactions(false);
    }
  }, []);

  useEffect(() => {
    fetchBankCards();
    fetchTransactions();
  }, [fetchBankCards, fetchTransactions]);

  const handleSubmitDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error("خطا", "لطفاً مبلغ معتبر وارد کنید");
      return;
    }
    if (!selectedCard) {
      toast.error("خطا", "لطفاً کارت مقصد را انتخاب کنید");
      return;
    }
    if (!reference.trim()) {
      toast.error("خطا", "لطفاً کد پیگیری را وارد کنید");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/wallet/card-to-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(depositAmount),
          cardNumber: selectedCard.cardNumber,
          reference: reference.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("موفق", "درخواست شارژ ثبت شد. پس از تأیید پرداخت، موجودی شما افزایش مییابد.");
        setDepositAmount("");
        setReference("");
        fetchTransactions();
      } else {
        toast.error("خطا", json.error?.message ?? "خطا در ثبت درخواست");
      }
    } catch {
      toast.error("خطا", "خطا در ارتباط با سرور");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCard = bankCards.find((c) => c.id === selectedCardId);

  // Balance display with currency conversion
  const displayBalance = useMemo(() => {
    const balance = user?.walletBalance ?? 0;
    if (isFA && currencyRate) {
      return `${formatAmount(balance * currencyRate)} تومان`;
    }
    return `$${formatAmount(balance)}`;
  }, [user?.walletBalance, isFA, currencyRate]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    if (activeFilter === "all") return transactions;
    return transactions.filter((t) => t.type === activeFilter);
  }, [transactions, activeFilter]);

  // Direction-aware flex
  const rowDir = dir === "rtl" ? "rtl" : "ltr";

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white mb-2" style={faFont}>
          {isFA ? "کیف پول" : "Wallet"}
        </h1>
        <p className="text-gray-400" style={faFont}>
          {isFA ? "مدیریت موجودی و تراکنش‌ها" : "Manage balance and transactions"}
        </p>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-gradient-to-br from-gold/10 via-obsidian-light to-cyber/5 border border-gold/20 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center">
            <Wallet size={24} className="text-gold" />
          </div>
          <div>
            <p className="text-sm text-gray-400" style={faFont}>
              {isFA ? "موجودی فعلی" : "Current Balance"}
            </p>
            <p className="text-3xl font-bold text-gold">{displayBalance}</p>
          </div>
        </div>
      </motion.div>

      {/* Card-to-Card Deposit */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl bg-obsidian-light border border-obsidian-lighter p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2" style={faFont}>
          <CreditCard size={18} className="text-cyber" />
          {isFA ? "شارژ کیف پول (کارت به کارت)" : "Wallet Top-up (Card to Card)"}
        </h3>
        <div className="space-y-4">
          <Input
            label={isFA ? "مبلغ (دلار)" : "Amount (USD)"}
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="0.00"
            min="1"
            step="0.01"
          />

          {/* Bank Card Selection */}
          <div>
            <p className="text-sm font-medium text-gray-300 mb-3" style={faFont}>
              {isFA ? "انتخاب کارت مقصد" : "Select Destination Card"}
            </p>
            {loadingCards ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-6 h-6 border-2 border-cyber/30 border-t-cyber rounded-full animate-spin" />
              </div>
            ) : bankCards.length === 0 ? (
              <div className="rounded-lg bg-obsidian p-4 border border-obsidian-lighter text-center">
                <p className="text-gray-500" style={faFont}>
                  {isFA ? "هیچ کارت بانکی فعالی یافت نشد" : "No active bank cards found"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {bankCards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setSelectedCardId(card.id)}
                    className={`w-full text-start rounded-lg border p-4 transition-all duration-200 ${
                      selectedCardId === card.id
                        ? "border-cyber/50 bg-cyber/5"
                        : "border-obsidian-lighter bg-obsidian hover:border-obsidian-lighter/80"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="text-cyber" />
                          <span className="text-sm font-bold text-white">{card.bankName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Hash size={14} className="text-gray-500" />
                          <span className="text-sm font-mono text-gray-300 tracking-wider">{card.cardNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Hash size={14} className="text-gray-500" />
                          <span className="text-xs font-mono text-gray-400" dir="ltr">{card.shebaNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserCircle size={14} className="text-gray-500" />
                          <span className="text-xs text-gray-400" style={faFont}>{card.accountHolder}</span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                        selectedCardId === card.id
                          ? "border-cyber bg-cyber/20"
                          : "border-gray-600"
                      }`}>
                        {selectedCardId === card.id && <Check size={12} className="text-cyber" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Input
            label={isFA ? "کد پیگیری" : "Reference Code"}
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder={isFA ? "کد پیگیری پرداخت خود را وارد کنید" : "Enter your payment reference code"}
          />

          <Button
            variant="outline-gold"
            className="w-full"
            onClick={handleSubmitDeposit}
            loading={submitting}
            disabled={loadingCards || bankCards.length === 0}
          >
            {submitting
              ? (isFA ? "در حال ثبت..." : "Submitting...")
              : (isFA ? "ثبت درخواست شارژ" : "Submit Top-up Request")}
          </Button>
        </div>
      </motion.div>

      {/* Promo Code */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl bg-obsidian-light border border-obsidian-lighter p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2" style={faFont}>
          <Tag size={18} className="text-success" />
          {isFA ? "کد تخفیف" : "Promo Code"}
        </h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder={isFA ? "کد تخفیف را وارد کنید" : "Enter promo code"}
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
          </div>
          <Button variant="outline-gold">
            {isFA ? "اعمال" : "Apply"}
          </Button>
        </div>
      </motion.div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl bg-obsidian-light border border-obsidian-lighter p-6"
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2" style={faFont}>
            <Clock size={18} className="text-gray-400" />
            {isFA ? "تاریخچه تراکنش‌ها" : "Transaction History"}
          </h3>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-500" />
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as TransactionType | "all")}
              className="bg-obsidian border border-obsidian-lighter rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-cyber/50 transition-colors cursor-pointer appearance-none"
              dir={dir}
            >
              {FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Transaction List */}
        {loadingTransactions ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-cyber/30 border-t-cyber rounded-full animate-spin" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <ListX size={48} className="text-gray-700 mb-4" />
            <p className="text-gray-500 text-sm" style={faFont}>
              {activeFilter === "all"
                ? (isFA ? "هنوز تراکنشی ثبت نشده است" : "No transactions recorded yet")
                : (isFA ? "تراکنشی با این فیلتر یافت نشد" : "No transactions match this filter")}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2" dir={rowDir}>
            <AnimatePresence mode="popLayout">
              {filteredTransactions.map((tx, index) => {
                const typeConfig = TRANSACTION_TYPE_CONFIG[tx.type];
                const statusConfig = STATUS_CONFIG[tx.status];
                const TypeIcon = typeConfig.icon;
                const isPositive = tx.amount > 0;

                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: Math.min(index * 0.03, 0.5) }}
                    className="rounded-lg bg-obsidian border border-obsidian-lighter p-4 hover:border-obsidian-lighter/80 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Type Icon */}
                      <div className={`w-10 h-10 rounded-lg ${typeConfig.bgClass} flex items-center justify-center flex-shrink-0`}>
                        <TypeIcon size={18} className={typeConfig.colorClass} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${typeConfig.colorClass}`} style={faFont}>
                              {typeConfig.label}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${statusConfig.className}`} style={faFont}>
                              {statusConfig.label}
                            </span>
                          </div>
                          <span className={`text-sm font-bold font-mono ${isPositive ? "text-success" : "text-danger"}`}>
                            {isPositive ? "+" : "-"}${formatAmount(Math.abs(tx.amount))}
                          </span>
                        </div>

                        {tx.description && (
                          <p className="text-xs text-gray-500 mt-1 truncate" style={faFont}>
                            {tx.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2 gap-2">
                          <span className="text-xs text-gray-600" style={faFont}>
                            {formatRelativeTime(tx.createdAt, lang)}
                          </span>
                          {tx.referenceId && (
                            <span className="text-xs font-mono text-gray-600" dir="ltr">
                              #{tx.referenceId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
