import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Map of DB name → user-facing name + slug
const UPDATES: Record<string, { name: string; slug: string }> = {
  "Aegis Codex Aimbot":        { name: "Aegis Codex",                slug: "aegis-codex" },
  "Oracle Vision ESP":         { name: "Oracle Vision",              slug: "oracle-vision" },
  "Cyber-Sentry Engine":       { name: "Cyber-Sentry",               slug: "cyber-sentry" },
  "Valkyrie Structural Radar": { name: "Valkyrie Radar",             slug: "valkyrie-radar" },
  "Vanguard-Bypass Core":      { name: "Vanguard-Bypass",            slug: "vanguard-bypass" },
  "Specter Wallhack Overlay":  { name: "Specter Wallhack",           slug: "specter-wallhack" },
  "Phantom Strike Aimbot":     { name: "Phantom Strike",             slug: "phantom-strike" },
  "Shadow Realm ESP":          { name: "Inferno Trigger",            slug: "inferno-trigger" },
  "Apex Predator Core":        { name: "Apex Predator",              slug: "apex-predator" },
  "Golden HWID Spoofer Elite": { name: "Golden HWID Spoofer",        slug: "golden-hwid-spoofer" },
  "Royal Armory Skin Changer": { name: "SkinForge UA",               slug: "skinforge-ua" },
  "Siege Radar Hack":          { name: "Siege Radar",               slug: "siege-radar" },
};

async function main() {
  for (const [oldName, { name, slug }] of Object.entries(UPDATES)) {
    const found = await prisma.product.findFirst({ where: { name: oldName } });
    if (found) {
      await prisma.product.update({
        where: { id: found.id },
        data: { name, slug },
      });
      console.log(`✅ "${oldName}" → "${name}" (${slug})`);
    } else {
      console.log(`⚠️  "${oldName}" not found`);
    }
  }
  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
