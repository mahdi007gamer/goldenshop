"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  Shield,
  Key,
  Filter,
  Search,
  Calendar,
  Cpu,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useLang } from "@/context/LangContext";
import Badge from "@/components/ui/Badge";

const STATUS_VARIANT = {
  Active: "success",
  Expired: "danger",
  "Hardware Locked": "warning",
} as const;

export default function LicensePanel() {
  const { licenses } = useApp();
  const { isRTL, translate: t } = useLang();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = licenses.filter((lic) => {
    const matchesSearch =
      searchQuery === "" ||
      lic.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lic.licenseKey.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || lic.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statusLabels: Record<string, string> = {
    all: t("licenses.filterAll"),
    Active: t("licenses.active"),
    Expired: t("licenses.expired"),
    "Hardware Locked": t("licenses.locked"),
  };

  return (
    <section id="licenses" className="py-24 px-4">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-gold/20 bg-gold/5 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            {t("nav.licenses")}
          </span>
          <h2 className="font-display text-3xl font-black text-gold-gradient sm:text-4xl">
            {t("licenses.vault")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-400">
            {t("licenses.subtitle")}
          </p>
        </motion.div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className={`absolute top-1/2 -translate-y-1/2 text-gray-500 ${isRTL ? "right-3" : "left-3"}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("licenses.searchPlaceholder")}
              className={`input-gold ${isRTL ? "pr-10" : "pl-10"}`}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-500" />
            {["all", "Active", "Expired", "Hardware Locked"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  filterStatus === status
                    ? "border-gold/40 bg-gold/20 text-gold"
                    : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                }`}
              >
                {statusLabels[status] ?? status}
              </button>
            ))}
          </div>
        </div>

        {/* License Cards */}
        {licenses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-2xl p-12 text-center"
          >
            <Key size={48} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-bold text-white">{t("licenses.noLicensesYet")}</h3>
            <p className="mt-2 text-sm text-gray-500">
              {t("licenses.noLicensesYetDesc")}
            </p>
          </motion.div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Search size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-500">{t("licenses.noMatch")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((lic, i) => (
              <motion.div
                key={lic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card glass-card-hover rounded-xl p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Info */}
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-white">
                        {lic.productName}
                      </h3>
                      <Badge
                        variant={STATUS_VARIANT[lic.status]}
                        size="sm"
                        glowing
                      >
                        {lic.status === "Active" ? t("licenses.active") : lic.status === "Expired" ? t("licenses.expired") : t("licenses.locked")}
                      </Badge>
                    </div>

                    <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Shield size={12} />
                        {lic.game}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {lic.purchaseDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {t("licenses.expiresLabel")}: {lic.expiryDate}
                      </span>
                    </div>

                    {/* License Key */}
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded-lg bg-black/40 px-4 py-2.5 font-mono text-sm text-gold">
                        {lic.licenseKey}
                      </code>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => copyToClipboard(lic.licenseKey, lic.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold/20 bg-gold/10 text-gold transition-colors hover:bg-gold/20"
                      >
                        {copiedId === lic.id ? (
                          <Check size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </motion.button>
                    </div>

                    {/* HWID */}
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-600">
                      <Cpu size={10} />
                      <span className="font-mono">HWID: {lic.hwid}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
