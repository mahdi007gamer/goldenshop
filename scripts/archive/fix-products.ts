import { PrismaClient } from "@prisma/client";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

const GAME_COLORS: Record<string, { bg1: string; bg2: string; accent: string }> = {
  "Dota 2": { bg1: "#0a0e17", bg2: "#1a1030", accent: "#C9963A" },
  "R6 Siege": { bg1: "#0a0e17", bg2: "#0a1a2a", accent: "#4A90D9" },
  Valorant: { bg1: "#0a0e17", bg2: "#1a0a1a", accent: "#FF4655" },
  CS2: { bg1: "#0a0e17", bg2: "#1a1a0a", accent: "#E8B030" },
  "Apex Legends": { bg1: "#0a0e17", bg2: "#1a0a20", accent: "#9B59B6" },
};

const CATEGORY_ICONS: Record<string, string> = {
  Aimbot: "AIM",
  "ESP Overlay": "ESP",
  Wallhack: "WALL",
  "HWID Spoofer": "HWID",
  "Skin Changer": "SKIN",
  Radar: "RADAR",
};

function makeSvg(name: string, game: string, category: string, slug: string): void {
  const colors = GAME_COLORS[game] || GAME_COLORS["Dota 2"];
  const icon = CATEGORY_ICONS[category] || "CHEAT";
  const dir = join(process.cwd(), "public", "images", "products");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.bg2};stop-opacity:1" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="40%">
      <stop offset="0%" style="stop-color:${colors.accent};stop-opacity:0.25" />
      <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:0" />
    </radialGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg)" rx="16"/>
  <rect x="1" y="1" width="398" height="398" fill="none" stroke="${colors.accent}" stroke-width="1" rx="14" opacity="0.2"/>
  <rect x="20" y="20" width="360" height="360" fill="url(#glow)" rx="12"/>
  <g transform="translate(200,170)" opacity="0.85">
    <path d="M0,-55 L13,-13 L55,0 L13,13 L0,55 L-13,13 L-55,0 L-13,-13 Z" fill="none" stroke="${colors.accent}" stroke-width="1.5"/>
    <circle cx="0" cy="0" r="20" fill="none" stroke="${colors.accent}" stroke-width="1" opacity="0.5"/>
    <circle cx="0" cy="0" r="7" fill="${colors.accent}" opacity="0.35"/>
  </g>
  <text x="200" y="280" text-anchor="middle" font-family="monospace" font-size="11" fill="${colors.accent}" opacity="0.9" letter-spacing="3">${icon}</text>
  <text x="200" y="310" text-anchor="middle" font-family="serif" font-size="13" fill="${colors.accent}" opacity="0.6" letter-spacing="1.5">${game.toUpperCase()}</text>
</svg>`;

  writeFileSync(join(dir, `${slug}.svg`), svg);
}

// The EXACT product list the user wants (matching admin panel)
const PRODUCTS = [
  { id: "g2_radar", name: "Siege Radar Hack", slug: "siege-radar-hack", game: "R6 Siege", category: "Radar", price: 12.99, isPopular: false },
  { id: "g5_skin", name: "Royal Armory Skin Changer", slug: "royal-armory-skin-changer", game: "Apex Legends", category: "Skin Changer", price: 9.99, isPopular: false },
  { id: "g5_aim", name: "Apex Predator Core", slug: "apex-predator-core", game: "Apex Legends", category: "Aimbot", price: 32.99, isPopular: true },
  { id: "g4_esp", name: "Shadow Realm ESP", slug: "shadow-realm-esp", game: "CS2", category: "ESP Overlay", price: 22.99, isPopular: false },
  { id: "g4_aim", name: "Phantom Strike Aimbot", slug: "phantom-strike-aimbot", game: "CS2", category: "Aimbot", price: 29.99, isPopular: true },
  { id: "g_spoofer", name: "Golden HWID Spoofer Elite", slug: "golden-hwid-spoofer-elite", game: "Valorant", category: "HWID Spoofer", price: 14.99, isPopular: false },
  { id: "g3_wall", name: "Specter Wallhack Overlay", slug: "specter-wallhack-overlay", game: "Valorant", category: "Wallhack", price: 27.99, isPopular: false },
  { id: "g3_aim", name: "Vanguard-Bypass Core", slug: "vanguard-bypass-core", game: "Valorant", category: "Aimbot", price: 39.99, isPopular: true },
  { id: "g2_esp", name: "Valkyrie Structural Radar", slug: "valkyrie-structural-radar", game: "R6 Siege", category: "ESP Overlay", price: 29.99, isPopular: false },
  { id: "g2_aim", name: "Cyber-Sentry Engine", slug: "cyber-sentry-engine", game: "R6 Siege", category: "Aimbot", price: 34.99, isPopular: true },
  { id: "g1_esp", name: "Oracle Vision ESP", slug: "oracle-vision-esp", game: "Dota 2", category: "ESP Overlay", price: 19.99, isPopular: false },
  { id: "g1_aim", name: "Aegis Codex Aimbot", slug: "aegis-codex-aimbot", game: "Dota 2", category: "Aimbot", price: 24.99, isPopular: true },
];

async function main() {
  // Delete all existing products
  await prisma.$executeRawUnsafe('DELETE FROM "Product"');
  console.log("Cleared existing products");

  // Insert products with correct names
  for (const p of PRODUCTS) {
    const imageUrl = `/images/products/${p.slug}.svg`;
    makeSvg(p.name, p.game, p.category, p.slug);

    await prisma.product.create({
      data: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        game: p.game,
        category: p.category,
        price: p.price,
        rating: 4.5 + Math.random() * 0.5,
        reviewsCount: Math.floor(50 + Math.random() * 200),
        features: JSON.stringify(["Premium quality", "Undetected", "24/7 support", "Instant delivery"]),
        description: `Professional ${p.category} for ${p.game}. Undetected and reliable.`,
        isPopular: p.isPopular,
        bypassRate: "99.9%",
        updateStatus: "Undetected",
        imageUrl,
        status: "active",
      },
    });
    console.log(`✓ ${p.name} (${p.game}) - $${p.price}`);
  }

  console.log(`\n✅ ${PRODUCTS.length} products synced!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
