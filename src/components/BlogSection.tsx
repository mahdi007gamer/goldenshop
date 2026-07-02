"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/context/LangContext";
import { ArrowLeft, Clock, BookOpen } from "lucide-react";

interface Article {
  id: string;
  title: string;
  titleEn: string | null;
  slug: string;
  slugEn: string | null;
  excerpt: string;
  excerptEn: string | null;
  coverImage: string | null;
  authorName: string;
  category: string;
  categoryEn: string | null;
  readingTime: number;
  publishedAt: string | null;
  createdAt: string;
}

interface BlogSectionProps {
  /** Language override from server (takes precedence over context) */
  lang?: "fa" | "en";
  /** Initial language from server (prevents flash of wrong language) */
  defaultLang?: "fa" | "en";
}

export default function BlogSection({ lang: propLang, defaultLang = "fa" }: BlogSectionProps) {
  const { lang: contextLang } = useLang();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Priority: explicit prop > context lang > defaultLang (server fallback)
  const lang = propLang || contextLang || defaultLang;
  const isFa = lang === "fa";

  useEffect(() => {
    fetch("/api/articles?take=3")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setArticles(json.data.articles);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="blog" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: "rgba(20,20,20,0.6)", border: "1px solid rgba(255,215,0,0.1)" }}>
                <div className="h-44 bg-white/5" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-white/5" />
                  <div className="h-4 w-full rounded bg-white/5" />
                  <div className="h-4 w-2/3 rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (articles.length === 0) return null;

  return (
    <section id="blog" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl font-black mb-3"
            style={{
              fontFamily: "var(--font-display)",
              background: "linear-gradient(135deg, #FFD700, #ffaa00, #FFD700)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {isFa ? "آخرین مقالات" : "Latest Articles"}
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto" style={{ fontFamily: "var(--font-fa)" }}>
            {isFa
              ? "آخرین آموزش‌ها، نکات و اخبار دنیای گیمینگ را بخوانید"
              : "Read the latest tutorials, tips, and gaming news"}
          </p>
          <div className="mt-4 mx-auto w-24 h-[2px] rounded-full" style={{ background: "linear-gradient(90deg, transparent, #FFD700, transparent)" }} />
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} isFa={isFa} />
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-10 text-center">
          <Link
            href={`/${isFa ? "fa" : "en"}/blog`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5"
            style={{
              background: "rgba(255,215,0,0.08)",
              border: "1px solid rgba(255,215,0,0.2)",
              color: "#FFD700",
              fontFamily: "var(--font-fa)",
            }}
          >
            {isFa ? "مشاهده همه مقالات" : "View All Articles"}
            <ArrowLeft size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ArticleCard({ article, isFa }: { article: Article; isFa: boolean }) {
  const title = isFa ? article.title : (article.titleEn || article.title);
  const excerpt = isFa ? article.excerpt : (article.excerptEn || article.excerpt);
  const category = isFa ? article.category : (article.categoryEn || article.category);
  const slug = article.slug;
  const langPrefix = isFa ? "fa" : "en";

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
      return new Intl.DateTimeFormat(isFa ? "fa-IR" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(dateStr));
    } catch {
      return "";
    }
  };

  return (
    <Link
      href={`/${langPrefix}/blog/${slug}`}
      className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(255,215,0,0.12)]"
      style={{
        background: "linear-gradient(135deg, rgba(20,20,20,0.8) 0%, rgba(11,11,11,0.6) 100%)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,215,0,0.12)",
      }}
    >
      {/* Cover */}
      <div className="relative h-44 overflow-hidden">
        {article.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #141414 0%, #1f1f1f 50%, #0B0B0B 100%)" }}>
            <BookOpen size={40} className="opacity-20" style={{ color: "#FFD700" }} />
          </div>
        )}
        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full" style={{ background: "rgba(0,240,255,0.15)", color: "#00f0ff", border: "1px solid rgba(0,240,255,0.3)" }}>
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-base font-bold mb-2 line-clamp-2 transition-colors duration-300 group-hover:text-[#FFD700]" style={{ color: "#e0e0e0", fontFamily: "var(--font-fa)" }}>
          {title}
        </h3>
        <p className="text-sm mb-4 line-clamp-2" style={{ color: "#888", fontFamily: "var(--font-fa)" }}>
          {excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs" style={{ color: "#666" }}>
          <div className="flex items-center gap-3">
            <span style={{ fontFamily: "var(--font-fa)" }}>{article.authorName}</span>
            {article.readingTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock size={10} />
                <span style={{ fontFamily: "var(--font-fa)" }}>{article.readingTime} {isFa ? "دقیقه" : "min"}</span>
              </span>
            )}
          </div>
          <span style={{ fontFamily: "var(--font-fa)" }}>{formatDate(article.publishedAt || article.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
