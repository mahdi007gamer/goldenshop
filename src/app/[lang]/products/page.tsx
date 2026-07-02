import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ── Types ────────────────────────────────────────────────────────────────

interface ProductCard {
  id: string;
  name: string;
  nameFa: string;
  nameEn: string | null;
  slug: string;
  slugEn: string | null;
  game: string;
  category: string;
  price: number;
  salePrice: number | null;
  rating: number;
  reviewsCount: number;
  shortDesc: string;
  shortDescFa: string;
  shortDescEn: string | null;
  tags: string[];
  tagsFa: string[];
  tagsEn: string[];
  isPopular: boolean;
  imageUrl: string | null;
  bannerImage: string | null;
  bypassRate: string;
  updateStatus: string;
}

// ── Data fetching ───────────────────────────────────────────────────────

function parseJson(val: string | null | undefined): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function getProducts(tagFilter: string | null): Promise<ProductCard[]> {
  const where: Record<string, unknown> = { status: "active" };

  // Filter by tag if provided — check both tags and tagsEn JSON strings
  if (tagFilter) {
    // SQLite doesn't support JSON querying easily, so we fetch all and filter in JS
    const allProducts = await prisma.product.findMany({
      where: { status: "active" },
      orderBy: { isPopular: "desc" },
    });

    return allProducts
      .map((p) => {
        const tagsFa = parseJson(p.tags as string | null);
        const tagsEn = parseJson(p.tagsEn as string | null);
        return {
          id: p.id,
          name: p.name,
          nameFa: p.name,
          nameEn: p.nameEn,
          slug: p.slug,
          slugEn: p.slugEn,
          game: p.game,
          category: p.category,
          price: p.price,
          salePrice: p.salePrice,
          rating: p.rating,
          reviewsCount: p.reviewsCount,
          shortDesc: p.shortDesc || "",
          shortDescFa: p.shortDesc || "",
          shortDescEn: p.shortDescEn,
          tags: tagsFa,
          tagsFa,
          tagsEn,
          isPopular: p.isPopular,
          imageUrl: p.imageUrl,
          bannerImage: p.bannerImage,
          bypassRate: p.bypassRate,
          updateStatus: p.updateStatus,
        } as ProductCard;
      })
      .filter((p) => {
        const allTags = [...p.tagsFa, ...p.tagsEn].map((t) => t.toLowerCase());
        return allTags.includes(tagFilter.toLowerCase());
      });
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { isPopular: "desc" },
  });

  return products.map((p) => {
    const tagsFa = parseJson(p.tags as string | null);
    const tagsEn = parseJson(p.tagsEn as string | null);
    return {
      id: p.id,
      name: p.name,
      nameFa: p.name,
      nameEn: p.nameEn,
      slug: p.slug,
      slugEn: p.slugEn,
      game: p.game,
      category: p.category,
      price: p.price,
      salePrice: p.salePrice,
      rating: p.rating,
      reviewsCount: p.reviewsCount,
      shortDesc: p.shortDesc || "",
      shortDescFa: p.shortDesc || "",
      shortDescEn: p.shortDescEn,
      tags: tagsFa,
      tagsFa,
      tagsEn,
      isPopular: p.isPopular,
      imageUrl: p.imageUrl,
      bannerImage: p.bannerImage,
      bypassRate: p.bypassRate,
      updateStatus: p.updateStatus,
    } as ProductCard;
  });
}

