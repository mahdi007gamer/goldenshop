import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeString, sanitizeRichText } from "@/lib/auth-utils";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Product not found" } }, { status: 404 });

    const parseJson = (val: unknown) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try { const p = JSON.parse(val as string); return Array.isArray(p) ? p : []; }
      catch { return []; }
    };

    const p = product as Record<string, unknown>;
    const parsed = {
      ...product,
      // Parse JSON array fields
      features: parseJson(product.features),
      featuresFa: parseJson(product.featuresFa),
      featuresEn: parseJson(p.featuresEn),
      tags: parseJson(product.tags),
      tagsEn: parseJson(p.tagsEn),
      galleryImages: parseJson(product.galleryImages),
      galleryItems: parseJson(p.galleryItems),
      featuresDetail: parseJson(p.featuresDetail),
      metaKeywords: parseJson(product.metaKeywords),
      metaKeywordsFa: parseJson(product.metaKeywordsFa),
      metaKeywordsEn: parseJson(p.metaKeywordsEn),
      // Ensure all text fields are present (even if null) so edit form can pre-fill
      subtitle: product.subtitle ?? p.subtitle ?? "",
      subtitleEn: product.subtitleEn ?? p.subtitleEn ?? "",
      highlightTagFa: p.highlightTagFa ?? "",
      highlightTagEn: p.highlightTagEn ?? "",
      nameFa: product.nameFa ?? "",
      nameEn: product.nameEn ?? "",
      slugEn: product.slugEn ?? "",
      categoryEn: product.categoryEn ?? "",
      descriptionFa: product.descriptionFa ?? "",
      descriptionEn: product.descriptionEn ?? "",
      shortDesc: product.shortDesc ?? "",
      shortDescFa: product.shortDescFa ?? "",
      shortDescEn: product.shortDescEn ?? "",
      bannerImage: product.bannerImage ?? "",
      videoUrl: product.videoUrl ?? "",
      audioUrl: product.audioUrl ?? "",
      imageUrl: product.imageUrl ?? "",
      // SEO fields
      metaTitle: product.metaTitle ?? "",
      metaTitleFa: p.metaTitleFa ?? "",
      metaTitleEn: p.metaTitleEn ?? "",
      metaDescription: product.metaDescription ?? "",
      metaDescriptionFa: p.metaDescriptionFa ?? "",
      metaDescriptionEn: p.metaDescriptionEn ?? "",
      focusKeyphrase: product.focusKeyphrase ?? "",
      focusKeyphraseFa: p.focusKeyphraseFa ?? "",
      focusKeyphraseEn: p.focusKeyphraseEn ?? "",
      ogTitle: p.ogTitle ?? "",
      ogDescription: p.ogDescription ?? "",
      ogTitleEn: p.ogTitleEn ?? "",
      ogDescriptionEn: p.ogDescriptionEn ?? "",
      ogImage: p.ogImage ?? "",
      twitterTitle: p.twitterTitle ?? "",
      twitterDescription: p.twitterDescription ?? "",
      twitterTitleEn: p.twitterTitleEn ?? "",
      twitterDescriptionEn: p.twitterDescriptionEn ?? "",
      twitterImage: p.twitterImage ?? "",
      canonicalUrl: p.canonicalUrl ?? "",
      schemaType: p.schemaType ?? "Product",
    };
    return NextResponse.json({ success: true, data: parsed });
  } catch {
    return NextResponse.json({ success: false, error: { code: "PRODUCT_ERROR", message: "Failed to load product" } }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};
    for (const key of ["name", "nameFa", "nameEn", "slug", "slugEn", "game", "category", "categoryEn", "shortDesc", "shortDescFa", "shortDescEn", "subtitle", "subtitleEn", "highlightTagFa", "highlightTagEn", "bypassRate", "updateStatus", "imageUrl", "bannerImage", "videoUrl", "audioUrl", "status", "metaTitle", "metaTitleFa", "metaTitleEn", "metaDescription", "metaDescriptionFa", "metaDescriptionEn", "focusKeyphrase", "focusKeyphraseFa", "focusKeyphraseEn", "ogTitle", "ogDescription", "ogTitleEn", "ogDescriptionEn", "twitterTitle", "twitterDescription", "twitterTitleEn", "twitterDescriptionEn", "twitterImage", "canonicalUrl", "schemaType"]) {
      if (body[key] !== undefined) {
        data[key] = sanitizeString(body[key], 500);
      }
    }
    for (const key of ["description", "descriptionFa", "descriptionEn", "longDescription"]) {
      if (body[key] !== undefined) {
        data[key] = sanitizeRichText(body[key], key === "longDescription" ? 20000 : 5000);
      }
    }
    const arrayFields = ["features", "featuresFa", "featuresEn", "galleryImages", "galleryItems", "featuresDetail", "metaKeywords", "metaKeywordsFa", "metaKeywordsEn"];
    for (const key of arrayFields) {
      if (body[key] !== undefined) {
        data[key] = Array.isArray(body[key]) ? JSON.stringify(body[key]) : sanitizeString(body[key], 10000);
      }
    }
    const numericFields = ["price", "salePrice", "priceDaily", "priceWeekly", "priceMonthly", "priceLifetime"];
    for (const key of numericFields) {
      if (body[key] !== undefined) data[key] = body[key] ? parseFloat(body[key]) : null;
    }
    if (body.isPopular !== undefined) data.isPopular = Boolean(body.isPopular);
    console.log("[PUT] id:", id, "data keys:", Object.keys(data));
    const product = await prisma.product.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: product });
  } catch (err) {
    console.error("Update product error:", err);
    return NextResponse.json({ success: false, error: { code: "UPDATE_PRODUCT_ERROR", message: "Failed to update product" } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};
    for (const key of ["name", "nameFa", "nameEn", "slug", "slugEn", "game", "category", "categoryEn", "shortDesc", "shortDescFa", "shortDescEn", "subtitle", "subtitleEn", "highlightTagFa", "highlightTagEn", "bypassRate", "updateStatus", "imageUrl", "bannerImage", "videoUrl", "audioUrl", "status", "metaTitle", "metaTitleFa", "metaTitleEn", "metaDescription", "metaDescriptionFa", "metaDescriptionEn", "focusKeyphrase", "focusKeyphraseFa", "focusKeyphraseEn", "ogTitle", "ogDescription", "ogTitleEn", "ogDescriptionEn", "twitterTitle", "twitterDescription", "twitterTitleEn", "twitterDescriptionEn", "twitterImage", "canonicalUrl", "schemaType"]) {
      if (body[key] !== undefined) {
        data[key] = sanitizeString(body[key], 500);
      }
    }
    for (const key of ["description", "descriptionFa", "descriptionEn", "longDescription"]) {
      if (body[key] !== undefined) {
        data[key] = sanitizeRichText(body[key], key === "longDescription" ? 20000 : 5000);
      }
    }
    const arrayFields = ["features", "featuresFa", "featuresEn", "galleryImages", "galleryItems", "featuresDetail", "metaKeywords", "metaKeywordsFa", "metaKeywordsEn"];
    for (const key of arrayFields) {
      if (body[key] !== undefined) {
        data[key] = Array.isArray(body[key]) ? JSON.stringify(body[key]) : sanitizeString(body[key], 10000);
      }
    }
    const numericFields = ["price", "salePrice", "priceDaily", "priceWeekly", "priceMonthly", "priceLifetime"];
    for (const key of numericFields) {
      if (body[key] !== undefined) data[key] = body[key] ? parseFloat(body[key]) : null;
    }
    if (body.isPopular !== undefined) data.isPopular = Boolean(body.isPopular);
    console.log("[PATCH] id:", id, "data keys:", Object.keys(data));
    const product = await prisma.product.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: product });
  } catch (err) {
    console.error("[PATCH] error:", err);
    return NextResponse.json({ success: false, error: { code: "UPDATE_PRODUCT_ERROR", message: "Failed to update product" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, data: { message: "Product deleted" } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "DELETE_PRODUCT_ERROR", message: "Failed to delete product" } }, { status: 500 });
  }
}
