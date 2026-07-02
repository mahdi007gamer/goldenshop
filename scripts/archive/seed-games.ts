import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GAMES = [
  { slug: "valorant", name: "Valorant", nameEn: "Valorant", accentColor: "#FF4655", gradientFrom: "from-red-950/50", gradientTo: "to-obsidian", sortOrder: 1 },
  { slug: "cs2", name: "CS2", nameEn: "Counter-Strike 2", accentColor: "#E8B030", gradientFrom: "from-yellow-950/50", gradientTo: "to-obsidian", sortOrder: 2 },
  { slug: "r6-siege", name: "R6 Siege", nameEn: "Rainbow Six Siege", accentColor: "#4A90D9", gradientFrom: "from-blue-950/50", gradientTo: "to-obsidian", sortOrder: 3 },
  { slug: "dota-2", name: "Dota 2", nameEn: "Dota 2", accentColor: "#C9963A", gradientFrom: "from-amber-950/50", gradientTo: "to-obsidian", sortOrder: 4 },
  { slug: "apex-legends", name: "Apex Legends", nameEn: "Apex Legends", accentColor: "#9B59B6", gradientFrom: "from-purple-950/50", gradientTo: "to-obsidian", sortOrder: 5 },
  { slug: "pubg", name: "PUBG", nameEn: "PUBG: Battlegrounds", accentColor: "#F0A030", gradientFrom: "from-orange-950/50", gradientTo: "to-obsidian", sortOrder: 6 },
  { slug: "fortnite", name: "Fortnite", nameEn: "Fortnite", accentColor: "#7B68EE", gradientFrom: "from-indigo-950/50", gradientTo: "to-obsidian", sortOrder: 7 },
  { slug: "gta-v", name: "GTA V", nameEn: "Grand Theft Auto V", accentColor: "#00C853", gradientFrom: "from-green-950/50", gradientTo: "to-obsidian", sortOrder: 8 },
  { slug: "fivem", name: "FiveM", nameEn: "FiveM", accentColor: "#FF6B35", gradientFrom: "from-orange-950/50", gradientTo: "to-obsidian", sortOrder: 9 },
  { slug: "minecraft", name: "Minecraft", nameEn: "Minecraft", accentColor: "#4CAF50", gradientFrom: "from-emerald-950/50", gradientTo: "to-obsidian", sortOrder: 10 },
  { slug: "overwatch-2", name: "Overwatch 2", nameEn: "Overwatch 2", accentColor: "#FA9C1E", gradientFrom: "from-orange-950/50", gradientTo: "to-obsidian", sortOrder: 11 },
  { slug: "warzone", name: "Warzone", nameEn: "Call of Duty: Warzone", accentColor: "#8BC34A", gradientFrom: "from-lime-950/50", gradientTo: "to-obsidian", sortOrder: 12 },
  { slug: "lol", name: "League of Legends", nameEn: "League of Legends", accentColor: "#C89B3C", gradientFrom: "from-yellow-950/50", gradientTo: "to-obsidian", sortOrder: 13 },
  { slug: "fifa", name: "EA FC", nameEn: "EA Sports FC", accentColor: "#00BCD4", gradientFrom: "from-cyan-950/50", gradientTo: "to-obsidian", sortOrder: 14 },
  { slug: "rust", name: "Rust", nameEn: "Rust", accentColor: "#FF5722", gradientFrom: "from-deep-orange-950/50", gradientTo: "to-obsidian", sortOrder: 15 },
  { slug: "escape-from-tarkov", name: "Escape from Tarkov", nameEn: "Escape from Tarkov", accentColor: "#795548", gradientFrom: "from-brown-950/50", gradientTo: "to-obsidian", sortOrder: 16 },
  { slug: "dayz", name: "DayZ", nameEn: "DayZ", accentColor: "#607D8B", gradientFrom: "from-blue-gray-950/50", gradientTo: "to-obsidian", sortOrder: 17 },
  { slug: "dead-by-daylight", name: "Dead by Daylight", nameEn: "Dead by Daylight", accentColor: "#9C27B0", gradientFrom: "from-purple-950/50", gradientTo: "to-obsidian", sortOrder: 18 },
  { slug: "mobile-legends", name: "Mobile Legends", nameEn: "Mobile Legends", accentColor: "#E91E63", gradientFrom: "from-pink-950/50", gradientTo: "to-obsidian", sortOrder: 19 },
  { slug: "free-fire", name: "Free Fire", nameEn: "Free Fire", accentColor: "#FF9800", gradientFrom: "from-orange-950/50", gradientTo: "to-obsidian", sortOrder: 20 },
];

async function main() {
  const existing = await prisma.game.count();
  if (existing > 0) {
    console.log(`⚠️  ${existing} games already exist — skipping seed`);
    return;
  }
  for (const g of GAMES) {
    await prisma.game.create({
      data: {
        ...g,
        slugEn: g.slug,
        isActive: true,
      },
    });
  }
  console.log(`✅ Seeded ${GAMES.length} games`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
