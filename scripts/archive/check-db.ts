import { prisma } from "@/lib/prisma";

async function main() {
  const count = await prisma.product.count();
  console.log("Product count:", count);
  const products = await prisma.product.findMany({
    select: { id: true, name: true, slug: true, status: true },
  });
  products.forEach((p) => console.log(JSON.stringify(p)));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
