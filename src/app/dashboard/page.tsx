"use client";

import React from "react";
import { motion } from "framer-motion";
import { Package, Key, Wallet, Headphones, Clock } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

export default function DashboardOverview() {
  const { user } = useAuthStore();

  const stats = [
    {
      label: "سفارشات",
      value: "0",
      icon: Package,
      color: "text-gold",
      bgColor: "bg-gold/10",
      borderColor: "border-gold/20",
    },
    {
      label: "لایسنس‌های فعال",
      value: "0",
      icon: Key,
      color: "text-cyber",
      bgColor: "bg-cyber/10",
      borderColor: "border-cyber/20",
    },
    {
      label: "موجودی کیف پول",
      value: `$${user?.walletBalance?.toFixed(2) ?? "0.00"}`,
      icon: Wallet,
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/20",
    },
    {
      label: "تیکت‌های باز",
      value: "0",
      icon: Headphones,
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/20",
    },
  ];

  const quickActions = [
    { label: "مشاهده فروشگاه", href: "/products", icon: Package },
    { label: "لایسنس‌های من", href: "/dashboard/licenses", icon: Key },
    { label: "کیف پول", href: "/dashboard/wallet", icon: Wallet },
    { label: "پشتیبانی", href: "/dashboard/tickets", icon: Headphones },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-obsidian-light to-obsidian border border-obsidian-lighter p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-fa)" }}>
          خوش آمدید، <span className="text-gold">{user?.username}</span>! 👋
        </h2>
        <p className="text-gray-400" style={{ fontFamily: "var(--font-fa)" }}>
          خلاصه وضعیت حساب کاربری شما
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-xl bg-obsidian-light border ${stat.borderColor} p-5 hover:bg-obsidian-lighter/50 transition-colors`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon size={20} className={stat.color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-gray-500" style={{ fontFamily: "var(--font-fa)" }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "var(--font-fa)" }}>
          دسترسی سریع
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-obsidian-light border border-obsidian-lighter hover:border-gold/20 hover:bg-obsidian-lighter/50 transition-all group"
            >
              <action.icon size={24} className="text-gray-400 group-hover:text-gold transition-colors" />
              <span className="text-sm text-gray-400 group-hover:text-white transition-colors" style={{ fontFamily: "var(--font-fa)" }}>
                {action.label}
              </span>
            </a>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity (placeholder) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl bg-obsidian-light border border-obsidian-lighter p-5"
      >
        <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "var(--font-fa)" }}>
          فعالیت‌های اخیر
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Clock size={40} className="text-gray-700 mb-3" />
          <p className="text-gray-500" style={{ fontFamily: "var(--font-fa)" }}>
            هنوز فعالیتی ثبت نشده است
          </p>
          <p className="text-gray-600 text-sm mt-1" style={{ fontFamily: "var(--font-fa)" }}>
            پس از خرید محصولات، فعالیت‌های شما اینجا نمایش داده می‌شود
          </p>
        </div>
      </motion.div>
    </div>
  );
}
