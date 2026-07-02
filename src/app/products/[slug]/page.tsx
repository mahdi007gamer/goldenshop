import { redirect } from "next/navigation";

/**
 * Redirect legacy /products/[slug] → /fa/products/[slug] (301).
 *
 * The FA product page now lives under /fa/products/[slug] via the [lang] route group.
 * This file preserves backward compatibility for any existing links/bookmarks.
 */
export default async function LegacyProductRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/fa/products/${encodeURIComponent(slug)}`);
}
