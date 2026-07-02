import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// Products with short nameEn / focusKeyphraseEn — expand them
const fixes: Record<string, { nameEn?: string; focusKeyphraseEn?: string }> = {
  'cheat-dayz': {
    nameEn: 'DayZ Cheat — ESP, Teleport & God Mode',
    focusKeyphraseEn: 'DayZ Survival Cheat',
  },
  'cheat-scum': {
    nameEn: 'SCUM Cheat — Full Undetected',
    focusKeyphraseEn: 'SCUM Survival Cheat',
  },
  'cheat-zula': {
    nameEn: 'Zula Cheat — Aimbot & Wallhack',
    focusKeyphraseEn: 'Zula FPS Cheat',
  },
  'cheat-csgo': {
    nameEn: 'CS:GO / CS2 Cheat — Aimbot & Triggerbot',
    focusKeyphraseEn: 'CSGO CS2 Cheat',
  },
  'cheat-fivem': {
    nameEn: 'FiveM Cheat — Mod Menu & Money',
    focusKeyphraseEn: 'FiveM Mod Menu',
  },
  'cheat-gta-v': {
    nameEn: 'GTA V Cheat — Mod Menu & Money Drops',
    focusKeyphraseEn: 'GTA V Mod Menu',
  },
  'cheat-pubg-pc': {
    nameEn: 'PUBG PC Cheat — Aimbot & ESP',
    focusKeyphraseEn: 'PUBG PC Cheat',
  },
  'cheat-pubg-lite': {
    nameEn: 'PUBG Lite Cheat — ESP & Aimbot',
    focusKeyphraseEn: 'PUBG Lite Cheat',
  },
  'cheat-pubg-pc-recoil': {
    nameEn: 'PUBG Recoil Control — No Recoil Cheat',
    focusKeyphraseEn: 'PUBG Recoil Cheat',
  },
  'fps-boost-pack': {
    nameEn: 'FPS Boost Pack — Optimize Gaming Performance',
    focusKeyphraseEn: 'FPS Boost Pack',
  },
};

async function main() {
  let updated = 0;
  for (const [slug, data] of Object.entries(fixes)) {
    await p.product.update({ where: { slug }, data });
    console.log(`Updated ${slug}`);
    updated++;
  }
  console.log(`\nDone! ${updated} products updated.`);
  await p.$disconnect();
}

main();
