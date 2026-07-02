"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Package,
  Key,
  Wallet,
  Headphones,
  BookOpen,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Crown,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useLang } from "@/context/LangContext";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard", label: "داشبورد" },
  { href: "/dashboard/orders", icon: Package, labelKey: "nav.orders", label: "سفارشات" },
  { href: "/dashboard/licenses", icon: Key, labelKey: "licenses.title", label: "لایسنس‌ها" },
  { href: "/dashboard/wallet", icon: Wallet, labelKey: "nav.wallet", label: "کیف پول" },
  { href: "/dashboard/tickets", icon: Headphones, labelKey: "support.title", label: "پشتیبانی" },
  { href: "/dashboard/courses", icon: BookOpen, labelKey: "nav.courses", label: "دوره‌ها" },
  { href: "/dashboard/notifications", icon: Bell, labelKey: "nav.notifications", label: "اعلان‌ها" },
  { href: "/dashboard/profile", icon: User, labelKey: "nav.profile", label: "پروفایل" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isRTL } = useLang();
  const { user, isAuthenticated, isLoading: authLoading, sessionChecked, logout, checkSession } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Only redirect to login AFTER the initial session check completed AND user is not authenticated
  // This prevents redirect on transient network errors during page refresh
  useEffect(() => {
    if (sessionChecked && !isAuthenticated) {
      router.replace("/login");
    }
  }, [sessionChecked, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  // Show loading spinner while initial session check is in progress
  // This prevents flash of blank content or premature redirect on new tab
  if (!sessionChecked && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        <p className="text-sm text-gray-500 animate-pulse">در حال بررسی نشست...</p>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-obsidian text-gray-200" dir={isRTL ? "rtl" : "ltr"}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 ${isRTL ? "right-0" : "left-0"} h-full z-50
          bg-obsidian-light border-${isRTL ? "l" : "r"} border-obsidian-lighter
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-64" : "w-20"}
          ${mobileMenuOpen ? "translate-x-0" : isRTL ? "translate-x-full lg:translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-obsidian-lighter">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <Crown size={24} className="text-gold flex-shrink-0" />
            {sidebarOpen && (
              <span className="font-display text-sm font-bold text-gold whitespace-nowrap">
                GOLDEN CHEAT
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gold hover:bg-white/5 transition-colors"
          >
            {sidebarOpen ? (
              isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />
            ) : (
              isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gold"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 140px)" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? "bg-gold/10 text-gold border border-gold/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section at bottom */}
        <div className={`absolute bottom-0 inset-x-0 p-3 border-t border-obsidian-lighter`}>
          <div className={`flex items-center gap-3 px-3 py-2 ${sidebarOpen ? "" : "justify-center"}`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center flex-shrink-0">
              <span className="text-obsidian font-bold text-sm">
                {user?.username?.charAt(0).toUpperCase() ?? "U"}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                <p className="text-xs text-gray-500 truncate">{user?.phone}</p>
              </div>
            )}
            {sidebarOpen && (
              <button
                onClick={handleLogout}
                className="flex-shrink-0 p-1.5 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div
        className={`transition-all duration-300 ${sidebarOpen ? "lg:ms-64" : "lg:ms-20"}`}
      >
        {/* Top header bar */}
        <header className="sticky top-0 z-30 h-16 bg-obsidian/90 backdrop-blur-xl border-b border-obsidian-lighter flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-gold hover:bg-white/5"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-fa)" }}>
              {navItems.find((item) => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)))?.label ?? "داشبورد"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-gold hover:bg-white/5 transition-colors"
            >
              <Home size={16} />
              <span className="hidden sm:inline">خانه</span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
