"use client";

import React from "react";
import { useLang } from "@/context/LangContext";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isRTL } = useLang();

  return (
    <div className="min-h-screen flex" dir={isRTL ? "rtl" : "ltr"}>
      {/* Left side — Image / Branding (hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-obsidian">
        {/* Full-bleed background image with blur */}
        <Image
          src="/images/auth-bg.png"
          alt="Golden Cheat"
          fill
          className="object-cover scale-110 blur-[8px] brightness-[0.35]"
          priority
        />

        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-obsidian/80 via-obsidian/60 to-obsidian/80" />

        {/* Cyberpunk grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,240,255,0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,240,255,0.4) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Neon glow effects */}
        <div className="absolute top-1/4 start-1/4 w-72 h-72 bg-cyber/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 end-1/4 w-56 h-56 bg-purple-600/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gold/10 rounded-full blur-[80px]" />

        {/* Branding content — centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-12">
          <div className="text-center space-y-6">
            {/* Logo area */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.3)]">
                <span className="text-obsidian font-black text-xl">G</span>
              </div>
              <span className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                GOLDEN CHEAT
              </span>
            </div>

            <h2
              className="text-4xl font-bold text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              style={{ fontFamily: "var(--font-fa)" }}
            >
              به دنیای
              <span className="text-cyber"> جنگویان </span>
              بپیوند
            </h2>

            <p className="text-gray-300 text-lg max-w-md mx-auto drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]" style={{ fontFamily: "var(--font-fa)" }}>
              امن‌ترین و باکیفیت‌ترین ابزارهای گیمینگ با پشتیبانی ۲۴/۷
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {["غیرقابل تشخیص", "تحویل آنی", "پشتیبانی ۲۴/۷"].map((feature) => (
                <span
                  key={feature}
                  className="px-4 py-2 rounded-full bg-white/10 border border-white/15 text-sm text-gray-200 backdrop-blur-sm"
                  style={{ fontFamily: "var(--font-fa)" }}
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-obsidian to-transparent" />
      </div>

      {/* Right side — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-obsidian p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
              <span className="text-obsidian font-black text-lg">G</span>
            </div>
            <span className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              GOLDEN CHEAT
            </span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
