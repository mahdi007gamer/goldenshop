// Audit all products via the live API (matches what the page actually sees)
const SLUGS = [
  'cheat-dead-by-daylight','cheat-dayz','cheat-dota-2-umbrella','cheat-apex',
  'cheat-dota-2','cheat-pubg-pc','cheat-r6-license','cheat-csgo','cheat-gta5',
  'cheat-pubg-mobile-tencent','fps-boost-pack','cheat-gta-v','cheat-pubg-mobile-pro',
  'cheat-scum','cheat-zula','cheat-csgo-system-bot','cheat-pubg-lite',
  'cheat-battlefield-6','cheat-mobile-legends','cheat-delta-force','cheat-fivem',
  'cheat-rainbow-six','cheat-pubg-pc-recoil','cheat-r6-recoil'
];

const keys = ['nameEn','descriptionEn','shortDescEn','featuresEn','categoryEn',
  'metaTitleEn','metaDescriptionEn','focusKeyphraseEn','metaKeywordsEn',
  'ogTitleEn','ogDescriptionEn','twitterTitleEn','twitterDescriptionEn','canonicalUrl','slugEn'];

type Row = Record<string, string>;

function check(v: any, key: string): string {
  if (v === null || v === undefined) return 'MISS';
  if (typeof v === 'string') return v.length > 15 ? 'OK' : `BAD(${v.length})`;
  if (Array.isArray(v)) return v.length > 0 ? `${v.length}` : '0';
  return '?';
}

async function main() {
  const rows: Row[] = [];
  for (const slug of SLUGS) {
    const res = await fetch(`http://localhost:3000/api/products/${slug}`);
    const json = await res.json();
    if (!json.success) { console.log(`${slug}: API ERROR`); continue; }
    const d = json.data;
    const row: Row = { slug: slug.slice(0, 20) };
    for (const k of keys) row[k] = check(d[k], k);
    rows.push(row);
  }

  // Print table
  const header = ['SLUG', ...keys];
  const widths = header.map((h, i) => Math.max(h.length, ...rows.map(r => Object.values(r)[i].length)));
  console.log(header.map((h, i) => h.padEnd(widths[i])).join(' | '));
  console.log(header.map((_, i) => '-'.repeat(widths[i])).join('-+-'));
  for (const row of rows) {
    console.log(Object.values(row).map((v, i) => v.padEnd(widths[i])).join(' | '));
  }
}

main();
