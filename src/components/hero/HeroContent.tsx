'use client';

import { motion } from 'framer-motion';
import { useLang } from '@/context/LangContext';
import { t } from '@/i18n/translations';

interface HeroContentProps {
  parallaxX: number;
  parallaxY: number;
}

export function HeroContent({ parallaxX, parallaxY }: HeroContentProps) {
  const { lang, isRTL } = useLang();
  const dir = isRTL ? 'rtl' : 'ltr';

  const isRtl = isRTL;
  const fontFa = "'Vazirmatn', 'IRANYekanWeb', sans-serif";
  const fontEnHeading = "'Rajdhani', sans-serif";
  const fontEnBody = "'Inter', sans-serif";

  const eyebrow = t('hero.eyebrow', lang);
  const line1 = t('hero.headline.1', lang);
  const line2 = t('hero.headline.2', lang);
  const line3 = t('hero.headline.3', lang);
  const subheadline = t('hero.subheadline', lang);
  const subBold = t('hero.subBold', lang);
  const btnPrimary = t('hero.btnPrimary', lang);
  const btnSecondary = t('hero.btnSecondary', lang);

  return (
    <div
      className="flex flex-col justify-center h-full px-2 sm:px-4"
      style={{
        transform: `translate(${parallaxX * 8}px, ${parallaxY * 5}px)`,
        willChange: 'transform',
        textAlign: isRtl ? 'right' : 'left',
        direction: dir,
        fontFamily: isRtl ? `${fontFa}, ${fontEnBody}` : fontEnBody,
      }}
    >
      {/* Eyebrow */}
      <motion.p
        key={`eyebrow-${lang}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          fontFamily: isRtl ? fontFa : fontEnHeading,
          fontSize: isRtl ? '0.72rem' : '0.68rem',
          fontWeight: 600,
          letterSpacing: isRtl ? '0.05em' : '0.38em',
          textTransform: isRtl ? 'none' : 'uppercase',
          color: 'var(--gold-primary)',
          marginBottom: '1rem',
          opacity: 0.9,
        }}
      >
        {eyebrow}
      </motion.p>

      {/* Headline with GLOW effect */}
      <motion.h1
        key={`headline-${lang}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{
          lineHeight: isRtl ? 1.5 : 1.0,
          textTransform: isRtl ? 'none' : 'uppercase',
          letterSpacing: isRtl ? '0' : '0.01em',
          marginBottom: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: isRtl ? fontFa : fontEnHeading,
        }}
      >
        {[line1, line2, line3].map((line, i) => (
          <motion.span
            key={`${line}-${i}`}
            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
            className={isRtl ? 'font-fa-heading' : ''}
            style={{
              display: 'block',
              background:
                'linear-gradient(160deg, #FFD060 0%, #E8B030 30%, #C98828 55%, #D4A030 75%, #FFD060 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: isRtl
                ? 'clamp(2.4rem, 5.5vw, 4.2rem)'
                : 'clamp(2.8rem, 4vw, 4.6rem)',
              fontWeight: isRtl ? 900 : 800,
              filter:
                'drop-shadow(0 0 20px rgba(240,176,48,0.45)) drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
              wordSpacing: isRtl ? '0.06em' : '0',
              letterSpacing: isRtl ? '0' : undefined,
            }}
          >
            {line}
          </motion.span>
        ))}
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        key={`sub-${lang}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{
          fontSize: isRtl ? '0.95rem' : '0.92rem',
          color: 'rgba(195,208,222,0.78)',
          lineHeight: isRtl ? 1.8 : 1.75,
          maxWidth: '420px',
          marginBottom: '2rem',
          fontFamily: isRtl ? fontFa : fontEnBody,
        }}
      >
        {subheadline}{' '}
        <strong
          style={{
            color: 'var(--gold-primary)',
            fontWeight: 700,
            textShadow: '0 0 12px rgba(201,150,58,0.5)',
          }}
        >
          {subBold}
        </strong>
      </motion.p>

      {/* CTAs — always horizontal */}
      <motion.div
        key={`cta-${lang}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.65 }}
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '0.75rem',
          flexWrap: 'wrap',
          justifyContent: isRtl ? 'flex-end' : 'flex-start',
        }}
      >
        {/* Primary — solid gold */}
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          style={{
            background:
              'linear-gradient(135deg, #D4A030 0%, #C9963A 50%, #B8841E 100%)',
            color: '#060A14',
            border: 'none',
            fontFamily: isRtl ? fontFa : fontEnHeading,
            fontWeight: 800,
            fontSize: isRtl ? '0.85rem' : '0.82rem',
            letterSpacing: isRtl ? '0' : '0.18em',
            textTransform: isRtl ? 'none' : 'uppercase',
            padding: '0.9rem 2rem',
            borderRadius: '2px',
            cursor: 'pointer',
            minWidth: '150px',
            boxShadow:
              '0 4px 24px rgba(201,150,58,0.45), inset 0 1px 0 rgba(255,220,100,0.3)',
            transition: 'box-shadow 0.2s',
          }}
        >
          {btnPrimary}
        </motion.button>

        {/* Secondary — outlined */}
        <motion.button
          whileHover={{
            scale: 1.03,
            y: -2,
            background: 'rgba(201,150,58,0.12)',
          }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: 'transparent',
            color: 'var(--gold-primary)',
            border: '1.5px solid rgba(201,150,58,0.75)',
            fontFamily: isRtl ? fontFa : fontEnHeading,
            fontWeight: 800,
            fontSize: isRtl ? '0.85rem' : '0.82rem',
            letterSpacing: isRtl ? '0' : '0.18em',
            textTransform: isRtl ? 'none' : 'uppercase',
            padding: '0.9rem 2rem',
            borderRadius: '2px',
            cursor: 'pointer',
            minWidth: '150px',
            boxShadow: '0 0 0 0 rgba(201,150,58,0)',
            transition: 'all 0.2s',
          }}
        >
          {btnSecondary}
        </motion.button>
      </motion.div>
    </div>
  );
}
