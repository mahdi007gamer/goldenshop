import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Fetch a single product by either English slug or Persian slugFa
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const decoded = decodeURIComponent(slug);

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: decoded },
        ],
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Product not found" } },
        { status: 404 }
      );
    }

    // Parse JSON fields for the response
    const parseJson = (val: string | null) => {
      if (!val) return [];
      try {
        const p = JSON.parse(val);
        return Array.isArray(p) ? p : [];
      } catch {
        return [];
      }
    };

    const result = {
      ...product,
      features: parseJson(product.features as string),
      featuresFa: parseJson(product.featuresFa as string),
      featuresEn: parseJson((product as Record<string, unknown>).featuresEn as string),
      tags: parseJson(product.tags as string),
      galleryImages: parseJson(product.galleryImages as string),
      galleryItems: parseJson(product.galleryItems as string),
      featuresDetail: parseJson(product.featuresDetail as string),
      metaKeywords: parseJson(product.metaKeywords as string),
      metaKeywordsFa: parseJson(product.metaKeywordsFa as string),
      metaKeywordsEn: parseJson((product as Record<string, unknown>).metaKeywordsEn as string),
    };

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("Product by-slug error:", err);
    return NextResponse.json(
      { success: false, error: { code: "PRODUCT_ERROR", message: "Failed to load product" } },
      { status: 500 }
    );
  }
}
