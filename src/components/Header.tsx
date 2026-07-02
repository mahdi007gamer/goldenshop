"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Home,
  Package,
  Globe,
  Crown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useLang } from "@/context/LangContext";
import { t as translate } from "@/i18n/translations";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const logout = useAuthStore((s) => s.logout);
  const { items: cartItems, itemCount, total, removeItem } = useCartStore();
  const { lang, isRTL, toggleLang } = useLang();
  const tr = (key: string) => translate(key, lang);
  const router = useRouter();


  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handler = () => {
      setUserMenuOpen(false);
      setCartOpen(false);
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${
        scrolled ? "glass-nav" : "bg-transparent"
      }`}
      style={{ borderBottom: scrolled ? "1px solid rgba(180,140,50,0.15)" : "1px solid transparent" }}
    >
      <div
        className="mx-auto flex max-w-[1280px] items-center justify-between px-6"
        style={{ height: "72px" }}
      >
        {/* Logo */}
        <motion.div className="flex items-center" whileHover={{ scale: 1.02 }}>
          <Link href="/" className="flex items-center gap-2.5">
            {/* Crown SVG */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M2 17L4 5L8 10L12 3L16 10L20 5L22 17H2Z"
                stroke="#C9963A"
                strokeWidth="1.5"
                strokeLinejoin="round"
                fill="rgba(201,150,58,0.15)"
              />
              <path d="M2 17H22V20H2V17Z" fill="#C9963A" opacity="0.8" />
              <circle cx="4" cy="5" r="1.5" fill="#F0C060" />
              <circle cx="12" cy="3" r="1.5" fill="#F0C060" />
              <circle cx="20" cy="5" r="1.5" fill="#F0C060" />
            </svg>
            <span
              className="text-gold-gradient text-lg font-bold tracking-wide"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              GOLDEN CHEAT
            </span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Main navigation"
        >
          {[
            { href: "/", label: tr("nav.home") },
            { href: "/#game-cheats", label: tr("nav.gameCheats") },
            { href: "/#pricing", label: tr("nav.pricing") },
            { href: "/#faq", label: tr("nav.faq") },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side actions: [🌐 EN] [🛒] [👤 ACCOUNT] */}
        <div className="flex items-center gap-3">
          {/* Language Toggle — Globe + EN */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleLang}
            className="relative flex h-9 items-center gap-1.5 rounded-lg bg-white/5 px-2.5 text-muted transition-colors hover:text-gold"
            aria-label="Toggle language"
          >
            <Globe size={16} />
            <span className="text-[10px] font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              {lang === "fa" ? "FA" : "EN"}
            </span>
          </motion.button>

          {/* Cart — outlined, muted */}
          <div className="relative">
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                setCartOpen(!cartOpen);
                setUserMenuOpen(false);
              }}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-muted transition-colors hover:text-gold"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Shopping cart with ${itemCount} items`}
            >
              <ShoppingCart size={18} />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-obsidian"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Cart Dropdown */}
            <AnimatePresence>
              {cartOpen && (
                <motion.div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full mt-3 w-80 overflow-hidden rounded-xl border border-card-border bg-obsidian-light shadow-2xl shadow-black/60 sm:w-96"
                  style={{ right: isRTL ? "auto" : 0, left: isRTL ? 0 : "auto" }}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
                    <h3
                      className="text-sm font-bold text-gold"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      {tr("cart.title")}
                    </h3>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-gold"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-center">
                      <ShoppingCart size={32} className="text-gray-700" />
                      <p className="mt-2 text-sm text-muted">{tr("cart.empty")}</p>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-64 overflow-y-auto p-2">
                        {cartItems.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            className="flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.03]"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-white">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-muted">
                                {item.billingCycle} &times; ${item.product.price.toFixed(2)}
                              </p>
                            </div>
                            <div className="ms-3 flex items-center gap-2">
                              <span className="text-sm font-bold text-gold">
                                ${(item.product.price * item.quantity).toFixed(2)}
                              </span>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="flex h-6 w-6 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-danger/10 hover:text-danger"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="border-t border-white/5 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm text-muted">{tr("cart.total")}</span>
                          <span className="text-lg font-bold text-gold">
                            ${total.toFixed(2)}
                          </span>
                        </div>
                        <Link
                          href="/cart"
                          onClick={() => setCartOpen(false)}
                          className="btn-gold flex w-full items-center justify-center gap-2 py-2.5 text-sm"
                        >
                          {tr("cart.checkout")}
                        </Link>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Button — 👤 ACCOUNT */}
          <div className="relative">
            {isAuthenticated ? (
              <>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                    setCartOpen(false);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold border border-gold/40 bg-gold/10 text-gold transition-all hover:bg-gold/20"
                  style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.05em" }}
                >
                  <User size={16} />
                  <span className="hidden sm:inline">{user?.username}</span>
                  <ChevronDown size={12} />
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-full mt-2 w-56 overflow-hidden rounded-xl border border-card-border bg-obsidian-light shadow-2xl"
                      style={{ right: isRTL ? "auto" : 0, left: isRTL ? 0 : "auto" }}
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="border-b border-white/5 px-4 py-3">
                        <p className="text-sm font-bold text-white">{user?.username}</p>
                        <p className="text-xs text-muted">
                          {user?.role === "admin" ? "Admin" : "User"}
                        </p>
                      </div>

                      <div className="p-2">
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-gold/10 hover:text-gold"
                        >
                          <LayoutDashboard size={16} />
                          {tr("nav.dashboard")}
                        </Link>

                        {user?.role === "admin" && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-gold/10 hover:text-gold"
                          >
                            <LayoutDashboard size={16} />
                            {tr("nav.admin")}
                          </Link>
                        )}

                        <div className="mt-1 border-t border-white/5 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10"
                          >
                            <LogOut size={16} />
                            {tr("nav.logout")}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold btn-outline-gold"
                style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.05em" }}
              >
                <User size={16} />
                <span className="hidden sm:inline">{tr("nav.account")}</span>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <motion.button
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gold md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            className="overflow-hidden border-t border-white/5 bg-obsidian/95 backdrop-blur-xl md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-1 p-4">
              {[
                { href: "/", label: tr("nav.home"), icon: Home },
                { href: "/#game-cheats", label: tr("nav.gameCheats"), icon: Package },
                { href: "/#pricing", label: tr("nav.pricing"), icon: Crown },
                { href: "/#faq", label: tr("nav.faq"), icon: LayoutDashboard },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted hover:bg-white/5 hover:text-white transition-colors"
                  style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.08em" }}
                >
                  <link.icon size={18} />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
