/**
 * Fix PUBG PC Cheat English content
 * — Professional, SEO-optimized EN content based on the Farsi original.
 *
 * Run: npx tsx scripts/fix-pubg-pc-en.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ID = "cmqvxzfts000av5o4mp9uc2cs"; // چیت Pubg Pc

async function main() {
  const existing = await prisma.product.findUnique({ where: { id: ID } });
  if (!existing) {
    console.error("Product not found:", ID);
    process.exit(1);
  }
  console.log("Updating product:", existing.name, `(${existing.slug})`);

  // ---- Name (EN) ----
  const nameEn = "PUBG PC Cheat — Aimbot, ESP & Wallhack";

  // ---- Short Description (EN) ----
  const shortDescEn =
    "Undetected PUBG PC cheat with aimbot, wallhack, loot & vehicle ESP, no recoil and auto-update. Dominate every battle royale match.";

  // ---- Full Description (EN) — Rich Text (TipTap HTML) ----
  const descriptionEn = `<h2>PUBG PC Cheat — Dominate the Battleground</h2>
<p>Welcome to the most reliable way to upgrade your <strong>PUBG PC</strong> experience. Our <strong>PUBG PC Cheat</strong> is a fully undetected, license-protected multi-hack built to give you a real competitive edge — without the risk of bans or detection.</p>
<p>Whether you are grinding ranked, chasing chicken dinners, or just want to enjoy the game with full control, this cheat delivers everything you need in one clean, stable package.</p>

<h3>Why Choose Our PUBG PC Cheat?</h3>
<p>We built this cheat for players who want results without compromise. Every feature is tuned for performance, safety, and ease of use:</p>
<ul>
  <li><strong>100% Undetected &amp; Ban-Free Guarantee</strong> — Our anti-detection bypass runs in real time, keeping your account safe from every ban wave.</li>
  <li><strong>Auto-Update After Every Patch</strong> — The cheat updates itself within hours of each PUBG update, so you are always ready to play.</li>
  <li><strong>Wallhack (Glow &amp; Through-Wall ESP)</strong> — See every enemy through walls, terrain, and smoke. Know exactly where they are before they know you exist.</li>
  <li><strong>Advanced Aimbot</strong> — Smooth, customizable auto-aim with bone selection, FOV control, and humanized recoil for legit-looking gameplay.</li>
  <li><strong>No Recoil / Recoil Control</strong> — Eliminate vertical and horizontal recoil on every weapon. Spray like a laser beam with any AR or SMG.</li>
  <li><strong>Loot &amp; Item ESP</strong> — Instantly spot high-tier weapons, armor, healing items, and attachments through the overlay.</li>
  <li><strong>Vehicle ESP</strong> — Never waste time hunting for rides. See every vehicle on the map and rotate faster than the zone.</li>
  <li><strong>Airdrop / Care Package ESP</strong> — Track every airdrop and care package in real time. Gear up before anyone else lands.</li>
</ul>

<h3>Built for Performance and Safety</h3>
<p>Our cheat runs with minimal FPS impact and zero crashes. The external overlay design keeps memory clean, while the built-in anti-cheat bypass handles Vanguard-level detection methods. Daily updates, 24/7 support, and a personal license panel are included with every plan.</p>

<h3>How It Works</h3>
<ol>
  <li>Choose your plan (daily, weekly, or monthly) and complete checkout.</li>
  <li>Download the cheat client and log in with your personal license key.</li>
  <li>Launch PUBG PC, open the overlay menu, and enable the features you want.</li>
  <li>Drop in, dominate the lobby, and enjoy the win.</li>
</ol>

<p>Stop losing fights you should win. Get the <strong>PUBG PC Cheat</strong> today and own every match from the first drop to the last chicken dinner.</p>`;

  // ---- Long Description (EN) — Rich Text (TipTap) ----
  const longDescriptionEn = `<h2>PUBG PC Cheat — Full Feature Breakdown</h2>
<p>This is the complete <strong>PUBG PC Cheat</strong> package for players who want full control over every match. Built for the latest PUBG PC version and updated after every patch, it combines aimbot, wallhack, ESP overlays, no recoil, and anti-ban protection in one stable, easy-to-use client.</p>

<h3>Aimbot — Precision Auto-Aim</h3>
<p>Our aimbot uses advanced bone-targeting and smooth interpolation to lock onto enemies naturally. Adjustable FOV, lock-on priority (head/chest/nearest), and humanized recoil make your aim look clean and legit — even in spectator view. Works with every weapon from pistols to sniper rifles.</p>

<h3>Wallhack &amp; ESP Overlay</h3>
<p>See the entire battlefield at a glance. The ESP overlay highlights enemies, teammates, loot, vehicles, and airdrops through walls and terrain. Customizable colors, distance markers, and health bars give you full situational awareness before every fight.</p>

<h3>No Recoil &amp; Recoil Control</h3>
<p>Remove all vertical and horizontal recoil from every weapon. Whether you are spraying an M416, AKM, or Beryl, your bullets stay on target. The recoil control is tuned per-weapon and works with both full-auto and burst fire.</p>

<h3>Loot, Vehicle &amp; Airdrop ESP</h3>
<p>Stop looting blind. The loot ESP shows weapon tiers, armor levels, healing items, and attachments through walls. Vehicle ESP marks every car, boat, and bike on the map so you rotate faster. Airdrop ESP tracks every care package in real time so you always get the best gear first.</p>

<h3>Anti-Ban &amp; Auto-Update</h3>
<p>Our built-in anti-cheat bypass runs in real time to keep your account safe from detection and ban waves. The cheat auto-updates within hours of every PUBG patch, so you never miss a day of play. Your personal license panel lets you manage your subscription, download the latest client, and contact support — all in one place.</p>

<h3>System Requirements</h3>
<ul>
  <li>Windows 10/11 (64-bit)</li>
  <li>PUBG PC (Steam or Kakao)</li>
  <li>4 GB RAM minimum (8 GB recommended)</li>
  <li>Any DirectX 11 compatible GPU</li>
  <li>Stable internet connection</li>
</ul>

<p>Dominate every lobby. Get the <strong>PUBG PC Cheat</strong> now and turn every match into a chicken dinner.</p>`;

  // ---- Features EN (one per line) ----
  const featuresEn = [
    "Undetected & Ban-Free Guarantee — Real-time anti-detection bypass keeps your account safe",
    "Advanced Aimbot — Smooth auto-aim with bone selection, FOV control and humanized recoil",
    "Wallhack & Glow ESP — See every enemy through walls, terrain and smoke",
    "Loot & Item ESP — Highlight high-tier weapons, armor, healing and attachments",
    "Vehicle ESP — Locate every car, boat and bike on the map instantly",
    "Airdrop / Care Package ESP — Track every airdrop in real time",
    "No Recoil / Recoil Control — Zero recoil on every weapon for laser sprays",
    "Auto-Update — Self-updates within hours of every PUBG patch",
    "License Panel — Personal panel to manage your subscription and downloads",
    "24/7 Support — Fast help whenever you need it",
  ];

  // ---- Structured Features (with icons) ----
  const featuresDetail = [
    {
      titleFa: "چیت بدون بن",
      titleEn: "Undetected & Ban-Free",
      descriptionFa: "تضمین بدون بن با بایپس ضد تشخیص",
      descriptionEn: "Real-time anti-detection bypass keeps your account safe from every ban wave.",
      icon: "Shield",
    },
    {
      titleFa: "ایم‌بات پیشرفته",
      titleEn: "Advanced Aimbot",
      descriptionFa: "نشانه‌گیری خودکار دقیق با کنترل FOV",
      descriptionEn: "Smooth auto-aim with bone selection, FOV control and humanized recoil.",
      icon: "Crosshair",
    },
    {
      titleFa: "وال هک",
      titleEn: "Wallhack & Glow ESP",
      descriptionFa: "دیدن دشمنان از پشت دیوار و دود",
      descriptionEn: "See every enemy through walls, terrain and smoke with customizable glow.",
      icon: "Eye",
    },
    {
      titleFa: "حذف لگد",
      titleEn: "No Recoil",
      descriptionFa: "حذف کامل لگد برای شلیک لیزری",
      descriptionEn: "Zero vertical and horizontal recoil on every weapon for laser sprays.",
      icon: "Target",
    },
    {
      titleFa: "ESP لووت",
      titleEn: "Loot & Item ESP",
      descriptionFa: "نمایش اسلحه و آیتم‌های سطح بالا",
      descriptionEn: "Highlight high-tier weapons, armor, healing and attachments through walls.",
      icon: "Star",
    },
    {
      titleFa: "ESP وسایل نقلیه",
      titleEn: "Vehicle ESP",
      descriptionFa: "نمایش تمام ماشین‌ها روی نقشه",
      descriptionEn: "Locate every car, boat and bike on the map for faster rotations.",
      icon: "Gamepad2",
    },
    {
      titleFa: "ESP صندوق پرواز",
      titleEn: "Airdrop ESP",
      descriptionFa: "ردیابی صندوق‌های پرواز به صورت زنده",
      descriptionEn: "Track every airdrop and care package in real time across the map.",
      icon: "Download",
    },
    {
      titleFa: "آپدیت خودکار",
      titleEn: "Auto-Update",
      descriptionFa: "بروزرسانی خودکار بعد از هر پچ",
      descriptionEn: "Self-updates within hours of every PUBG patch — never miss a day.",
      icon: "RefreshCw",
    },
    {
      titleFa: "پنل اختصاصی",
      titleEn: "License Panel",
      descriptionFa: "پنل شخصی برای مدیریت لایسنس",
      descriptionEn: "Personal panel to manage your subscription, downloads and support.",
      icon: "Lock",
    },
    {
      titleFa: "پشتیبانی ۲۴/۷",
      titleEn: "24/7 Support",
      descriptionFa: "پشتیبانی سریع هر زمان که نیاز داشتید",
      descriptionEn: "Fast, friendly support whenever you need help with the cheat.",
      icon: "Headphones",
    },
  ];

  // ---- SEO — Search Engine Optimization ----
  const metaTitleEn =
    "PUBG PC Cheat 2026 — Undetected Aimbot, ESP & Wallhack | Golden Cheat";
  const metaDescriptionEn =
    "Buy the best PUBG PC cheat in 2026. Undetected aimbot, wallhack, loot & vehicle ESP, no recoil and auto-update. Ban-free guarantee. Dominate every match today!";
  const focusKeyphraseEn = "PUBG PC Cheat";
  const metaKeywordsEn = [
    "PUBG PC Cheat",
    "PUBG PC Aimbot",
    "PUBG Wallhack",
    "PUBG ESP",
    "PUBG No Recoil",
    "Undetected PUBG Cheat",
    "Buy PUBG PC Cheat",
    "Best PUBG Cheat 2026",
    "PUBG Hack",
    "PUBG PC Mod Menu",
  ];
  const ogTitleEn = "PUBG PC Cheat 2026 — Undetected Aimbot, ESP & Wallhack";
  const ogDescriptionEn =
    "Undetected PUBG PC cheat with aimbot, wallhack, loot & vehicle ESP, no recoil and auto-update. Ban-free guarantee. Dominate every battle royale match.";
  const twitterTitleEn = "PUBG PC Cheat 2026 — Undetected Aimbot & ESP";
  const twitterDescriptionEn =
    "Buy the best PUBG PC cheat. Aimbot, wallhack, ESP, no recoil, auto-update. Ban-free. Dominate every match today!";

  // ---- Perform update ----
  const updated = await prisma.product.update({
    where: { id: ID },
    data: {
      nameEn,
      shortDescEn,
      descriptionEn,
      longDescriptionEn,
      featuresEn: JSON.stringify(featuresEn),
      featuresDetail: JSON.stringify(featuresDetail) as any,
      metaTitleEn,
      metaDescriptionEn,
      focusKeyphraseEn,
      metaKeywordsEn: JSON.stringify(metaKeywordsEn),
      ogTitleEn,
      ogDescriptionEn,
      twitterTitleEn,
      twitterDescriptionEn,
    },
  });

  console.log("\n✅ Updated successfully:");
  console.log("  nameEn           :", updated.nameEn);
  console.log("  shortDescEn      :", updated.shortDescEn?.slice(0, 60) + "...");
  console.log("  descriptionEn    :", (updated.descriptionEn || "").slice(0, 60) + "...");
  console.log("  longDescriptionEn:", (updated.longDescriptionEn || "").slice(0, 60) + "...");
  console.log("  featuresEn       :", JSON.parse(updated.featuresEn as string).length, "items");
  console.log("  featuresDetail   :", JSON.parse(updated.featuresDetail as string).length, "items");
  console.log("  metaTitleEn      :", updated.metaTitleEn);
  console.log("  metaDescriptionEn:", updated.metaDescriptionEn);
  console.log("  focusKeyphraseEn :", updated.focusKeyphraseEn);
  console.log("  metaKeywordsEn   :", updated.metaKeywordsEn);
  console.log("  ogTitleEn        :", updated.ogTitleEn);
  console.log("  twitterTitleEn   :", updated.twitterTitleEn);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
