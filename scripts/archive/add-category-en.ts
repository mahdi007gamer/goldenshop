import { readFileSync, writeFileSync } from 'fs';

const file = 'scripts/seed-product-features-seo.ts';
const lines = readFileSync(file, 'utf8').split('\n');

// Map category FA -> categoryEn
const catMap: Record<string, string> = {
  'ESP Overlay': 'ESP Overlay',
  'Aimbot': 'Aimbot',
  'Camera Config': 'Camera Config',
  'Cheat Pack': 'Cheat Pack',
  'Cheat': 'Cheat',
  'Aim': 'Aim',
  'Mod Menu': 'Mod Menu',
  'ESP': 'ESP',
  'Performance': 'Performance',
  'Multi-Hack': 'Multi-Hack',
  'Lifetime': 'Lifetime',
  'Recoil Control': 'Recoil Control',
};

let added = 0;
const newLines: string[] = [];
for (let i = 0; i < lines.length; i++) {
  newLines.push(lines[i]);
  // If this line is "    category: 'X'," and prev line has "game:" — add categoryEn after it
  const m = lines[i].match(/^\s*category:\s*'([^']+)',\s*$/);
  if (m) {
    const catEn = catMap[m[1]] || m[1];
    newLines.push(`    categoryEn: '${catEn}',`);
    added++;
  }
}

writeFileSync(file, newLines.join('\n'));
console.log(`Added ${added} categoryEn lines`);
