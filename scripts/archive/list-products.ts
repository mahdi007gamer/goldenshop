import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });
  console.log("Total:", products.length);
  for (const p of products) {
    console.log(`${p.id} | ${p.name} | ${p.slug} | ${p.game} | ${p.category} | $${p.price} | ${p.status} | img:${p.imageUrl}`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
