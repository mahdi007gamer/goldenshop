'use client';

interface HeroCharacterProps {
  parallaxX: number;
  parallaxY: number;
  dir: 'ltr' | 'rtl';
}

export function HeroCharacter({ parallaxX, parallaxY, dir }: HeroCharacterProps) {
  const isRtl = dir === 'rtl';

  return (
    <div
      className="relative w-full h-full flex items-end justify-center overflow-visible"
      style={{ minHeight: '100%' }}
    >
      {/* Ground glow */}
      <div
        className="absolute bottom-0 w-[90%] h-[90px] pointer-events-none z-[4] animate-glow-pulse"
        style={{
          left: isRtl ? 'auto' : '50%',
          right: isRtl ? '50%' : 'auto',
          transform: `translateX(${isRtl ? '' : '-'}${isRtl ? -parallaxX * 20 : parallaxX * 20}px) translateX(${isRtl ? '50%' : '-50%'})`,
          background: `radial-gradient(ellipse at 50% 100%, rgba(201,150,58,0.28) 0%, rgba(201,150,58,0.08) 45%, transparent 70%)`,
          filter: 'blur(18px)',
        }}
      />

      {/* Character container — positioned on the outer edge, never overlapping text */}
      <div
        className="absolute bottom-0 animate-char-float z-[5]"
        style={{
          // LTR: character pinned to LEFT edge
          // RTL: character pinned to RIGHT edge
          ...(isRtl
            ? { right: '-5%' }
            : { left: '-5%' }
          ),
          transform: `
            scaleX(${isRtl ? -1 : 1})
            translateX(${isRtl ? -parallaxX * 25 : parallaxX * 25}px)
            translateY(${parallaxY * 15}px)
          `,
          filter: `
            drop-shadow(${isRtl ? '20px' : '-20px'} 0 50px rgba(0,0,0,0.95))
            drop-shadow(0 0 80px rgba(201,150,58,0.12))
          `,
          willChange: 'transform',
          height: '100%',
          width: 'auto',
          maxHeight: '100%',
          overflow: 'visible',
        }}
      >
        <img
          src="/images/Character.png"
          alt="Guardian Character"
          className="object-contain object-bottom select-none pointer-events-none"
          style={{
            height: '100%',
            width: 'auto',
            maxWidth: 'none',
          }}
          loading="eager"
          draggable={false}
        />
      </div>
    </div>
  );
}
