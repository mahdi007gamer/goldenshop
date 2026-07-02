import { notFound } from "next/navigation";

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  // Validate lang parameter
  const lang = params.then((p) => p.lang);
  // We can't await here in sync function, so we'll validate in each page
  return <>{children}</>;
}
