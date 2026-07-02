const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const articleCount = await prisma.article.count();
    console.log('Article count:', articleCount);

    const productCount = await prisma.product.count();
    console.log('Product count:', productCount);

    if (articleCount > 0) {
      const articles = await prisma.article.findMany({
        take: 3,
        select: { id: true, title: true, slug: true, status: true, publishedAt: true }
      });
      console.log('Sample articles:', JSON.stringify(articles, null, 2));
    }

    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
    `;
    console.log('Tables:', tables.map(t => t.name).join(', '));

  } catch (e) {
    console.log('ERROR:', e.message);
    console.log(e.stack);
  } finally {
    await prisma.$disconnect();
  }
}

main();
