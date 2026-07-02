import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/articles/slug-map?slug=<slug>
 *
 * Returns the counterpart slug (fa/en) for a given article slug.
 * Used by the LanguageSwitcher to build the correct URL when toggling
 * languages on an article page.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawSlug = searchParams.get("slug");
  if (!rawSlug) {
    return NextResponse.json({ error: "slug query param required" }, { status: 400 });
  }

  const slug = decodeURIComponent(rawSlug);

  const article = await prisma.article.findFirst({
    where: {
      status: "published",
      OR: [{ slug }, { slugEn: slug }],
    },
    select: { slug: true, slugEn: true },
  });

  if (!article) {
    return NextResponse.json({ fa: null, en: null });
  }

  return NextResponse.json({
    fa: article.slug,
    en: article.slugEn || article.slug,
  });
}
