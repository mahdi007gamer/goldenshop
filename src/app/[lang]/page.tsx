import Footer from "@/components/Footer";
import GameCheats from "@/components/GameCheats";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import GoToTop from "@/components/GoToTop";
import BlogSection from "@/components/BlogSection";
import { HeroSection } from "@/components/hero/HeroSection";

interface LangHomeProps {
  params: Promise<{ lang: string }>;
}

/**
 * Language-aware home page.
 * Server component that reads lang from the URL path and passes it to
 * child client components (BlogSection etc.) so they render the correct
 * language on first paint — no flash of wrong language.
 */
export default async function LangHome({ params }: LangHomeProps) {
  const { lang } = await params;
  const isEn = lang === "en";

  return (
    <div
      className="relative min-h-screen text-white"
      style={{ backgroundColor: "#05080E" }}
    >
      {/* Background smoke */}
      <div className="smoke" />

      {/* Main Content */}
      <main className="relative">
        <HeroSection />

        <div className="section-divider mx-auto max-w-5xl" />

        <GameCheats />

        <div className="section-divider mx-auto max-w-5xl" />

        {/* Latest blog articles — placed above the pricing plans */}
        <BlogSection lang={isEn ? "en" : "fa"} />

        <div className="section-divider mx-auto max-w-5xl" />

        <Pricing />

        <div className="section-divider mx-auto max-w-5xl" />

        <FAQ />

        <div className="section-divider mx-auto max-w-5xl" />

        <Testimonials />

        <div className="section-divider mx-auto max-w-5xl" />

        <CTA />
      </main>

      {/* Footer */}
      <Footer />

      {/* Go to Top */}
      <GoToTop />
    </div>
  );
}
