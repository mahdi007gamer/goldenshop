import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany({
    select: { slug: true, galleryItems: true, galleryImages: true, imageUrl: true, bannerImage: true },
  });
  for (const p of products) {
    console.log("\n" + p.slug);
    console.log("  galleryItems raw:", p.galleryItems?.substring(0, 200));
    console.log("  galleryImages raw:", p.galleryImages?.substring(0, 200));
    console.log("  imageUrl:", p.imageUrl);
    console.log("  bannerImage:", p.bannerImage);
    // Try parsing galleryItems
    try {
      const parsed = JSON.parse(p.galleryItems || "[]");
      console.log("  galleryItems parsed:", JSON.stringify(parsed).substring(0, 200));
    } catch (e) {
      console.log("  galleryItems PARSE ERROR:", e);
    }
  }
}
main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
