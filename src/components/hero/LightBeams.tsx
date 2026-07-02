'use client';

import { useEffect, useRef } from 'react';

interface LightBeamsProps {
  parallaxX: number;
}

export function LightBeams({ parallaxX }: LightBeamsProps) {
  const particleContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = particleContainerRef.current;
    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < 15; i++) {
      const p = document.createElement('div');
      const size = 1 + Math.random() * 2;
      const duration = 8 + Math.random() * 12;
      const delay = -Math.random() * 15;
      p.style.cssText = `
        position: absolute;
        left: ${30 + Math.random() * 70}%;
        top: ${Math.random() * 100}%;
        width: ${size}px;
        height: ${size}px;
        background: rgba(255, 220, 120, 0.6);
        border-radius: 50%;
        opacity: ${0.2 + Math.random() * 0.5};
        animation: particleDrift ${duration}s linear infinite ${delay}s;
      `;
      container.appendChild(p);
    }
  }, []);

  return (
    <>
      {/* Primary beam */}
      <div
        className="absolute top-[-10%] right-[-3%] w-[42%] h-[120%] pointer-events-none z-[2] animate-light-pulse"
        style={{
          background:
            'linear-gradient(205deg, rgba(255,220,120,0.14) 0%, rgba(201,150,58,0.08) 30%, rgba(255,200,80,0.03) 55%, transparent 75%)',
          mixBlendMode: 'screen',
          transform: `skewX(-8deg) translateX(${-parallaxX * 30}px)`,
          transition: 'transform 0.1s linear',
        }}
      />

      {/* Secondary beam */}
      <div
        className="absolute top-[5%] right-[10%] w-[18%] h-[90%] pointer-events-none z-[2] animate-light-pulse-d"
        style={{
          background:
            'linear-gradient(200deg, rgba(255,240,160,0.09) 0%, rgba(201,150,58,0.04) 45%, transparent 70%)',
          mixBlendMode: 'screen',
          transform: `skewX(-14deg) translateX(${-parallaxX * 20}px)`,
          transition: 'transform 0.1s linear',
        }}
      />

      {/* Particle container */}
      <div
        ref={particleContainerRef}
        className="absolute top-0 right-0 w-[45%] h-full pointer-events-none z-[3] overflow-hidden"
      />
    </>
  );
}
