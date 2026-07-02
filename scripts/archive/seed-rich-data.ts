import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PRODUCTS_RICH_DATA: Record<string, {
  galleryItems: { url: string; captionFa?: string; captionEn?: string; order: number }[];
  featuresDetail: { titleFa: string; titleEn: string; icon: string }[];
}> = {
  "aegis-codex": {
    galleryItems: [
      { url: "/images/products/aegis-codex-aimbot.svg", captionFa: "رابط کاربری اصلی ایم‌بات", captionEn: "Main aimbot interface", order: 0 },
      { url: "/images/products/aegis-codex-aimbot.svg", captionFa: "تنظیمات پیشرفته", captionEn: "Advanced settings", order: 1 },
    ],
    featuresDetail: [
      { titleFa: "پیش‌بینی دینامیک شلاسک", titleEn: "Dynamic skill-shot prediction", icon: "Crosshair" },
      { titleFa: "آخرین ضربه خودکار", titleEn: "Automated last-hit", icon: "Zap" },
      { titleFa: "مدیریت خط هوشمند", titleEn: "Smart lane management", icon: "Shield" },
      { titleFa: "تأخیرهای انسانی", titleEn: "Humanized delays", icon: "Clock" },
    ],
  },
  "oracle-vision": {
    galleryItems: [
      { url: "/images/products/oracle-vision-esp.svg", captionFa: "نمایش کامل میدان نبرد", captionEn: "Full battlefield view", order: 0 },
    ],
    featuresDetail: [
      { titleFa: "شفافیت مه جنگ", titleEn: "Fog-of-war transparency", icon: "Eye" },
      { titleFa: "تایمر کمپ‌ها", titleEn: "Camp cooldown timers", icon: "Clock" },
      { titleFa: "هشدار خطر دینامیک", titleEn: "Dynamic danger warnings", icon: "Shield" },
      { titleFa: "رادار وارده", titleEn: "Ward placement radar", icon: "Radio" },
    ],
  },
  "cyber-sentry": {
    galleryItems: [
      { url: "/images/products/cyber-sentry-engine.svg", captionFa: "موتور ریکویل", captionEn: "Recoil engine", order: 0 },
    ],
    featuresDetail: [
      { titleFa: "حذف ریکویل میکرو", titleEn: "Micro-recoil elimination", icon: "Crosshair" },
      { titleFa: "پیش‌بینی گلوله", titleEn: "Bullet prediction", icon: "Eye" },
      { titleFa: "هدف‌گیری استخوانی", titleEn: "Bone targeting", icon: "Shield" },
      { titleFa: "بدون لرزش overlay", titleEn: "Zero overlay flicker", icon: "CheckCircle" },
    ],
  },
  "valkyrie-radar": {
    galleryItems: [
      { url: "/images/products/valkyrie-structural-radar.svg", captionFa: "دید ساختاری", captionEn: "Structural vision", order: 0 },
    ],
    featuresDetail: [
      { titleFa: "رندر استخوان‌ها", titleEn: "Bone rendering", icon: "Eye" },
      { titleFa: "ردیاب گجت", titleEn: "Gadget tracker", icon: "Radio" },
      { titleFa: "معیارهای سلامت", titleEn: "Health metrics", icon: "Shield" },
      { titleFa: "قاب سه‌بعدی", titleEn: "3D box framing", icon: "CheckCircle" },
    ],
  },
  "vanguard-bypass": {
    galleryItems: [
      { url: "/images/products/vanguard-bypass-core.svg", captionFa: "هسته بایپس", captionEn: "Bypass core", order: 0 },
    ],
    featuresDetail: [
      { titleFa: "درایور هسته‌ای", titleEn: "Kernel driver", icon: "Cpu" },
      { titleFa: "ورودی HID مجازی", titleEn: "Virtual HID inputs", icon: "Shield" },
      { titleFa: "تنظیم FOV نرم", titleEn: "Smooth FOV curve", icon: "Eye" },
      { titleFa: "حالت جریان تمیز", titleEn: "Clean stream mode", icon: "CheckCircle" },
    ],
  },
  "specter-wallhack": {
    galleryItems: [
      { url: "/images/products/specter-wallhack-overlay.svg", captionFa: "دیواربین حرفه‌ای", captionEn: "Professional wallhack", order: 0 },
    ],
    featuresDetail: [
      { titleFa: "رندر outline کم‌تأخیر", titleEn: "Low-latency outline", icon: "Eye" },
      { titleFa: "دور زدن اسکن", titleEn: "Screenshot bypass", icon: "Shield" },
      { titleFa: "نمایش فاصله و سلاح", titleEn: "Distance & weapon display", icon: "Crosshair" },
      { titleFa: "رنگ‌های قابل تنظیم", titleEn: "Customizable colors", icon: "Palette" },
    ],
  },
  "golden-hwid-spoofer": {
    galleryItems: [
      { url: "/images/products/golden-hwid-spoofer-elite.svg", captionFa: "اسپوفر HWID", captionEn: "HWID spoofer", order: 0 },
    ],
    featuresDetail: [
      { titleFa: "تصادفی‌سازی رجیستری", titleEn: "Registry randomization", icon: "RefreshCw" },
      { titleFa: "پاک‌کردن MAC", titleEn: "MAC address cleaner", icon: "Shield" },
      { titleFa: "پاک‌کننده رد بن", titleEn: "Shadow-ban cleaner", icon: "CheckCircle" },
      { titleFa: "پشتیبانی همه چیپ‌ست‌ها", titleEn: "All chipset support", icon: "Cpu" },
    ],
  },
  "phantom-strike": {
    galleryItems: [
      { url: "/images/products/phantom-strike-aimbot.svg", captionFa: "ایم‌بات فانتوم", captionEn: "Phantom aimbot", order: 0 },
    ],
    featuresDetail: [
      { titleFa: "صاف‌سازی انسانی", titleEn: "Humanized smoothing", icon: "Crosshair" },
      { titleFa: "جبران ریکویل", titleEn: "Recoil compensation", icon: "RefreshCw" },
      { titleFa: "مقیاس FOV تطبیقی", titleEn: "Adaptive FOV scaling", icon: "Eye" },
      { titleFa: "تریگربات تصادفی", titleEn: "Random triggerbot", icon: "Zap" },
    ],
  },
  "inferno-trigger": {
    galleryItems: [
      { url: "/images/products/inferno-trigger.svg", captionFa: "تریگربات هوشمند", captionEn: "Smart triggerbot", order: 0 },
    ],
    featuresDetail: [
      { titleFa: "تشخیص خودکار هدف", titleEn: "Auto target detection", icon: "Crosshair" },
      { titleFa: "تیر اول دقیق", titleEn: "Accurate first shot", icon: "Zap" },
      { titleFa: "تأخیر ضد بن", titleEn: "Anti-ban delays", icon: "Shield" },
      { titleFa: "تنظیم FOV", titleEn: "FOV customization", icon: "Eye" },
    ],
  },
  "apex-predator": {
    galleryItems: [
      { url: "/images/products/apex-predator-core.svg", captionFa: "هسته پدرشکن", captionEn: "Predator core", order: 0 },
    ],
    featuresDetail: [
      { titleFa: "حذف ریکویل همه سلاح‌ها", titleEn: "All-weapon recoil removal", icon: "Crosshair" },
      { titleFa: "پیش‌بینی هدف", titleEn: "Target prediction", icon: "Eye" },
      { titleFa: "سایلنت ایم", titleEn: "Silent aim", icon: "Shield" },
      { titleFa: "رندر ضد استریم", titleEn: "Stream-proof rendering", icon: "CheckCircle" },
    ],
  },
  "skinforge-ua": {
    galleryItems: [
      { url: "/images/products/skinforge-ua.svg", captionFa: "تغییر پوست", captionEn: "Skin changer", order: 0 },
    ],
    featuresDetail: [
      { titleFa: "همه پوست‌ها باز", titleEn: "All skins unlocked", icon: "Palette" },
      { titleFa: "تعویض پوست سلاح", titleEn: "Weapon skin swap", icon: "RefreshCw" },
      { titleFa: "رندر کلاینت", titleEn: "Client-side rendering", icon: "Eye" },
      { titleFa: "بدون ریسک شناسایی", titleEn: "No detection risk", icon: "Shield" },
    ],
  },
  "siege-radar": {
    galleryItems: [
      { url: "/images/products/siege-radar-hack.svg", captionFa: "هک رادار", captionEn: "Radar hack", order: 0 },
    ],
    featuresDetail: [
      { titleFa: "موقعیت دشمن روی مینی‌مپ", titleEn: "Enemy position on minimap", icon: "Radio" },
      { titleFa: "تشخیص گجت و تله", titleEn: "Gadget & trap detection", icon: "Eye" },
      { titleFa: "نشانگر هدف", titleEn: "Objective marker", icon: "CheckCircle" },
      { titleFa: "یکپارچگی پهپاد", titleEn: "Drone camera integration", icon: "Shield" },
    ],
  },
};

async function main() {
  console.log("🌱 Seeding rich product data (gallery + features)...\n");

  let updated = 0;
  let skipped = 0;

  for (const [slug, data] of Object.entries(PRODUCTS_RICH_DATA)) {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) {
      console.log(`  ⚠️  Not found: ${slug}`);
      skipped++;
      continue;
    }

    await prisma.product.update({
      where: { slug },
      data: {
        galleryItems: JSON.stringify(data.galleryItems),
        featuresDetail: JSON.stringify(data.featuresDetail),
      },
    });

    console.log(`  ✅ Updated: ${slug} (${data.galleryItems.length} gallery items, ${data.featuresDetail.length} features)`);
    updated++;
  }

  console.log(`\n✅ Done! Updated: ${updated}, Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