// ── Metadata ────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tag?: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const { tag } = await searchParams;
  const isFa = lang !== "en";

  const title = isFa
    ? (tag ? `${tag} | فروشگاه محصولات` : "فروشگاه محصولات")
    : (tag ? `${tag} | Product Store` : "Product Store");
  const description = isFa
    ? (tag ? `محصولات مرتبط با ${tag} را مشاهده کنید` : "بهترین ابزارهای بازی را با کیفیت بالا و قیمت مناسب تجربه کنید")
    : (tag ? `Browse products tagged with ${tag}` : "Experience the best gaming tools with high quality and fair pricing");

  return {
    title: `${title} | Golden Cheat`,
    description,
    // Canonical + hreflang are set by the root layout via x-url header (server-side in initial HTML).
    // This avoids duplicate canonical tags in list pages.
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────

function formatToman(price: number, isFa: boolean): string {
  const rounded = Math.round(price);
  if (isFa) return rounded.toLocaleString("fa-IR");
  return rounded.toLocaleString("en-US");
}

function discountPercent(price: number, salePrice: number): number {
  if (!price || price <= 0) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

// ── Page ────────────────────────────────────────────────────────────────

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tag?: string; page?: string }>;
}) {
  const { lang } = await params;
  const { tag, page } = await searchParams;

  if (lang !== "fa" && lang !== "en") {
    notFound();
  }

  const isFa = lang === "fa";
  const allProducts = await getProducts(tag || null);

  // Pagination
  const pageSize = 12;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(allProducts.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = allProducts.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Texts
  const pageTitle = isFa ? "فروشگاه محصولات" : "PRODUCT STORE";
  const pageDesc = isFa
    ? "بهترین ابزارهای بازی را با کیفیت بالا و قیمت مناسب تجربه کنید"
    : "Experience the best gaming tools with high quality and fair pricing";
  const noProductsText = isFa ? "محصولی یافت نشد" : "No products found";
  const popularText = isFa ? "محبوب" : "POPULAR";
  const buyText = isFa ? "خرید" : "BUY";
  const tomanText = isFa ? "تومان" : "";
  const reviewsText = isFa ? "نظر" : "reviews";
  const filterTagText = isFa ? "فیلتر برچسب" : "Tag filter";
  const clearFilterText = isFa ? "حذف فیلتر" : "Clear filter";
  const showingText = isFa ? "نمایش" : "Showing";
  const ofText = isFa ? "از" : "of";
  const prevText = isFa ? "قبلی" : "Previous";
  const nextText = isFa ? "بعدی" : "Next";

  return (
    <main className="min-h-screen" style={{ fontFamily: "var(--font-fa)", backgroundColor: "#05080E" }}>
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Header */}
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

        {/* Tag filter indicator */}
        {tag && (
          <div className="mb-8 flex items-center justify-center gap-3">
            <span className="text-sm" style={{ color: "#888" }}>{filterTagText}:</span>
            <span
              className="px-3 py-1 text-sm font-semibold rounded-full"
              style={{ background: "rgba(255,215,0,0.15)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)" }}
            >
              #{tag}
            </span>
            <Link
              href={`/${lang}/products`}
              className="text-sm transition-colors hover:text-[#ff3366]"
              style={{ color: "#ff3366" }}
            >
              ✕ {clearFilterText}
            </Link>
          </div>
        )}

        {/* Count */}
        <p className="text-sm mb-8 text-center" style={{ color: "#666" }}>
          {showingText} {paginated.length} {ofText} {allProducts.length} {isFa ? "محصول" : "products"}
        </p>

        {/* Grid */}
        {paginated.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {paginated.map((product) => {
              const name = isFa ? product.nameFa : (product.nameEn || product.nameFa);
              const shortDesc = isFa ? product.shortDescFa : (product.shortDescEn || product.shortDescFa);
              const tags = isFa ? product.tagsFa : (product.tagsEn.length > 0 ? product.tagsEn : product.tagsFa);
              const productSlug = isFa ? product.slug : (product.slugEn || product.slug);
              const hasSale = product.salePrice != null && product.salePrice < product.price;
              const displayPrice = hasSale ? product.salePrice! : product.price;
              const discount = hasSale ? discountPercent(product.price, product.salePrice!) : 0;

              return (
                <Link
                  key={product.id}
                  href={`/${lang}/products/${productSlug}`}
                  className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(255,215,0,0.15)]"
                  style={{
                    background: "linear-gradient(135deg, rgba(20,20,20,0.8) 0%, rgba(11,11,11,0.6) 100%)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,215,0,0.12)",
                  }}
                >
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden">
                    {product.bannerImage || product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.bannerImage || product.imageUrl || ""}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #141414 0%, #1f1f1f 50%, #0B0B0B 100%)" }}
                      >
                        <span className="text-4xl opacity-20">🎮</span>
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                      {product.isPopular && (
                        <span
                          className="px-2.5 py-0.5 text-[10px] font-bold rounded-full"
                          style={{ background: "linear-gradient(135deg, #FFD700, #ffaa00)", color: "#0B0B0B" }}
                        >
                          {popularText}
                        </span>
                      )}
                      {hasSale && discount > 0 && (
                        <span
                          className="px-2.5 py-0.5 text-[10px] font-bold rounded-full"
                          style={{ background: "linear-gradient(135deg, #ff3366, #ff0044)", color: "#fff" }}
                        >
                          -{discount}%
                        </span>
                      )}
                    </div>

                    {/* Game badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full"
                        style={{ background: "rgba(0,240,255,0.15)", color: "#00f0ff", border: "1px solid rgba(0,240,255,0.3)" }}
                      >
                        {product.game}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h2
                      className="text-base font-bold mb-1.5 line-clamp-1 transition-colors duration-300 group-hover:text-[#FFD700]"
                      style={{ color: "#e0e0e0", fontFamily: "var(--font-fa)" }}
                    >
                      {name}
                    </h2>

                    {shortDesc && (
                      <p className="text-xs mb-3 line-clamp-2" style={{ color: "#777", fontFamily: "var(--font-fa)" }}>
                        {shortDesc}
                      </p>
                    )}

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1">
                        {tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 text-[10px] rounded-md"
                            style={{ background: "rgba(0,240,255,0.08)", color: "#00f0ff", border: "1px solid rgba(0,240,255,0.15)" }}
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      <svg className="w-3.5 h-3.5" fill="#FFD700" stroke="#FFD700" strokeWidth={1} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span className="text-[11px]" style={{ color: "#888" }}>
                        {product.rating.toFixed(1)} ({product.reviewsCount} {reviewsText})
                      </span>
                    </div>

                    {/* Price + CTA */}
                    <div className="flex items-center justify-between">
                      <div>
                        {hasSale && (
                          <span className="text-[11px] line-through block" style={{ color: "#555" }}>
                            {formatToman(product.price, isFa)} {tomanText}
                          </span>
                        )}
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black" style={{ fontFamily: "var(--font-display)", color: "#FFD700" }}>
                            {formatToman(displayPrice, isFa)}
                          </span>
                          {tomanText && <span className="text-[10px]" style={{ color: "#888" }}>{tomanText}</span>}
                        </div>
                      </div>
                      <span
                        className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all group-hover:scale-105"
                        style={{
                          background: "linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,170,0,0.15))",
                          color: "#FFD700",
                          border: "1px solid rgba(255,215,0,0.3)",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {buyText}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div
            className="text-center py-20 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(20,20,20,0.6) 0%, rgba(11,11,11,0.4) 100%)",
              border: "1px solid rgba(255,215,0,0.1)",
            }}
          >
            <p className="text-lg" style={{ color: "#666" }}>{noProductsText}</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            {safePage > 1 && (
              <Link
                href={`/${lang}/products?page=${safePage - 1}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`}
                className="px-4 py-2 rounded-lg text-sm transition-colors hover:text-[#FFD700]"
                style={{ background: "rgba(255,215,0,0.08)", color: "#888", border: "1px solid rgba(255,215,0,0.15)" }}
              >
                {prevText}
              </Link>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/${lang}/products?page=${p}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`}
                className="w-10 h-10 rounded-lg text-sm flex items-center justify-center transition-all"
                style={
                  p === safePage
                    ? { background: "linear-gradient(135deg, #FFD700, #ffaa00)", color: "#0B0B0B", fontWeight: "bold" }
                    : { background: "rgba(255,215,0,0.05)", color: "#888", border: "1px solid rgba(255,215,0,0.1)" }
                }
              >
                {p}
              </Link>
            ))}

            {safePage < totalPages && (
              <Link
                href={`/${lang}/products?page=${safePage + 1}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`}
                className="px-4 py-2 rounded-lg text-sm transition-colors hover:text-[#FFD700]"
                style={{ background: "rgba(255,215,0,0.08)", color: "#888", border: "1px solid rgba(255,215,0,0.15)" }}
              >
                {nextText}
              </Link>
            )}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
