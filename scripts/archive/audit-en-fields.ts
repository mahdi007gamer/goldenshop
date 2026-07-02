import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      nameEn: true,
      shortDescEn: true,
      descriptionEn: true,
      featuresEn: true,
      longDescriptionEn: true,
      categoryEn: true,
      tagsEn: true,
      metaTitleEn: true,
      metaDescriptionEn: true,
      focusKeyphraseEn: true,
      metaKeywordsEn: true,
      ogTitleEn: true,
      ogDescriptionEn: true,
      twitterTitleEn: true,
      twitterDescriptionEn: true,
      slugEn: true,
    },
    orderBy: { name: "asc" },
  });

  console.log(`Total products: ${products.length}\n`);

  const fields = [
    "nameEn",
    "shortDescEn",
    "descriptionEn",
    "featuresEn",
    "longDescriptionEn",
    "categoryEn",
    "tagsEn",
    "metaTitleEn",
    "metaDescriptionEn",
    "focusKeyphraseEn",
    "metaKeywordsEn",
    "ogTitleEn",
    "ogDescriptionEn",
    "twitterTitleEn",
    "twitterDescriptionEn",
    "slugEn",
  ] as const;

  const counts: Record<string, number> = {};
  for (const f of fields) counts[f] = 0;

  for (const p of products) {
    const empty: string[] = [];
    for (const f of fields) {
      const v = (p as any)[f];
      if (!v || v === "[]") {
        empty.push(f);
        counts[f]++;
      }
    }
    console.log(`${p.name} [${p.slug}]`);
    console.log(`   empty: ${empty.length ? empty.join(", ") : "(none)"}`);
  }

  console.log("\n=== SUMMARY (empty count per field) ===");
  for (const f of fields) {
    console.log(`  ${f}: ${counts[f]}/${products.length} empty`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
