import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Check for bad longDescriptionEn (containing error messages)
  const badLongDesc = await prisma.product.findMany({
    where: {
      longDescriptionEn: { contains: "HTTP 429" },
    },
    select: { id: true, name: true, slug: true, longDescriptionEn: true },
  });

  console.log(`\n❌ Products with bad longDescriptionEn (HTTP 429): ${badLongDesc.length}`);
  for (const p of badLongDesc) {
    console.log(`  ${p.name} [${p.slug}]`);
    console.log(`    Content: ${p.longDescriptionEn?.substring(0, 100)}...`);
  }

  // Check for bad tagsEn (containing error messages)
  const badTags = await prisma.product.findMany({
    where: {
      tagsEn: { contains: "HTTP 429" },
    },
    select: { id: true, name: true, slug: true, tagsEn: true },
  });

  console.log(`\n❌ Products with bad tagsEn (HTTP 429): ${badTags.length}`);
  for (const p of badTags) {
    console.log(`  ${p.name} [${p.slug}]`);
    console.log(`    Content: ${p.tagsEn?.substring(0, 100)}...`);
  }

  // Check tagsEn status
  const allProducts = await prisma.product.findMany({
    select: { id: true, name: true, slug: true, tagsEn: true, longDescriptionEn: true },
    orderBy: { name: "asc" },
  });

  console.log(`\n📊 Current status of all products:\n`);
  let tagsOk = 0, tagsEmpty = 0, tagsBad = 0;
  let longOk = 0, longEmpty = 0, longBad = 0;

  for (const p of allProducts) {
    const tagsStatus = !p.tagsEn || p.tagsEn === "[]" ? "EMPTY" : p.tagsEn.includes("HTTP 429") ? "BAD" : "OK";
    const longStatus = !p.longDescriptionEn || p.longDescriptionEn.trim() === "" ? "EMPTY" : p.longDescriptionEn.includes("HTTP 429") ? "BAD" : "OK";

    if (tagsStatus === "OK") tagsOk++;
    else if (tagsStatus === "EMPTY") tagsEmpty++;
    else tagsBad++;

    if (longStatus === "OK") longOk++;
    else if (longStatus === "EMPTY") longEmpty++;
    else longBad++;

    console.log(`  ${p.name}:`);
    console.log(`    tagsEn: ${tagsStatus} (${p.tagsEn?.length ?? 0} chars)`);
    console.log(`    longDescEn: ${longStatus} (${p.longDescriptionEn?.length ?? 0} chars)`);
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`tagsEn: OK=${tagsOk}, EMPTY=${tagsEmpty}, BAD=${tagsBad}`);
  console.log(`longDescEn: OK=${longOk}, EMPTY=${longEmpty}, BAD=${longBad}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
