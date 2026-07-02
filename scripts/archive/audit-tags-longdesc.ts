import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      tags: true,
      tagsEn: true,
      longDescription: true,
      longDescriptionEn: true,
      category: true,
      game: true,
    },
    orderBy: { name: "asc" },
  });

  console.log("=== TAGS (FA) samples ===\n");
  for (const p of products.slice(0, 5)) {
    console.log(`${p.name}:`);
    console.log(`  tags (FA): ${p.tags}`);
    console.log(`  tags (EN): ${p.tagsEn}`);
    console.log("");
  }

  console.log("\n=== LONG DESCRIPTION samples ===\n");
  const needLongDesc = products.filter((p) => !p.longDescriptionEn);
  console.log(`Products needing longDescriptionEn: ${needLongDesc.length}`);
  for (const p of needLongDesc.slice(0, 3)) {
    console.log(`\n${p.name}:`);
    console.log(`  longDescription (FA): ${(p.longDescription || "(empty)").substring(0, 100)}...`);
    console.log(`  longDescriptionEn: ${p.longDescriptionEn || "(empty)"}`);
  }

  // Show all tags FA content
  console.log("\n\n=== ALL FA TAGS content ===");
  for (const p of products) {
    console.log(`${p.slug}: ${p.tags}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
