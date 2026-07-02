import { redirect } from "next/navigation";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Redirect to default locale (fa) — the [lang]/blog/[slug] route handles both FA and EN
  redirect(`/fa/blog/${encodeURIComponent(slug)}`);
}
