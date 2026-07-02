import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const product = await prisma.product.findUnique({ where: { slug: "aegis-codex" } });
  if (!product) { console.log("not found"); return; }

  const parseJson = (val: string) => {
    try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; }
    catch { return []; }
  };

  const parsed = {
    ...product,
    features: parseJson(product.features as string),
    featuresFa: parseJson(product.featuresFa as string),
    galleryItems: parseJson(product.galleryItems as string),
    featuresDetail: parseJson(product.featuresDetail as string),
  };

  console.log("galleryItems:", JSON.stringify(parsed.galleryItems, null, 2));
  console.log("galleryImages (raw):", product.galleryImages);
  console.log("galleryItems length:", parsed.galleryItems.length);
  console.log("First item:", parsed.galleryItems[0]);
}
main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
