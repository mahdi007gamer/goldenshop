import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products/:id — single product by id or slug
// Also supports ?lang=fa|en for bilingual content selection
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lang = request.nextUrl.searchParams.get("lang") || "fa";

    // Decode slug (handles percent-encoded non-ASCII slugs)
    const decodedId = decodeURIComponent(id);

    // Try id first, then slug, then slugEn
    let product = await prisma.product.findUnique({ where: { id: decodedId } });
    if (!product) {
      product = await prisma.product.findUnique({ where: { slug: decodedId } });
    }
    if (!product) {
      product = await prisma.product.findFirst({ where: { slugEn: decodedId } });
    }

    if (!product || product.status !== "active") {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Product not found" } },
        { status: 404 }
      );
    }

    // Parse JSON string fields
    const parseJson = (val: string | null | undefined): string[] => {
      if (!val) return [];
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    const isFa = lang === "fa";
    const galleryImages = parseJson(product.galleryImages as string | null);
    const galleryItems = parseJson(product.galleryItems as string | null);
    const features = isFa
      ? parseJson(product.featuresFa as string | null)
      : parseJson(product.featuresEn as string | null);
    const tags = isFa
      ? parseJson(product.tags as string | null)
      : parseJson(product.tagsEn as string | null);
    const metaKeywords = isFa
      ? parseJson(product.metaKeywordsFa as string | null)
      : parseJson(product.metaKeywordsEn as string | null);

    // Build bilingual response
    const response = {
      id: product.id,
      name: isFa ? product.name : (product.nameEn || product.name),
      nameFa: product.name,
      nameEn: product.nameEn,
      slug: product.slug,
      slugEn: product.slugEn,
      game: product.game,
      category: product.category,
      categoryEn: product.categoryEn,
      price: product.price,
      salePrice: product.salePrice,
      priceDaily: product.priceDaily,
      priceWeekly: product.priceWeekly,
      priceMonthly: product.priceMonthly,
      priceLifetime: product.priceLifetime,
      rating: product.rating,
      reviewsCount: product.reviewsCount,
      description: isFa ? product.description : (product.descriptionEn || product.description),
      descriptionFa: product.description,
      descriptionEn: product.descriptionEn,
      shortDesc: isFa ? (product.shortDesc || "") : (product.shortDescEn || product.shortDesc || ""),
      shortDescFa: product.shortDesc,
      shortDescEn: product.shortDescEn,
      longDescription: isFa ? (product.longDescription || "") : (product.longDescriptionEn || product.longDescription || ""),
      features,
      featuresFa: parseJson(product.featuresFa as string | null),
      featuresEn: parseJson(product.featuresEn as string | null),
      tags,
      tagsFa: parseJson(product.tags as string | null),
      tagsEn: parseJson(product.tagsEn as string | null),
      isPopular: product.isPopular,
      bypassRate: product.bypassRate,
      updateStatus: product.updateStatus,
      imageUrl: product.imageUrl,
      bannerImage: product.bannerImage,
      galleryImages,
      galleryItems,
      videoUrl: product.videoUrl,
      audioUrl: product.audioUrl,
      // SEO fields
      metaTitle: isFa ? (product.metaTitle || product.name) : (product.metaTitleEn || product.metaTitle || product.nameEn || product.name),
      metaTitleFa: product.metaTitle || product.name,
      metaTitleEn: product.metaTitleEn || product.metaTitle || product.nameEn || product.name,
      metaDescription: isFa
        ? (product.metaDescription || product.shortDesc || product.description.substring(0, 160))
        : (product.metaDescriptionEn || product.metaDescription || product.shortDescEn || (product.descriptionEn || product.description).substring(0, 160)),
      metaDescriptionFa: product.metaDescription || product.shortDesc || product.description.substring(0, 160),
      metaDescriptionEn: product.metaDescriptionEn || product.metaDescription || product.shortDescEn || (product.descriptionEn || product.description).substring(0, 160),
      focusKeyphrase: isFa ? (product.focusKeyphrase || "") : (product.focusKeyphraseEn || product.focusKeyphrase || ""),
      focusKeyphraseEn: product.focusKeyphraseEn,
      metaKeywords,
      metaKeywordsEn: parseJson(product.metaKeywordsEn as string | null),
      ogTitle: isFa ? (product.ogTitle || product.metaTitle || product.name) : (product.ogTitleEn || product.ogTitle || product.metaTitleEn || product.name),
      ogTitleEn: product.ogTitleEn,
      ogDescription: isFa ? (product.ogDescription || product.metaDescription || "") : (product.ogDescriptionEn || product.ogDescription || product.metaDescriptionEn || ""),
      ogDescriptionEn: product.ogDescriptionEn,
      ogImage: product.ogImage || product.imageUrl || product.bannerImage || undefined,
      twitterTitle: isFa ? (product.twitterTitle || product.ogTitle || product.metaTitle || product.name) : (product.twitterTitleEn || product.twitterTitle || product.ogTitleEn || product.metaTitleEn || product.name),
      twitterTitleEn: product.twitterTitleEn,
      twitterDescription: isFa ? (product.twitterDescription || product.ogDescription || product.metaDescription || "") : (product.twitterDescriptionEn || product.twitterDescription || product.ogDescriptionEn || product.metaDescriptionEn || ""),
      twitterDescriptionEn: product.twitterDescriptionEn,
      twitterImage: product.twitterImage || product.ogImage || product.imageUrl || undefined,
      canonicalUrl: product.canonicalUrl || undefined,
      schemaType: product.schemaType || "Product",
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (err) {
    console.error("[GET /api/products/:id]", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Server error" } },
      { status: 500 }
    );
  }
}
