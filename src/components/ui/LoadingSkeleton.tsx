"use client";

import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  rounded?: boolean;
}

export function Skeleton({ className = "", rounded = false }: SkeletonProps) {
  return (
    <div
      className={`overflow-hidden bg-white/5 ${rounded ? "rounded-full" : "rounded-lg"} ${className}`}
    >
      <motion.div
        className="h-full w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.05) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
        }}
        animate={{
          backgroundPosition: ["200% 0", "-200% 0"],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-6">
      <Skeleton className="mb-4 h-4 w-20" />
      <Skeleton className="mb-3 h-6 w-3/4" />
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="mb-2 h-4 w-5/6" />
      <Skeleton className="mb-4 h-4 w-2/3" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <section className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-7xl px-6">
        <div className="flex flex-col items-center lg:flex-row lg:gap-12">
          <div className="flex-1 space-y-6">
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-20 w-full max-w-md" />
            <Skeleton className="h-6 w-80" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-40 rounded-lg" />
              <Skeleton className="h-12 w-40 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-96 w-80" rounded />
        </div>
      </div>
    </section>
  );
}
