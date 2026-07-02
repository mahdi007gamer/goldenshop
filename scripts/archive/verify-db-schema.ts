import { prisma } from "../src/lib/prisma";

async function main() {
  try {
    const product = await prisma.product.findFirst({
      select: {
        id: true, name: true, slug: true,
        subtitle: true, subtitleEn: true,
        highlightTagFa: true, highlightTagEn: true,
      },
    });
    if (!product) {
      console.log("No products in DB");
      process.exit(1);
    }
    console.log("=== Product fields check ===");
    console.log("Product ID:", product.id);
    console.log("Name:", product.name);
    console.log("subtitle:", JSON.stringify(product.subtitle));
    console.log("subtitleEn:", JSON.stringify(product.subtitleEn));
    console.log("highlightTagFa:", JSON.stringify((product as Record<string, unknown>).highlightTagFa));
    console.log("highlightTagEn:", JSON.stringify((product as Record<string, unknown>).highlightTagEn));
    console.log("");
    console.log("SUCCESS: DB has all required columns");
    process.exit(0);
  } catch (err) {
    console.error("ERROR:", err);
    console.error("");
    console.error("DB likely MISSING highlightTagFa/En columns.");
    console.error("Run: npx prisma db push");
    process.exit(1);
  }
}

main();
