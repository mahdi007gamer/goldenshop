'use client';

import { useState, useEffect, useRef, RefObject } from 'react';
import { ParallaxState } from '@/types/hero';

export function useMouseParallax(ref: RefObject<HTMLElement | null>) {
  const [parallax, setParallax] = useState<ParallaxState>({ x: 0, y: 0 });
  const targetRef = useRef<ParallaxState>({ x: 0, y: 0 });
  const currentRef = useRef<ParallaxState>({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      targetRef.current = {
        x: (e.clientX - rect.width / 2) / rect.width,
        y: (e.clientY - rect.height / 2) / rect.height,
      };
    };

    const handleMouseLeave = () => {
      targetRef.current = { x: 0, y: 0 };
    };

    const animate = () => {
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x, 0.06);
      currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y, 0.06);
      setParallax({ ...currentRef.current });
      rafRef.current = requestAnimationFrame(animate);
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [ref]);

  return parallax;
}
