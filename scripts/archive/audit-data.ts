import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Issue {
  slug: string;
  field: string;
  problem: string;
  value?: string;
}

async function main() {
  const products = await prisma.product.findMany({
    orderBy: { slug: 'asc' },
  });

  console.log(`\n=== Product Data Audit — ${products.length} products ===\n`);

  const issues: Issue[] = [];
  const table: string[][] = [];

  // Header
  table.push([
    'SLUG',
    'nameEn',
    'descEn',
    'shortEn',
    'featEn',
    'catEn',
    'titleEn',
    'metaEn',
    'keyphrase',
    'keywords',
    'ogEn',
    'twEn',
    'canon',
    'slugEn',
  ]);

  for (const p of products) {
    const slug = p.slug;
    const push = (field: string, problem: string, value?: string) =>
      issues.push({ slug, field, problem, value });

    // nameEn
    if (!p.nameEn) push('nameEn', 'MISSING');
    else if (p.nameEn === p.name) push('nameEn', 'SAME AS FA', p.nameEn);

    // descriptionEn
    if (!p.descriptionEn) push('descriptionEn', 'MISSING');
    else if (p.descriptionEn.length < 50) push('descriptionEn', 'TOO SHORT', p.descriptionEn.length.toString());

    // shortDescEn
    if (!p.shortDescEn) push('shortDescEn', 'MISSING');
    else if (p.shortDescEn.length < 20) push('shortDescEn', 'TOO SHORT', p.shortDescEn.length.toString());

    // featuresEn (may be string or array)
    const fe = Array.isArray(p.featuresEn) ? p.featuresEn : [];
    if (fe.length === 0) push('featuresEn', 'MISSING');
    else {
      const bad = (fe as string[]).find((f: string) => f.length < 3 || f.length > 30);
      if (bad) push('featuresEn', 'BAD ITEM', bad);
    }

    // featuresDetail
    if (!p.featuresDetail || p.featuresDetail.length === 0) {
      push('featuresDetail', 'MISSING');
    } else {
      const fd = Array.isArray(p.featuresDetail) ? (p.featuresDetail as any[]) : [];
      const badTitle = fd.find(f => !f.titleEn || f.titleEn === 'Feature' || f.titleEn.length < 3);
      if (badTitle) push('featuresDetail.titleEn', 'BAD', badTitle.titleEn);
      const badDesc = fd.find(f => !f.descriptionEn || f.descriptionEn.length < 10);
      if (badDesc) push('featuresDetail.descriptionEn', 'BAD', badDesc.descriptionEn?.slice(0, 30));
      const dupTitles = fd.filter((f, i) => fd.findIndex(x => x.titleEn === f.titleEn) !== i);
      if (dupTitles.length > 0) push('featuresDetail', 'DUPLICATES', dupTitles.map(d => d.titleEn).join(', '));
    }

    // categoryEn
    if (!p.categoryEn) push('categoryEn', 'MISSING');

    // metaTitleEn
    if (!p.metaTitleEn) push('metaTitleEn', 'MISSING');
    else if (p.metaTitleEn.length < 20 || p.metaTitleEn.length > 70) push('metaTitleEn', 'BAD LENGTH', p.metaTitleEn.length.toString());

    // metaDescriptionEn
    if (!p.metaDescriptionEn) push('metaDescriptionEn', 'MISSING');
    else if (p.metaDescriptionEn.length < 50 || p.metaDescriptionEn.length > 170) push('metaDescriptionEn', 'BAD LENGTH', p.metaDescriptionEn.length.toString());

    // focusKeyphraseEn
    if (!p.focusKeyphraseEn) push('focusKeyphraseEn', 'MISSING');
    else if (p.focusKeyphraseEn.split(' ').length < 2) push('focusKeyphraseEn', 'TOO SHORT', p.focusKeyphraseEn);

    // metaKeywordsEn (may be string or array)
    const mk = Array.isArray(p.metaKeywordsEn) ? p.metaKeywordsEn : [];
    if (mk.length === 0) push('metaKeywordsEn', 'MISSING');
    else if (mk.length < 3) push('metaKeywordsEn', 'TOO FEW', mk.length.toString());

    // ogTitleEn / ogDescriptionEn
    if (!p.ogTitleEn) push('ogTitleEn', 'MISSING');
    if (!p.ogDescriptionEn) push('ogDescriptionEn', 'MISSING');

    // twitterTitleEn / twitterDescriptionEn
    if (!p.twitterTitleEn) push('twitterTitleEn', 'MISSING');
    if (!p.twitterDescriptionEn) push('twitterDescriptionEn', 'MISSING');

    // canonicalUrl
    if (!p.canonicalUrl) push('canonicalUrl', 'MISSING');
    else if (!p.canonicalUrl.startsWith('https://goldencheat.com')) push('canonicalUrl', 'WRONG DOMAIN', p.canonicalUrl);
    else if (!p.canonicalUrl.includes('/en/')) push('canonicalUrl', 'NO /en/', p.canonicalUrl);

    // slugEn
    if (!p.slugEn) push('slugEn', 'MISSING');

    // Build summary row
    const len = (v: any) => v ? (v.length > 10 ? 'OK' : `BAD(${v.length})`) : 'MISSING';
    table.push([
      slug.slice(0, 20),
      len(p.nameEn),
      len(p.descriptionEn),
      len(p.shortDescEn),
      fe.length ? `${fe.length}` : '0',
      len(p.categoryEn),
      len(p.metaTitleEn),
      len(p.metaDescriptionEn),
      len(p.focusKeyphraseEn),
      mk.length ? `${mk.length}` : '0',
      len(p.ogTitleEn),
      len(p.twitterTitleEn),
      p.canonicalUrl ? (p.canonicalUrl.includes('/en/') ? 'OK' : 'NO /en/') : 'MISS',
      len(p.slugEn),
    ]);
  }

  // Print table
  const widths = table[0].map((_, i) => Math.max(...table.map(r => r[i].length))) as number[];
  for (const row of table) {
    console.log(row.map((c, i) => c.padEnd(widths[i] + 1)).join(' | '));
  }

  // Print issues
  console.log(`\n=== Issues (${issues.length}) ===\n`);
  const byField: Record<string, Issue[]> = {};
  for (const i of issues) {
    if (!byField[i.field]) byField[i.field] = [];
    byField[i.field].push(i);
  }
  for (const [field, list] of Object.entries(byField)) {
    console.log(`  ${field}: ${list.length} products affected`);
    for (const i of list.slice(0, 5)) {
      console.log(`    - ${i.slug}: ${i.problem}${i.value ? ` (${i.value})` : ''}`);
    }
    if (list.length > 5) console.log(`    ... and ${list.length - 5} more`);
  }

  // Summary
  console.log(`\n=== Summary ===`);
  console.log(`Total products: ${products.length}`);
  console.log(`Total issues: ${issues.length}`);
  const missingCount = issues.filter(i => i.problem === 'MISSING').length;
  console.log(`Missing fields: ${missingCount}`);
  console.log(`Products with at least 1 issue: ${new Set(issues.map(i => i.slug)).size}`);

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
