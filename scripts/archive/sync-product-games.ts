/**
 * sync-product-games.ts
 *
 * One-time migration: reads all game names referenced by products, then
 * ensures every one of them exists in the Games table (admin DB).
 * Games that are missing are inserted with sensible defaults.
 *
 * Run with:  npx tsx scripts/sync-product-games.ts
 * (or:       npx ts-node scripts/sync-product-games.ts)
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Legacy product game name → the canonical admin Game name it should map to.
 * These are "aliases" — the product's game field will be rewritten to the
 * canonical name so everything points to one source of truth.
 */
const ALIASES: Record<string, string> = {
  "Apex":           "Apex Legends",
  "R6":             "R6 Siege",
  "GTA":            "GTA V",
  "Fivem":          "FiveM",
  "Pubg":           "PUBG",
  "MOBILE LEGENDS": "Mobile Legends",
  "cSGO":           "CS2",
  "scum":           "Rust",           // best-effort match; adjust if needed
  "Zula":           "Zula",           // no match — will be created
  "battlefield 6":  "Battlefield 6",  // no match — will be created
  "DELTA FORCE":    "DELTA FORCE",    // no match — will be created
};

/** Display name → { nameEn, accentColor } for games that need to be created */
const KNOWN_NEW: Record<string, { nameEn?: string; accentColor?: string }> = {
  "Zula":           { nameEn: "Zula",                   accentColor: "#00BCD4" },
  "battlefield 6":  { nameEn: "Battlefield 6",          accentColor: "#8BC34A" },
  "DELTA FORCE":    { nameEn: "Delta Force: Hawk Ops", accentColor: "#795548" },
};

const DEFAULT_ACCENT = "#C9963A";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  // 1. Get all unique game names from products
  const products = await prisma.product.findMany({ select: { game: true } });
  const productGameNames = [...new Set(products.map((p) => p.game).filter(Boolean))] as string[];
  console.log(`📦 Products reference ${productGameNames.length} distinct game names`);

  // 2. Get all existing game names from Games table
  const existingGames = await prisma.game.findMany({ select: { name: true } });
  const existingNames = new Set(existingGames.map((g) => g.name));

  // 3. Apply aliases: rewrite product.game to canonical admin name
  console.log("\n🔄 Applying aliases (rewrite product.game → canonical name):");
  let aliasUpdates = 0;
  for (const [alias, canonical] of Object.entries(ALIASES)) {
    if (!productGameNames.includes(alias)) continue;
    if (!existingNames.has(canonical)) continue; // skip if canonical doesn't exist yet
    const result = await prisma.product.updateMany({
      where: { game: alias },
      data: { game: canonical },
    });
    if (result.count > 0) {
      console.log(`   "${alias}" → "${canonical}" (${result.count} products)`);
      aliasUpdates += result.count;
    }
  }
  console.log(`   Aliases applied: ${aliasUpdates} products updated`);

  // 4. Refresh data after alias rewrites
  const productsAfter = await prisma.product.findMany({ select: { game: true } });
  const productGameNamesAfter = [...new Set(productsAfter.map((p) => p.game).filter(Boolean))] as string[];

  // 5. Insert truly new games (no alias match) into admin DB
  const existingAfter = new Set((await prisma.game.findMany({ select: { name: true } })).map((g) => g.name));
  const toCreate = productGameNamesAfter.filter((n) => !existingAfter.has(n));

  if (toCreate.length > 0) {
    console.log(`\n➕ Creating ${toCreate.length} new games in admin DB:`);
    const allGames = await prisma.game.findMany({ select: { sortOrder: true } });
    const maxSortOrder = allGames.length > 0 ? Math.max(...allGames.map((g) => g.sortOrder)) : 0;

    let created = 0;
    for (let i = 0; i < toCreate.length; i++) {
      const name = toCreate[i];
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
            slugEn: slug + "-en",
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
  } else {
    console.log("\n✅ No new games need to be created.");
  }

  // 6. Final verification
  const finalGames = new Set((await prisma.game.findMany({ select: { name: true } })).map((g) => g.name));
  const finalProductGames = [...new Set((await prisma.product.findMany({ select: { game: true } })).map((p) => p.game))] as string[];
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
