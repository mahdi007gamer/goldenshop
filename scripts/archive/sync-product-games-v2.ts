/**
 * sync-product-games-v2.ts
 *
 * Clean one-time migration:
 * 1. Apply aliases: rewrite product.game → canonical admin name.
 * 2. Delete incorrectly-added duplicate games.
 * 3. Create only truly-new games (no alias match).
 *
 * The canonical admin Games table is the source of truth.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Alias → canonical admin game name. Products with these legacy values will
 * be rewritten to point at the canonical game.
 */
const ALIASES: Record<string, string> = {
  "Apex":           "Apex Legends",
  "R6":             "R6 Siege",
  "GTA":            "GTA V",
  "Fivem":          "FiveM",
  "Pubg":           "PUBG",
  "MOBILE LEGENDS": "Mobile Legends",
  "cSGO":           "CS2",
  "scum":           "scum",
  // Deleted/unknown games that we will create fresh:
  "Zula":           null,
  "battlefield 6":  null,
  "DELTA FORCE":    null,
};

const KNOWN_NEW: Record<string, { nameEn?: string; accentColor?: string; slugEn?: string }> = {
  "Zula":           { nameEn: "Zula",                   accentColor: "#00BCD4" },
  "battlefield 6":  { nameEn: "Battlefield 6",          accentColor: "#8BC34A" },
  "DELTA FORCE":    { nameEn: "Delta Force: Hawk Ops", accentColor: "#795548" },
};

const DEFAULT_ACCENT = "#C9963A";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  // ── Step 0: Find incorrectly-added duplicates and delete them ──
  const badNames = ["Apex", "R6", "GTA", "Fivem", "Pubg", "MOBILE LEGENDS", "cSGO", "scum"];
  console.log("\n🗑️  Removing incorrectly-added duplicate games...");
  for (const name of badNames) {
    const existing = await prisma.game.findFirst({ where: { name } });
    if (existing) {
      // Check if any products reference this exact name
      const productCount = await prisma.product.count({ where: { game: name } });
      if (productCount === 0) {
        await prisma.game.delete({ where: { id: existing.id } });
        console.log(`   - deleted "${name}" (id: ${existing.id})`);
      } else {
        console.log(`   ! keeping "${name}" — still referenced by ${productCount} products`);
      }
    }
  }

  // ── Step 1: Apply aliases (rewrite product.game → canonical) ──
  console.log("\n🔄 Applying aliases:");
  let totalRewritten = 0;
  for (const [alias, canonical] of Object.entries(ALIASES)) {
    if (canonical === null) continue; // skip — we'll create fresh
    const result = await prisma.product.updateMany({
      where: { game: alias },
      data: { game: canonical },
    });
    if (result.count > 0) {
      console.log(`   "${alias}" → "${canonical}" (${result.count} products)`);
      totalRewritten += result.count;
    }
  }
  console.log(`   Total rewritten: ${totalRewritten}`);

  // ── Step 2: Get current state ──
  const existingGames = await prisma.game.findMany({ select: { id: true, name: true } });
  const existingNames = new Set(existingGames.map((g) => g.name));
  const productGames = [...new Set(
    (await prisma.product.findMany({ select: { game: true } }))
      .map((p) => p.game)
      .filter(Boolean)
  )] as string[];

  const missing = productGames.filter((n) => !existingNames.has(n));

  if (missing.length === 0) {
    console.log("\n✅ All product games now exist in admin DB. Lists are synced!");
    return;
  }

  // ── Step 3: Create missing games ──
  console.log(`\n➕ Creating ${missing.length} new games:`);
  const maxSortOrder = existingGames.length > 0
    ? Math.max(...(await prisma.game.findMany({ select: { sortOrder: true } })).map((g) => g.sortOrder))
    : 0;

  let created = 0;
  for (let i = 0; i < missing.length; i++) {
    const name = missing[i];
    const meta = KNOWN_NEW[name];
    const nameEn = meta?.nameEn || null;
    const accentColor = meta?.accentColor || DEFAULT_ACCENT;
    const slug = slugify(name);
    const sortOrder = maxSortOrder + 1 + i;

    try {
      await prisma.game.create({
        data: {
          name,
          nameEn,
          slug,
          slugEn: meta?.slugEn || slug + "-en",
          accentColor,
          sortOrder,
          isActive: true,
        },
      });
      console.log(`   + "${name}"`);
      created++;
    } catch (err) {
      console.error(`   ✗ failed "${name}":`, (err as Error).message);
    }
  }
  console.log(`   Created: ${created}`);

  // ── Step 4: Verify ──
  const finalGames = new Set((await prisma.game.findMany({ select: { name: true } })).map((g) => g.name));
  const finalProductGames = [...new Set(
    (await prisma.product.findMany({ select: { game: true } })).map((p) => p.game)
  )] as string[];
  const stillMissing = finalProductGames.filter((g) => !finalGames.has(g));
  if (stillMissing.length > 0) {
    console.log(`\n⚠️  Still unmatched: ${stillMissing.join(", ")}`);
  } else {
    console.log("\n✅ Every product game now matches an admin Game. Lists are in sync!");
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
