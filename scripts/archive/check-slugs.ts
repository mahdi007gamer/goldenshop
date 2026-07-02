import { PrismaClient } from '@prisma/client';
async function main() {
  const p = new PrismaClient();
  const prods = await p.product.findMany({ select: { slug: true, slugEn: true }, orderBy: { slug: 'asc' } });
  for (const x of prods) console.log(x.slug.padEnd(25), '->', x.slugEn);
  await p.$disconnect();
}
main();
