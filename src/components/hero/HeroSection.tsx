'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useLang } from '@/context/LangContext';
import { useMouseParallax } from '@/hooks/useMouseParallax';
import { HeroCharacter } from './HeroCharacter';
import { HeroContent } from './HeroContent';
import { FeatureCards } from './FeatureCards';
import { LightBeams } from './LightBeams';
import { Navbar } from './Navbar';
import { t } from '@/i18n/translations';

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { x, y } = useMouseParallax(heroRef);
  const { lang, dir, isRTL: isRtl } = useLang();

  return (
    <>
      <Navbar />

      <section
        ref={heroRef}
        dir={dir}
        className="relative w-full overflow-hidden"
        style={{ height: '100vh', minHeight: '650px', maxHeight: '1100px' }}
      >
        {/* Background — rendered as <img> to avoid next/image fill issues in RTL */}
        <div
          className="absolute inset-0 z-0"
          style={{
            transform: `translate(${-x * 15}px, ${-y * 10}px) scale(1.06)`,
            willChange: 'transform',
            transition: 'transform 0.05s linear',
          }}
        >
          <img
            src="/images/background.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{
              transform: isRtl ? 'scaleX(-1)' : 'none',
            }}
            loading="eager"
          />
          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: isRtl
                ? `
                  linear-gradient(270deg, rgba(5,8,14,0.6) 0%, rgba(5,8,14,0.2) 40%, rgba(5,8,14,0.4) 100%),
                  linear-gradient(180deg, rgba(5,8,14,0.3) 0%, rgba(5,8,14,0.0) 35%, rgba(5,8,14,0.7) 100%)
                `
                : `
                  linear-gradient(90deg, rgba(5,8,14,0.6) 0%, rgba(5,8,14,0.2) 40%, rgba(5,8,14,0.4) 100%),
                  linear-gradient(180deg, rgba(5,8,14,0.3) 0%, rgba(5,8,14,0.0) 35%, rgba(5,8,14,0.7) 100%)
                `,
            }}
          />
        </div>

        {/* Light beams */}
        <LightBeams parallaxX={x} />

        {/* ═══════════════════════════════════════════════════════════════════
            DESKTOP: 3-column grid
            LTR: [Character 38%] [Text 32%] [Cards 30%]
            RTL: [Cards 30%] [Text 32%] [Character 38%]
            Character is always on the OUTER edge, never overlapping text.
            ═══════════════════════════════════════════════════════════════════ */}
        <div
          className="hidden md:grid relative z-10 h-full w-full max-w-[1440px] mx-auto px-6 lg:px-8"
          style={{
            gridTemplateColumns: isRtl
              ? '280px 1fr 38%'
              : '38% 1fr 280px',
            gap: '0 2%',
            paddingTop: '60px',
            direction: dir,
          }}
        >
          {isRtl ? (
            <>
              {/* RTL: Cards → Content → Character */}
              <div className="flex items-center py-8">
                <FeatureCards parallaxX={x} parallaxY={y} />
              </div>
              <HeroContent parallaxX={x} parallaxY={y} />
              <HeroCharacter parallaxX={x} parallaxY={y} dir={dir} />
            </>
          ) : (
            <>
              {/* LTR: Character → Content → Cards */}
              <HeroCharacter parallaxX={x} parallaxY={y} dir={dir} />
              <HeroContent parallaxX={x} parallaxY={y} />
              <div className="flex items-center py-8">
                <FeatureCards parallaxX={x} parallaxY={y} />
              </div>
            </>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            MOBILE / TABLET: Stacked layout
            ═══════════════════════════════════════════════════════════════════ */}
        <div className="md:hidden relative z-10 h-full w-full flex flex-col px-4 pt-[70px]" style={{ direction: dir }}>
          {/* Character — top 45% */}
          <div className="relative flex-shrink-0" style={{ height: '42vh', minHeight: '250px' }}>
            <HeroCharacter parallaxX={x} parallaxY={y} dir={dir} />
          </div>

          {/* Content — middle */}
          <div className="flex-shrink-0 py-2">
            <HeroContent parallaxX={x} parallaxY={y} />
          </div>

          {/* Feature cards — bottom (horizontal scroll on mobile) */}
          <div className="flex-shrink-0 pb-4 overflow-x-auto">
            <div className="flex gap-2 min-w-max" style={{ direction: dir }}>
              {[
                { titleKey: 'hero.card.1.title', descKey: 'hero.card.1.desc' },
                { titleKey: 'hero.card.2.title', descKey: 'hero.card.2.desc' },
                { titleKey: 'hero.card.3.title', descKey: 'hero.card.3.desc' },
              ].map((card, i) => (
                <div
                  key={i}
                  className="glass-card rounded-lg p-3 flex items-center gap-2.5"
                  style={{ minWidth: '220px', maxWidth: '260px' }}
                >
                  <div className="icon-circle !w-9 !h-9">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
                      {i === 0 && <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />}
                      {i === 1 && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />}
                      {i === 2 && <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />}
                    </svg>
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: isRtl ? "'Vazirmatn', sans-serif" : "'Rajdhani', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        color: '#fff',
                        marginBottom: '0.15rem',
                      }}
                    >
                      {t(card.titleKey, lang)}
                    </h3>
                    <p
                      style={{
                        fontFamily: isRtl ? "'Vazirmatn', sans-serif" : "'Inter', sans-serif",
                        fontSize: '0.65rem',
                        color: 'rgba(160,170,185,0.85)',
                        lineHeight: 1.4,
                      }}
                    >
                      {t(card.descKey, lang)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-center z-10">
          <span
            className="block mb-1"
            style={{
              fontFamily: isRtl
                ? "'Vazirmatn', sans-serif"
                : "'Rajdhani', sans-serif",
              fontSize: '0.55rem',
              letterSpacing: isRtl ? '0.05em' : '0.25em',
              textTransform: isRtl ? 'none' : 'uppercase',
              color: 'rgba(160,140,100,0.6)',
            }}
          >
            {t('hero.scroll', lang)}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--gold-primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-arrow-bounce block mx-auto"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>
    </>
  );
}
