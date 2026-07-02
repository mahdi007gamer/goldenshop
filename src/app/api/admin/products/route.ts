import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, sanitizeString, sanitizeRichText, parsePositiveInt } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const search = sanitizeString(searchParams.get("search"));
    const game = sanitizeString(searchParams.get("game"));
    const category = sanitizeString(searchParams.get("category"));
    const status = sanitizeString(searchParams.get("status"));
    const take = parsePositiveInt(searchParams.get("take"), 50);
    const skip = parsePositiveInt(searchParams.get("skip"), 0);
    const where: Record<string, unknown> = {};
    if (search) where.OR = [{ name: { contains: search } }, { slug: { contains: search } }, { game: { contains: search } }];
    if (game) where.game = game;
    if (category) where.category = category;
    if (status) where.status = status;
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy: { createdAt: "desc" }, take, skip }),
      prisma.product.count({ where }),
    ]);
    return NextResponse.json({ success: true, data: { products, total } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "PRODUCTS_ERROR", message: "Failed to load products" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const name = sanitizeString(body.name, 200);
    const slug = sanitizeString(body.slug, 200) || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const game = sanitizeString(body.game, 100);
    const category = sanitizeString(body.category, 100);
    const price = body.price !== undefined ? parseFloat(body.price) : undefined;
    if (!name || !game || !category || price === undefined || isNaN(price)) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Name, game, category, and price are required" } }, { status: 400 });
    }
    const product = await prisma.product.create({
      data: {
        name,
        nameFa: body.nameFa ? sanitizeString(body.nameFa, 200) : null,
        nameEn: body.nameEn ? sanitizeString(body.nameEn, 200) : null,
        slug,
        slugEn: body.slugEn ? sanitizeString(body.slugEn, 200) : null,
        game,
        category,
        categoryEn: body.categoryEn ? sanitizeString(body.categoryEn, 100) : null,
        price,
        salePrice: body.salePrice ? parseFloat(body.salePrice) : null,
        priceDaily: body.priceDaily ? parseFloat(body.priceDaily) : null,
        priceWeekly: body.priceWeekly ? parseFloat(body.priceWeekly) : null,
        priceMonthly: body.priceMonthly ? parseFloat(body.priceMonthly) : null,
        priceLifetime: body.priceLifetime ? parseFloat(body.priceLifetime) : null,
        description: sanitizeRichText(body.description, 5000) || "",
        descriptionFa: body.descriptionFa ? sanitizeRichText(body.descriptionFa, 5000) : null,
        descriptionEn: body.descriptionEn ? sanitizeRichText(body.descriptionEn, 5000) : null,
        shortDesc: body.shortDesc ? sanitizeString(body.shortDesc, 500) : null,
        shortDescFa: body.shortDescFa ? sanitizeString(body.shortDescFa, 500) : null,
        shortDescEn: body.shortDescEn ? sanitizeString(body.shortDescEn, 500) : null,
        subtitle: body.subtitle ? sanitizeString(body.subtitle, 200) : null,
        subtitleEn: body.subtitleEn ? sanitizeString(body.subtitleEn, 200) : null,
        highlightTagFa: body.highlightTagFa ? sanitizeString(body.highlightTagFa, 100) : null,
        highlightTagEn: body.highlightTagEn ? sanitizeString(body.highlightTagEn, 100) : null,
        longDescription: body.longDescription ? sanitizeRichText(body.longDescription, 20000) : null,
        features: Array.isArray(body.features) ? JSON.stringify(body.features) : "[]",
        featuresFa: Array.isArray(body.featuresFa) ? JSON.stringify(body.featuresFa) : "[]",
        featuresEn: Array.isArray(body.featuresEn) ? JSON.stringify(body.featuresEn) : "[]",
        galleryImages: Array.isArray(body.galleryImages) ? JSON.stringify(body.galleryImages) : "[]",
        galleryItems: Array.isArray(body.galleryItems) ? JSON.stringify(body.galleryItems) : "[]",
        featuresDetail: Array.isArray(body.featuresDetail) ? JSON.stringify(body.featuresDetail) : "[]",
        bypassRate: sanitizeString(body.bypassRate, 50) || "100%",
        updateStatus: sanitizeString(body.updateStatus, 50) || "Undetected",
        imageUrl: sanitizeString(body.imageUrl, 500) || null,
        bannerImage: sanitizeString(body.bannerImage, 500) || null,
        videoUrl: sanitizeString(body.videoUrl, 500) || null,
        audioUrl: sanitizeString(body.audioUrl, 500) || null,
        status: sanitizeString(body.status, 50) || "active",
        rating: 0,
        reviewsCount: 0,
        isPopular: false,
        metaTitle: body.metaTitle ? sanitizeString(body.metaTitle, 200) : null,
        metaTitleFa: body.metaTitleFa ? sanitizeString(body.metaTitleFa, 200) : null,
        metaTitleEn: body.metaTitleEn ? sanitizeString(body.metaTitleEn, 200) : null,
        metaDescription: body.metaDescription ? sanitizeString(body.metaDescription, 500) : null,
        metaDescriptionFa: body.metaDescriptionFa ? sanitizeString(body.metaDescriptionFa, 500) : null,
        metaDescriptionEn: body.metaDescriptionEn ? sanitizeString(body.metaDescriptionEn, 500) : null,
        focusKeyphrase: body.focusKeyphrase ? sanitizeString(body.focusKeyphrase, 200) : null,
        focusKeyphraseFa: body.focusKeyphraseFa ? sanitizeString(body.focusKeyphraseFa, 200) : null,
        focusKeyphraseEn: body.focusKeyphraseEn ? sanitizeString(body.focusKeyphraseEn, 200) : null,
        canonicalUrl: body.canonicalUrl ? sanitizeString(body.canonicalUrl, 500) : null,
        ogImage: body.ogImage ? sanitizeString(body.ogImage, 500) : null,
        schemaType: sanitizeString(body.schemaType, 50) || "Product",
        metaKeywords: body.metaKeywords ? (typeof body.metaKeywords === "string" ? body.metaKeywords : JSON.stringify(body.metaKeywords)) : "[]",
        metaKeywordsFa: body.metaKeywordsFa ? (typeof body.metaKeywordsFa === "string" ? body.metaKeywordsFa : JSON.stringify(body.metaKeywordsFa)) : "[]",
        metaKeywordsEn: body.metaKeywordsEn ? (typeof body.metaKeywordsEn === "string" ? body.metaKeywordsEn : JSON.stringify(body.metaKeywordsEn)) : "[]",
        ogTitle: body.ogTitle ? sanitizeString(body.ogTitle, 200) : null,
        ogDescription: body.ogDescription ? sanitizeString(body.ogDescription, 500) : null,
        ogTitleEn: body.ogTitleEn ? sanitizeString(body.ogTitleEn, 200) : null,
        ogDescriptionEn: body.ogDescriptionEn ? sanitizeString(body.ogDescriptionEn, 500) : null,
        twitterTitle: body.twitterTitle ? sanitizeString(body.twitterTitle, 200) : null,
        twitterDescription: body.twitterDescription ? sanitizeString(body.twitterDescription, 500) : null,
        twitterTitleEn: body.twitterTitleEn ? sanitizeString(body.twitterTitleEn, 200) : null,
        twitterDescriptionEn: body.twitterDescriptionEn ? sanitizeString(body.twitterDescriptionEn, 500) : null,
        twitterImage: body.twitterImage ? sanitizeString(body.twitterImage, 500) : null,
      },
    });
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (err) {
    console.error("Create product error:", err);
    return NextResponse.json({ success: false, error: { code: "CREATE_PRODUCT_ERROR", message: "Failed to create product" } }, { status: 500 });
  }
}

