"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useLang } from "@/context/LangContext";

const stats = [
  { value: 50000, suffix: "+", labelKey: "stats.warriors", prefix: "" },
  { value: 1000000, suffix: "+", labelKey: "stats.licenses", prefix: "" },
  { value: 99.9, suffix: "%", labelKey: "stats.uptime", prefix: "" },
  { value: 24, suffix: "/7", labelKey: "hero.stats.bypass", prefix: "" },
];

function AnimatedCounter({ target, suffix, prefix, isInView }: { target: number; suffix: string; prefix: string; isInView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current * 10) / 10);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  const displayValue =
    target >= 1000
      ? count >= 1000
        ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K`
        : count.toFixed(1)
      : count % 1 === 0
        ? count.toString()
        : count.toFixed(1);

  return <span>{prefix}{displayValue}{suffix}</span>;
}

export default function Stats() {
  const { translate: t } = useLang();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-20 px-4">
      <div className="absolute inset-0 bg-gradient-to-r from-gold/[0.03] via-transparent to-cyber/[0.03]" />
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-3xl p-8 sm:p-12"
        >
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.labelKey}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-display text-3xl font-black text-gold-gradient sm:text-4xl">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} prefix={stat.prefix} isInView={isInView} />
                </p>
                <p className="mt-2 text-sm text-gray-400">{t(stat.labelKey)}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
