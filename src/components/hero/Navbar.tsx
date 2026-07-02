'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLang } from '@/context/LangContext';
import { t } from '@/i18n/translations';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cart-store';
import { useAuth } from '@/context/AuthContext';
import { ShoppingCart, X, TrendingUp, DollarSign } from 'lucide-react';
import { useScrolled } from '@/hooks/useScrolled';
import { formatPriceWithRate, toFaDigits } from '@/lib/currency';
import { useCurrency } from '@/hooks/useCurrency';

/* ── Icons ── */
const CrownIcon = () => (
  <svg className="w-7 h-5 flex-shrink-0" viewBox="0 0 24 16" fill="none">
    <path
      d="M2 14h20M2 14L5 4l5 5 4-8 4 8 5-5-3 10H2z"
      stroke="#C9963A"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const navKeys = [
  { key: 'nav.home', href: '/' },
  { key: 'nav.gameCheats', href: '/#game-cheats' },
  { key: 'nav.pricing', href: '/#pricing' },
  { key: 'nav.faq', href: '/#faq' },
] as const;

export function Navbar() {
  const { scrolled } = useScrolled(60);
  const [cartOpen, setCartOpen] = useState(false);
  const { lang, dir, toggleLang, isRTL } = useLang();
  const router = useRouter();
  const { items: cartItems, itemCount, total, removeItem } = useCartStore();

  const getCartItemPrice = (cartItem: typeof cartItems[number]) => {
    const p = cartItem.product;
    switch (cartItem.billingCycle) {
      case 'daily': return p.priceDaily ?? p.price;
      case 'weekly': return p.priceWeekly ?? p.price;
      case 'monthly': return p.priceMonthly ?? p.price;
      case 'lifetime': return p.priceLifetime ?? p.price * 3;
      default: return p.price;
    }
  };
  const { isAuthenticated, user } = useAuth();
  const { rate: exchangeRate } = useCurrency();

  // Helper to display price based on lang
  // FA mode shows both Toman and USD; EN mode shows only USD
  const displayPrice = useCallback((usdAmount: number): React.ReactNode => {
    if (lang === 'fa' && exchangeRate) {
      const toman = formatPriceWithRate(usdAmount, exchangeRate, 'fa');
      const usd = `$${usdAmount.toFixed(2)}`;
      return (
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
          <span>{toman}</span>
          <span style={{ fontSize: '9px', color: '#6b7280', fontWeight: 400 }}>{usd}</span>
        </span>
      );
    }
    return `$${usdAmount.toFixed(2)}`;
  }, [lang, exchangeRate]);

  // Close cart on outside click
  useEffect(() => {
    if (!cartOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-cart-dropdown]')) {
        setCartOpen(false);
      }
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [cartOpen]);

  const isRtl = isRTL;
  const fontFa = "'Vazirmatn', 'IRANYekanWeb', sans-serif";
  const fontEnNav = "'Rajdhani', sans-serif";
  const fontEnLogo = "'Cinzel', serif";

  const handleAccountClick = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <motion.nav
      dir={dir}
      initial={false}
      animate={{
        top: scrolled ? 14 : 0,
        left: scrolled ? '2%' : '0%',
        right: scrolled ? '2%' : '0%',
        borderRadius: scrolled ? 16 : 0,
        height: scrolled ? 56 : 64,
        paddingLeft: scrolled ? 24 : 40,
        paddingRight: scrolled ? 24 : 40,
        backgroundColor: scrolled
          ? 'rgba(6, 9, 18, 0.82)'
          : 'rgba(6, 9, 18, 0)',
        borderColor: scrolled
          ? 'rgba(201, 150, 58, 0.28)'
          : 'rgba(201, 150, 58, 0)',
        boxShadow: scrolled
          ? '0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,150,58,0.08), 0 2px 8px rgba(201,150,58,0.12)'
          : '0 0px 0px rgba(0,0,0,0)',
      }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 28,
        mass: 0.8,
      }}
      style={{
        position: 'fixed',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        backdropFilter: scrolled ? 'blur(24px) saturate(160%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(160%)' : 'none',
        border: '1px solid transparent',
        overflow: 'visible',
      }}
    >
      {/* Top shimmer line when floating */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              top: 0,
              left: '5%',
              right: '5%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(201,150,58,0.5), transparent)',
              transformOrigin: 'center',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      <div
        style={{
          width: '100%',
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          direction: dir,
        }}
      >
        {/* LOGO */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <CrownIcon />
          <motion.span
            animate={{ fontSize: scrolled ? '0.88rem' : '1rem' }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            style={{
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--gold-primary)',
              whiteSpace: 'nowrap',
              fontFamily: isRtl ? fontFa : fontEnLogo,
            }}
          >
            {isRtl ? 'گلدن چیت' : 'GOLDEN CHEAT'}
          </motion.span>
        </Link>

        {/* CENTER LINKS */}
        <ul
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            gap: 'clamp(1rem, 2.5vw, 2.5rem)',
          }}
        >
          {navKeys.map((item, i) => (
            <li key={item.key}>
              <Link
                href={item.href}
                style={{
                  fontFamily: isRtl ? fontFa : fontEnNav,
                  fontWeight: 600,
                  fontSize: 'clamp(0.7rem, 0.88vw, 0.82rem)',
                  letterSpacing: isRtl ? '0.02em' : '0.1em',
                  textTransform: isRtl ? 'none' : 'uppercase',
                  textDecoration: 'none',
                  color: i === 0 ? 'var(--gold-primary)' : 'rgba(255,255,255,0.6)',
                  transition: 'color 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (i !== 0) (e.target as HTMLAnchorElement).style.color = '#C9963A';
                }}
                onMouseLeave={(e) => {
                  if (i !== 0) (e.target as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.6)';
                }}
              >
                {t(item.key, lang)}
              </Link>
            </li>
          ))}
        </ul>

        {/* RIGHT ACTIONS */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: scrolled ? '0.75rem' : '1rem',
            flexShrink: 0,
          }}
        >
          {/* Language switcher */}
          <button
            onClick={toggleLang}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              padding: '0.3rem',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#C9963A')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
            title={lang === 'en' ? 'Switch to Persian' : 'Switch to English'}
          >
            <GlobeIcon />
            <AnimatePresence mode="wait">
              <motion.span
                key={lang}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.18 }}
                style={{
                  fontFamily: isRtl ? fontFa : fontEnNav,
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  letterSpacing: '0.08em',
                }}
              >
                {lang === 'en' ? 'EN' : 'فا'}
              </motion.span>
            </AnimatePresence>
          </button>

          {/* ── USD Exchange Rate Ticker (FA only) ───────────────────── */}
          {lang === 'fa' && (
            <div
              className="nav-currency-ticker"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.3rem 0.7rem',
                borderRadius: '8px',
                border: '1px solid rgba(201,150,58,0.2)',
                background: 'rgba(201,150,58,0.04)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'default',
              }}
            >
              {/* Subtle animated glow pulse */}
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(ellipse at center, rgba(201,150,58,0.08) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Live indicator dot */}
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#00ff88',
                  boxShadow: '0 0 6px #00ff88',
                  flexShrink: 0,
                }}
              />

              {/* Content */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', position: 'relative' }}>
                <DollarSign size={12} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.4)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      lineHeight: 1,
                      fontFamily: fontFa,
                    }}
                  >
                    {t('currency.rate', lang)}
                  </span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={exchangeRate ?? 'loading'}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--gold-bright)',
                        fontFamily: "'Rajdhani', sans-serif",
                        lineHeight: 1,
                        whiteSpace: 'nowrap',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {exchangeRate
                        ? `${toFaDigits(exchangeRate.toLocaleString('fa-IR'))} تومان`
                        : '---'}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <TrendingUp size={11} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
              </div>
            </div>
          )}

          {/* Cart */}
          <div style={{ position: 'relative' }} data-cart-dropdown>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCartOpen(!cartOpen);
              }}
              style={{
                position: 'relative',
                background: 'transparent',
                border: 'none',
                padding: '0.375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.5)',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
            >
              <CartIcon />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      display: 'flex',
                      height: '16px',
                      width: '16px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '999px',
                      fontSize: '9px',
                      fontWeight: 700,
                      background: 'var(--gold-primary)',
                      color: '#060A14',
                    }}
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Cart Dropdown */}
            <AnimatePresence>
              {cartOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    marginTop: '8px',
                    width: '320px',
                    overflow: 'hidden',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(10,14,23,0.98)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                    right: isRtl ? 'auto' : 0,
                    left: isRtl ? 0 : 'auto',
                    zIndex: 9999,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'var(--gold-primary)',
                        fontFamily: "'Cinzel', serif",
                      }}
                    >
                      {isRtl ? 'سبد خرید' : 'Cart'}
                    </h3>
                    <button
                      onClick={() => setCartOpen(false)}
                      style={{
                        display: 'flex',
                        height: '24px',
                        width: '24px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '6px',
                        color: '#6b7280',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {cartItems.length === 0 ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '24px',
                        textAlign: 'center',
                      }}
                    >
                      <ShoppingCart size={24} style={{ color: '#374151' }} />
                      <p style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                        {isRtl ? 'سبد خرید خالی است' : 'Cart is empty'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div style={{ maxHeight: '192px', overflowY: 'auto', padding: '8px' }}>
                        {cartItems.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              borderRadius: '8px',
                              padding: '8px',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <p
                                style={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  color: '#fff',
                                }}
                              >
                                {item.product.name}
                              </p>
                              <p style={{ fontSize: '10px', color: '#6b7280' }}>
                                {isRtl
                                  ? item.billingCycle === 'lifetime' ? 'مادام‌العمر'
                                    : item.billingCycle === 'daily' ? 'روزانه'
                                    : item.billingCycle === 'weekly' ? 'هفتگی'
                                    : 'ماهانه'
                                  : item.billingCycle === 'lifetime' ? 'Lifetime'
                                    : item.billingCycle === 'daily' ? 'Daily'
                                    : item.billingCycle === 'weekly' ? 'Weekly'
                                    : 'Monthly'}
                              </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginInlineStart: '8px' }}>
                              <span
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  color: 'var(--gold-primary)',
                                }}
                              >
                                {displayPrice(getCartItemPrice(item))}
                              </span>
                              <button
                                onClick={() => removeItem(item.id)}
                                style={{
                                  display: 'flex',
                                  height: '20px',
                                  width: '20px',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '4px',
                                  color: '#4b5563',
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                <X size={10} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                          }}
                        >
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                            {isRtl ? 'مجموع' : 'Total'}
                          </span>
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: 700,
                              color: 'var(--gold-primary)',
                            }}
                          >
                            {displayPrice(total)}
                          </span>
                        </div>
                        <Link
                          href="/cart"
                          onClick={() => setCartOpen(false)}
                          style={{
                            display: 'flex',
                            width: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            borderRadius: '8px',
                            padding: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            background: 'var(--gold-primary)',
                            color: '#060A14',
                            textDecoration: 'none',
                          }}
                        >
                          {isRtl ? 'تکمیل خرید' : 'Checkout'}
                        </Link>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Account button */}
          <motion.button
            animate={{
              padding: scrolled ? '0.38rem 0.9rem' : '0.45rem 1.1rem',
              fontSize: scrolled ? '0.72rem' : '0.78rem',
            }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            onClick={handleAccountClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'transparent',
              border: '1.5px solid rgba(201,150,58,0.65)',
              color: 'var(--gold-primary)',
              fontFamily: isRtl ? fontFa : fontEnNav,
              fontWeight: 700,
              letterSpacing: isRtl ? '0.02em' : '0.12em',
              textTransform: isRtl ? 'none' : 'uppercase',
              borderRadius: '4px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--gold-primary)';
              e.currentTarget.style.color = '#060A14';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,150,58,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--gold-primary)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <UserIcon />
            {isAuthenticated ? user?.username || t('nav.account', lang) : t('nav.account', lang)}
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}
