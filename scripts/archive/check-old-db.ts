import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient({
    datasources: { db: { url: 'file:./old.db' } },
  });

  const products = await prisma.product.findMany({ orderBy: { slug: 'asc' } });
  console.log(`Old DB: ${products.length} products`);
  for (const p of products) {
    console.log(`  ${p.slug}: nameEn=${p.nameEn?.slice(0, 30) || 'NULL'} | featuresEn=${Array.isArray(p.featuresEn) ? p.featuresEn.length : '?'} | categoryEn=${p.categoryEn || 'NULL'} | metaKeywordsEn=${Array.isArray(p.metaKeywordsEn) ? p.metaKeywordsEn.length : '?'}`);
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
