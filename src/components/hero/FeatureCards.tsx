'use client';

import { motion } from 'framer-motion';
import { useLang } from '@/context/LangContext';
import { t } from '@/i18n/translations';

/* Icons */
const WrenchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    width="20"
    height="20"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ChatIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    width="20"
    height="20"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const icons = [WrenchIcon, ShieldIcon, ChatIcon];

interface FeatureCardsProps {
  parallaxX: number;
  parallaxY: number;
}

const cardStyle: React.CSSProperties = {
  position: 'relative',
  background:
    'linear-gradient(135deg, rgba(14,10,4,0.82) 0%, rgba(10,8,3,0.88) 100%)',
  border: '1.5px solid rgba(201,150,58,0.60)',
  borderRadius: '10px',
  padding: '1.1rem 1.3rem',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
  boxShadow: `
    0 0 0 1px rgba(201,150,58,0.10),
    inset 0 1px 0 rgba(255,210,80,0.18),
    inset 0 0 40px rgba(201,150,58,0.04),
    0 6px 30px rgba(0,0,0,0.6)
  `,
  overflow: 'hidden',
  cursor: 'default',
};

const statsBarStyle: React.CSSProperties = {
  position: 'relative',
  background:
    'linear-gradient(135deg, rgba(14,10,4,0.82) 0%, rgba(10,8,3,0.88) 100%)',
  border: '1.5px solid rgba(201,150,58,0.60)',
  borderRadius: '10px',
  padding: '0.9rem 1.4rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
  boxShadow: `
    inset 0 1px 0 rgba(255,210,80,0.18),
    0 6px 30px rgba(0,0,0,0.5)
  `,
  overflow: 'hidden',
};

export function FeatureCards({ parallaxX, parallaxY }: FeatureCardsProps) {
  const { lang, isRTL } = useLang();
  const dir = isRTL ? 'rtl' : 'ltr';
  const isRtl = isRTL;

  const fontFa = "'Vazirmatn', 'IRANYekanWeb', sans-serif";
  const fontEnHeading = "'Rajdhani', sans-serif";
  const fontEnBody = "'Inter', sans-serif";

  const cardData = [
    { titleKey: 'hero.card.1.title', descKey: 'hero.card.1.desc' },
    { titleKey: 'hero.card.2.title', descKey: 'hero.card.2.desc' },
    { titleKey: 'hero.card.3.title', descKey: 'hero.card.3.desc' },
  ] as const;

  const statData = [
    { value: '99.9%', labelKey: 'hero.stat.bypass' },
    { value: '12K+', labelKey: 'hero.stat.licenses' },
    { value: '8,400+', labelKey: 'hero.stat.users' },
  ] as const;

  return (
    <div
      className="flex flex-col gap-[0.6rem] w-full"
      style={{
        transform: `translate(${-parallaxX * 10}px, ${-parallaxY * 8}px)`,
        willChange: 'transform',
        direction: dir,
      }}
    >
      {cardData.map((card, i) => {
        const Icon = icons[i];
        return (
          <motion.div
            key={`${lang}-card-${i}`}
            initial={{ opacity: 0, x: isRtl ? -40 : 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + i * 0.12 }}
            style={cardStyle}
            whileHover={{
              borderColor: 'rgba(201,150,58,0.9)',
              boxShadow: `
                0 0 0 1px rgba(201,150,58,0.18),
                inset 0 1px 0 rgba(255,210,80,0.25),
                0 6px 35px rgba(0,0,0,0.7),
                0 0 28px rgba(201,150,58,0.18)
              `,
              x: isRtl ? -4 : 4,
            }}
          >
            {/* Top shimmer line */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '8%',
                right: '8%',
                height: '1px',
                background:
                  'linear-gradient(90deg, transparent, rgba(255,210,70,0.60), transparent)',
                pointerEvents: 'none',
              }}
            />

            {/* Inner top warm glow */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '45%',
                background:
                  'linear-gradient(180deg, rgba(201,150,58,0.05) 0%, transparent 100%)',
                borderRadius: '10px 10px 0 0',
                pointerEvents: 'none',
              }}
            />

            {/* ICON circle */}
            <div
              style={{
                flexShrink: 0,
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background:
                  'linear-gradient(145deg, rgba(201,150,58,0.32) 0%, rgba(140,95,20,0.20) 100%)',
                border: '1.5px solid rgba(201,150,58,0.60)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F0C060',
                boxShadow:
                  '0 0 16px rgba(201,150,58,0.30), inset 0 1px 0 rgba(255,220,100,0.22)',
                zIndex: 1,
                flexDirection: 'column',
              }}
            >
              <Icon />
            </div>

            {/* Text */}
            <div style={{ flex: 1, zIndex: 1 }}>
              <h3
                style={{
                  fontFamily: isRtl ? fontFa : fontEnHeading,
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  letterSpacing: isRtl ? '0.02em' : '0.1em',
                  textTransform: isRtl ? 'none' : 'uppercase',
                  color: '#FFFFFF',
                  marginBottom: '0.35rem',
                  lineHeight: 1.25,
                  textShadow: '0 0 12px rgba(255,255,255,0.15)',
                }}
              >
                {t(card.titleKey, lang)}
              </h3>
              <p
                style={{
                  fontFamily: isRtl ? fontFa : fontEnBody,
                  fontSize: '0.76rem',
                  color: 'rgba(160,170,185,0.85)',
                  lineHeight: 1.58,
                  textAlign: isRtl ? 'right' : 'left',
                }}
              >
                {t(card.descKey, lang)}
              </p>
            </div>
          </motion.div>
        );
      })}

      {/* STATS BAR */}
      <motion.div
        key={`${lang}-stats`}
        initial={{ opacity: 0, x: isRtl ? -40 : 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.86 }}
        style={statsBarStyle}
      >
        {/* Top shimmer */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '8%',
            right: '8%',
            height: '1px',
            background:
              'linear-gradient(90deg, transparent, rgba(255,210,70,0.55), transparent)',
            pointerEvents: 'none',
          }}
        />

        {statData.map((stat, i) => (
          <div key={stat.labelKey} style={{ textAlign: 'center', flex: 1 }}>
            <span
              style={{
                fontFamily: isRtl ? fontFa : fontEnHeading,
                fontWeight: 800,
                fontSize: '1.65rem',
                color: '#F0C060',
                lineHeight: 1,
                display: 'block',
                textShadow:
                  '0 0 24px rgba(240,192,96,0.55), 0 0 8px rgba(240,192,96,0.3)',
                filter: 'drop-shadow(0 0 6px rgba(240,192,96,0.35))',
              }}
            >
              {stat.value}
            </span>
            <span
              style={{
                fontFamily: isRtl ? fontFa : fontEnBody,
                fontSize: '0.58rem',
                letterSpacing: isRtl ? '0.02em' : '0.14em',
                textTransform: isRtl ? 'none' : 'uppercase',
                color: 'rgba(120,130,145,0.9)',
                display: 'block',
                marginTop: '0.3rem',
              }}
            >
              {t(stat.labelKey, lang)}
            </span>
            {i < statData.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  [isRtl ? 'left' : 'right']: 0,
                  transform: 'translateY(-50%)',
                  width: '1px',
                  height: '32px',
                  background:
                    'linear-gradient(to bottom, transparent, rgba(201,150,58,0.35), transparent)',
                }}
              />
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
