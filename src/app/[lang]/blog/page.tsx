import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
  tags: string;
  readingTime: number;
  publishedAt: Date | null;
  createdAt: Date;
}

async function getArticles(): Promise<{ articles: Article[]; total: number }> {
  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      take: 50,
    }),
    prisma.article.count({ where: { status: "published" } }),
  ]);
  return { articles, total };
}

function parseTags(tagsString: string): string[] {
  try {
    const parsed = JSON.parse(tagsString);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isFa = lang !== "en";
  return {
    title: isFa ? "بلاگ | Golden Cheat" : "Blog | Golden Cheat",
    description: isFa
      ? "آخرین مقالات، آموزش‌ها و اخبار دنیای گیمینگ"
      : "Latest articles, tutorials, and gaming news from Golden Cheat",
    // Canonical + hreflang are set by the root layout via x-url header (server-side in initial HTML).
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (lang !== "fa" && lang !== "en") {
    notFound();
  }

  const isFa = lang === "fa";
  const { articles, total } = await getArticles();

  const pageTitle = isFa ? "بلاگ" : "BLOG";
  const pageDesc = isFa
    ? "آخرین مقالات، آموزش‌ها و اخبار دنیای گیمینگ"
    : "Latest articles, tutorials, and gaming news";
  const articleCount = isFa ? `${total} مقاله منتشر شده` : `${total} articles published`;

  return (
    <main className="min-h-screen" style={{ fontFamily: "var(--font-fa)" }}>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1
            className="text-4xl sm:text-5xl font-black mb-4"
            style={{
              fontFamily: "var(--font-display)",
              background: "linear-gradient(135deg, #FFD700, #ffaa00, #FFD700)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {pageTitle}
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#888" }}>
            {pageDesc}
          </p>
          <div
            className="mt-4 mx-auto w-24 h-[2px] rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, #FFD700, transparent)" }}
          />
        </div>

        {total > 0 && (
          <p className="text-sm mb-8 text-center" style={{ color: "#666" }}>
            {articleCount}
          </p>
        )}

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => {
              const title = isFa ? article.title : (article.titleEn || article.title);
              const excerpt = isFa ? article.excerpt : (article.excerptEn || article.excerpt);
              const category = isFa ? article.category : (article.categoryEn || article.category);
              const tagsList = parseTags(article.tags);
              const articleSlug = isFa ? article.slug : (article.slugEn || article.slug);

              return (
                <Link
                  key={article.id}
                  href={`/${lang}/blog/${articleSlug}`}
                  className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(255,215,0,0.15)]"
                  style={{
                    background: "linear-gradient(135deg, rgba(20,20,20,0.8) 0%, rgba(11,11,11,0.6) 100%)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,215,0,0.15)",
                  }}
                >
                  <div className="relative h-48 overflow-hidden">
                    {article.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={article.coverImage}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #141414 0%, #1f1f1f 50%, #0B0B0B 100%)" }}
                      >
                        <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#FFD700" }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full" style={{ background: "rgba(0,240,255,0.15)", color: "#00f0ff", border: "1px solid rgba(0,240,255,0.3)" }}>
                        {category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h2 className="text-lg font-bold mb-2 line-clamp-2 transition-colors duration-300 group-hover:text-[#FFD700]" style={{ color: "#e0e0e0", fontFamily: "var(--font-fa)" }}>
                      {title}
                    </h2>
                    <p className="text-sm mb-3 line-clamp-2" style={{ color: "#888", fontFamily: "var(--font-fa)" }}>
                      {excerpt}
                    </p>

                    {tagsList.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {tagsList.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 text-[10px] rounded-md" style={{ background: "rgba(0,240,255,0.08)", color: "#00f0ff", border: "1px solid rgba(0,240,255,0.15)" }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs" style={{ color: "#666" }}>
                      <div className="flex items-center gap-3">
                        <span style={{ fontFamily: "var(--font-fa)" }}>{article.authorName}</span>
                        <span style={{ fontFamily: "var(--font-fa)" }}>{article.readingTime} {isFa ? "دقیقه" : "min"}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(20,20,20,0.6) 0%, rgba(11,11,11,0.4) 100%)", border: "1px solid rgba(255,215,0,0.1)" }}>
            <p className="text-lg" style={{ color: "#666" }}>{isFa ? "هنوز مقاله‌ای منتشر نشده" : "No articles published yet"}</p>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
