import { PrismaClient } from '@prisma/client';
async function main() {
  const p = new PrismaClient();
  const prods = await p.product.findMany({
    select: { slug: true, slugEn: true, nameEn: true, status: true },
    orderBy: { slug: 'asc' }
  });
  for (const x of prods) {
    console.log(x.slug.padEnd(25), '| slugEn:', (x.slugEn || '').padEnd(20), '| status:', x.status, '| nameEn:', (x.nameEn || '').slice(0, 30));
  }
  await p.$disconnect();
}
main();