// PATCH — admin update (the admin form currently sends PUT; we accept PATCH too)
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const id = sanitizeString(searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Product id is required" } }, { status: 400 });
    }
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Product not found" } }, { status: 404 });
    }
    const body = await request.json();
    const name = body.name !== undefined ? sanitizeString(body.name, 200) : existing.name;
    const slug = body.slug !== undefined
      ? sanitizeString(body.slug, 200)
      : body.name
        ? sanitizeString(body.name, 200).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
        : existing.slug;
    const updateData: Record<string, unknown> = {
      name,
      nameFa: body.nameFa !== undefined ? (body.nameFa ? sanitizeString(body.nameFa, 200) : null) : undefined,
      nameEn: body.nameEn !== undefined ? (body.nameEn ? sanitizeString(body.nameEn, 200) : null) : undefined,
      slug,
      slugEn: body.slugEn !== undefined ? (body.slugEn ? sanitizeString(body.slugEn, 200) : null) : undefined,
      game: body.game !== undefined ? sanitizeString(body.game, 100) : undefined,
      category: body.category !== undefined ? sanitizeString(body.category, 100) : undefined,
      categoryEn: body.categoryEn !== undefined ? (body.categoryEn ? sanitizeString(body.categoryEn, 100) : null) : undefined,
      salePrice: body.salePrice !== undefined ? (body.salePrice ? parseFloat(body.salePrice) : null) : undefined,
      priceDaily: body.priceDaily !== undefined ? (body.priceDaily ? parseFloat(body.priceDaily) : null) : undefined,
      priceWeekly: body.priceWeekly !== undefined ? (body.priceWeekly ? parseFloat(body.priceWeekly) : null) : undefined,
      priceMonthly: body.priceMonthly !== undefined ? (body.priceMonthly ? parseFloat(body.priceMonthly) : null) : undefined,
      priceLifetime: body.priceLifetime !== undefined ? (body.priceLifetime ? parseFloat(body.priceLifetime) : null) : undefined,
      description: body.description !== undefined ? sanitizeRichText(body.description, 5000) : undefined,
      descriptionFa: body.descriptionFa !== undefined ? (body.descriptionFa ? sanitizeRichText(body.descriptionFa, 5000) : null) : undefined,
      descriptionEn: body.descriptionEn !== undefined ? (body.descriptionEn ? sanitizeRichText(body.descriptionEn, 5000) : null) : undefined,
      shortDesc: body.shortDesc !== undefined ? (body.shortDesc ? sanitizeString(body.shortDesc, 500) : null) : undefined,
      shortDescFa: body.shortDescFa !== undefined ? (body.shortDescFa ? sanitizeString(body.shortDescFa, 500) : null) : undefined,
      shortDescEn: body.shortDescEn !== undefined ? (body.shortDescEn ? sanitizeString(body.shortDescEn, 500) : null) : undefined,
      subtitle: body.subtitle !== undefined ? (body.subtitle ? sanitizeString(body.subtitle, 200) : null) : undefined,
      subtitleEn: body.subtitleEn !== undefined ? (body.subtitleEn ? sanitizeString(body.subtitleEn, 200) : null) : undefined,
      highlightTagFa: body.highlightTagFa !== undefined ? (body.highlightTagFa ? sanitizeString(body.highlightTagFa, 100) : null) : undefined,
      highlightTagEn: body.highlightTagEn !== undefined ? (body.highlightTagEn ? sanitizeString(body.highlightTagEn, 100) : null) : undefined,
      longDescription: body.longDescription !== undefined ? (body.longDescription ? sanitizeRichText(body.longDescription, 20000) : null) : undefined,
      features: body.features !== undefined ? (Array.isArray(body.features) ? JSON.stringify(body.features) : typeof body.features === "string" ? JSON.stringify(body.features.split("\n").filter(Boolean)) : undefined) : undefined,
      featuresFa: body.featuresFa !== undefined ? (Array.isArray(body.featuresFa) ? JSON.stringify(body.featuresFa) : typeof body.featuresFa === "string" ? JSON.stringify(body.featuresFa.split("\n").filter(Boolean)) : undefined) : undefined,
      featuresEn: body.featuresEn !== undefined ? (Array.isArray(body.featuresEn) ? JSON.stringify(body.featuresEn) : typeof body.featuresEn === "string" ? JSON.stringify(body.featuresEn.split("\n").filter(Boolean)) : undefined) : undefined,
      galleryImages: body.galleryImages !== undefined ? (Array.isArray(body.galleryImages) ? JSON.stringify(body.galleryImages) : undefined) : undefined,
      galleryItems: body.galleryItems !== undefined ? (Array.isArray(body.galleryItems) ? JSON.stringify(body.galleryItems) : undefined) : undefined,
      featuresDetail: body.featuresDetail !== undefined ? (Array.isArray(body.featuresDetail) ? JSON.stringify(body.featuresDetail) : undefined) : undefined,
      bypassRate: body.bypassRate !== undefined ? sanitizeString(body.bypassRate, 50) : undefined,
      updateStatus: body.updateStatus !== undefined ? sanitizeString(body.updateStatus, 50) : undefined,
      imageUrl: body.imageUrl !== undefined ? (sanitizeString(body.imageUrl, 500) || null) : undefined,
      bannerImage: body.bannerImage !== undefined ? (sanitizeString(body.bannerImage, 500) || null) : undefined,
      videoUrl: body.videoUrl !== undefined ? (sanitizeString(body.videoUrl, 500) || null) : undefined,
      audioUrl: body.audioUrl !== undefined ? (sanitizeString(body.audioUrl, 500) || null) : undefined,
      status: body.status !== undefined ? sanitizeString(body.status, 50) : undefined,
      rating: body.rating !== undefined ? parseFloat(body.rating) : undefined,
      reviewsCount: body.reviewsCount !== undefined ? parseInt(body.reviewsCount) : undefined,
      isPopular: body.isPopular !== undefined ? !!body.isPopular : undefined,
      metaTitle: body.metaTitle !== undefined ? (body.metaTitle ? sanitizeString(body.metaTitle, 200) : null) : undefined,
      metaTitleFa: body.metaTitleFa !== undefined ? (body.metaTitleFa ? sanitizeString(body.metaTitleFa, 200) : null) : undefined,
      metaTitleEn: body.metaTitleEn !== undefined ? (body.metaTitleEn ? sanitizeString(body.metaTitleEn, 200) : null) : undefined,
      metaDescription: body.metaDescription !== undefined ? (body.metaDescription ? sanitizeString(body.metaDescription, 500) : null) : undefined,
      metaDescriptionFa: body.metaDescriptionFa !== undefined ? (body.metaDescriptionFa ? sanitizeString(body.metaDescriptionFa, 500) : null) : undefined,
      metaDescriptionEn: body.metaDescriptionEn !== undefined ? (body.metaDescriptionEn ? sanitizeString(body.metaDescriptionEn, 500) : null) : undefined,
      focusKeyphrase: body.focusKeyphrase !== undefined ? (body.focusKeyphrase ? sanitizeString(body.focusKeyphrase, 200) : null) : undefined,
      focusKeyphraseFa: body.focusKeyphraseFa !== undefined ? (body.focusKeyphraseFa ? sanitizeString(body.focusKeyphraseFa, 200) : null) : undefined,
      focusKeyphraseEn: body.focusKeyphraseEn !== undefined ? (body.focusKeyphraseEn ? sanitizeString(body.focusKeyphraseEn, 200) : null) : undefined,
      canonicalUrl: body.canonicalUrl !== undefined ? (body.canonicalUrl ? sanitizeString(body.canonicalUrl, 500) : null) : undefined,
      ogImage: body.ogImage !== undefined ? (body.ogImage ? sanitizeString(body.ogImage, 500) : null) : undefined,
      schemaType: body.schemaType !== undefined ? sanitizeString(body.schemaType, 50) : undefined,
      metaKeywords: body.metaKeywords !== undefined ? (typeof body.metaKeywords === "string" ? body.metaKeywords : JSON.stringify(body.metaKeywords)) : undefined,
      metaKeywordsFa: body.metaKeywordsFa !== undefined ? (typeof body.metaKeywordsFa === "string" ? body.metaKeywordsFa : JSON.stringify(body.metaKeywordsFa)) : undefined,
      metaKeywordsEn: body.metaKeywordsEn !== undefined ? (typeof body.metaKeywordsEn === "string" ? body.metaKeywordsEn : JSON.stringify(body.metaKeywordsEn)) : undefined,
      ogTitle: body.ogTitle !== undefined ? (body.ogTitle ? sanitizeString(body.ogTitle, 200) : null) : undefined,
      ogDescription: body.ogDescription !== undefined ? (body.ogDescription ? sanitizeString(body.ogDescription, 500) : null) : undefined,
      ogTitleEn: body.ogTitleEn !== undefined ? (body.ogTitleEn ? sanitizeString(body.ogTitleEn, 200) : null) : undefined,
      ogDescriptionEn: body.ogDescriptionEn !== undefined ? (body.ogDescriptionEn ? sanitizeString(body.ogDescriptionEn, 500) : null) : undefined,
      twitterTitle: body.twitterTitle !== undefined ? (body.twitterTitle ? sanitizeString(body.twitterTitle, 200) : null) : undefined,
      twitterDescription: body.twitterDescription !== undefined ? (body.twitterDescription ? sanitizeString(body.twitterDescription, 500) : null) : undefined,
      twitterTitleEn: body.twitterTitleEn !== undefined ? (body.twitterTitleEn ? sanitizeString(body.twitterTitleEn, 200) : null) : undefined,
      twitterDescriptionEn: body.twitterDescriptionEn !== undefined ? (body.twitterDescriptionEn ? sanitizeString(body.twitterDescriptionEn, 500) : null) : undefined,
      twitterImage: body.twitterImage !== undefined ? (body.twitterImage ? sanitizeString(body.twitterImage, 500) : null) : undefined,
    };
    if (body.price !== undefined) {
      updateData.price = parseFloat(body.price);
    }
    // Remove undefined keys
    for (const key of Object.keys(updateData)) {
      if (updateData[key] === undefined) delete updateData[key];
    }
    const updated = await prisma.product.update({ where: { id }, data: updateData });
    // Parse features for the response
    const parsed = {
      ...updated,
      features: (() => { try { return JSON.parse(updated.features as string); } catch { return []; } })(),
    };
    return NextResponse.json({ success: true, data: parsed });
  } catch (err) {
    console.error("Update product error:", err);
    return NextResponse.json({ success: false, error: { code: "UPDATE_PRODUCT_ERROR", message: "Failed to update product" } }, { status: 500 });
  }
}

// DELETE — admin delete
export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const id = sanitizeString(searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Product id is required" } }, { status: 400 });
    }
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Product not found" } }, { status: 404 });
    }
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("Delete product error:", err);
    return NextResponse.json({ success: false, error: { code: "DELETE_PRODUCT_ERROR", message: "Failed to delete product" } }, { status: 500 });
  }
}
