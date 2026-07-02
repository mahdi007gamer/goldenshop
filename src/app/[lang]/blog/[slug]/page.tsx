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
  content: string;
  contentEn: string | null;
  coverImage: string | null;
  authorId: string;
  authorName: string;
  category: string;
  categoryEn: string | null;
  tags: string;
  status: string;
  readingTime: number;
  views: number;
  metaTitle: string | null;
  metaTitleEn: string | null;
  metaDescription: string | null;
  metaDescriptionEn: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

async function getArticle(rawSlug: string, lang: "fa" | "en"): Promise<Article | null> {
  // Next.js may pass percent-encoded bytes for non-ASCII slugs
  const slug = decodeURIComponent(rawSlug);
  const article = await prisma.article.findFirst({
    where: {
      status: "published",
      OR: [{ slug }, { slugEn: slug }],
    },
  });

  if (article) {
    await prisma.article.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    }).catch(() => {});
  }

  return article;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const typedLang = lang === "en" ? "en" : "fa";
  const article = await getArticle(slug, typedLang);

  if (!article) {
    return {
      title: typedLang === "fa" ? "مقاله یافت نشد | Golden Cheat" : "Article Not Found | Golden Cheat",
    };
  }

  const title = typedLang === "fa"
    ? (article.metaTitle || article.title)
    : (article.metaTitleEn || article.titleEn || article.title);
  const description = typedLang === "fa"
    ? (article.metaDescription || article.excerpt.substring(0, 160))
    : (article.metaDescriptionEn || article.excerptEn || article.excerpt.substring(0, 160));
  const faSlug = article.slug;
  const enSlug = article.slugEn || article.slug;

  return {
    title: `${title} | Golden Cheat`,
    description,
    alternates: {
      canonical: `/${typedLang}/blog/${typedLang === "fa" ? faSlug : enSlug}`,
      languages: {
        "fa": `/fa/blog/${faSlug}`,
        "en": `/en/blog/${enSlug}`,
      },
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.authorName],
      images: article.coverImage ? [article.coverImage] : undefined,
      locale: typedLang === "fa" ? "fa_IR" : "en_US",
    },
  };
}

function formatDate(dateValue: Date | string | null | undefined, isFa: boolean): string {
  if (!dateValue) return "";
  const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
  return new Intl.DateTimeFormat(isFa ? "fa-IR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function parseTags(tagsString: string): string[] {
  try {
    const parsed = JSON.parse(tagsString);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;

  if (lang !== "fa" && lang !== "en") {
    notFound();
  }

  const isFa = lang === "fa";
  const article = await getArticle(slug, isFa ? "fa" : "en");

  if (!article) {
    notFound();
  }

  const title = isFa ? article.title : (article.titleEn || article.title);
  const content = isFa ? article.content : (article.contentEn || article.content);
  const category = isFa ? article.category : (article.categoryEn || article.category);
  const tagsList = parseTags(article.tags);
  const backText = isFa ? "بازگشت به بلاگ" : "Back to Blog";
  const minuteText = isFa ? "دقیقه مطالعه" : "min read";
  const viewsText = isFa ? "بازدید" : "views";
  const tagsTitle = isFa ? "برچسب‌ها" : "Tags";
  const viewAllText = isFa ? "مشاهده همه مقالات" : "View All Articles";

  return (
    <main className="min-h-screen" style={{ fontFamily: "var(--font-fa)" }}>
      <Header />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <Link
          href={`/${lang}/blog`}
          className="inline-flex items-center gap-2 mb-8 text-sm transition-colors hover:text-[#FFD700]"
          style={{ color: "#888" }}
        >
          <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {backText}
        </Link>

        {article.coverImage && (
          <div className="relative h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.coverImage} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,11,11,0.7) 0%, transparent 50%)" }} />
          </div>
        )}

        <div className="mb-4">
          <span className="px-3 py-1 text-xs font-semibold rounded-full" style={{ background: "rgba(0,240,255,0.15)", color: "#00f0ff", border: "1px solid rgba(0,240,255,0.3)" }}>
            {category}
          </span>
        </div>

        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 leading-tight"
          style={{
            fontFamily: "var(--font-display)",
            background: "linear-gradient(135deg, #FFD700, #ffaa00, #FFD700)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 text-sm" style={{ color: "#888", borderBottom: "1px solid rgba(255,215,0,0.1)" }}>
          <span style={{ fontFamily: "var(--font-fa)" }}>{article.authorName}</span>
          <span style={{ fontFamily: "var(--font-fa)" }}>
            {article.publishedAt ? formatDate(article.publishedAt, isFa) : formatDate(article.createdAt, isFa)}
          </span>
          <span style={{ fontFamily: "var(--font-fa)" }}>{article.readingTime} {minuteText}</span>
          <span style={{ fontFamily: "var(--font-fa)" }}>{article.views} {viewsText}</span>
        </div>

        <div
          className="article-content max-w-none"
          style={{ color: "#d0d0d0", lineHeight: "1.9", fontFamily: "var(--font-fa)" }}
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {tagsList.length > 0 && (
          <div className="mt-12 pt-8" style={{ borderTop: "1px solid rgba(255,215,0,0.1)" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "#888" }}>{tagsTitle}</h3>
            <div className="flex flex-wrap gap-2">
              {tagsList.map((tag) => (
                <span key={tag} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "rgba(255,215,0,0.08)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.2)" }}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 pt-8" style={{ borderTop: "1px solid rgba(255,215,0,0.1)" }}>
          <Link
            href={`/${lang}/blog`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-x-1"
            style={{ background: "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,170,0,0.1))", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)" }}
          >
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {viewAllText}
          </Link>
        </div>
      </article>

      <Footer />
    </main>
  );
}
