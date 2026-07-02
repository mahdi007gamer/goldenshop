import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PRODUCTS_FA_DATA: Record<string, {
  nameFa: string;
  descriptionFa: string;
  shortDescFa: string;
  featuresFa: string[];
  priceDaily: number;
  priceWeekly: number;
  priceMonthly: number;
  priceLifetime: number;
}> = {
  "aegis-codex-aimbot": {
    nameFa: "ایم‌بات آجیس کدکس",
    descriptionFa: "ایم‌بات پیش‌بینی پویا فوق‌دقیق بهینه‌شده برای هدف‌گیری شات‌های مهارتی، مدیریت خودکار کِپ‌کریت و امنیت مداوم نقشه.",
    shortDescFa: "ایم‌بات پیش‌بینی پویا برای Dota 2",
    featuresFa: [
      "ردیابی شات مهارتی پویا",
      "لست‌هیت و مدیریت لاین خام خودکار",
      "تأخیر خطی انسانی‌سازی شده",
      "تکنولوژی پوشش حافظه ایمن"
    ],
    priceDaily: 8.75,
    priceWeekly: 17.49,
    priceMonthly: 24.99,
    priceLifetime: 62.48,
  },
  "oracle-vision-esp": {
    nameFa: "اورکل ویژن ESP",
    descriptionFa: "شفافیت کامل میدان نبرد با نشانگرهای پویا و جزیی که زمان‌بندی کمپ‌ها، ساختارتن‌های دشمن و واردهای مه را نمایش می‌دهند.",
    shortDescFa: "ESP کامل و هک نقشه Dota 2",
    featuresFa: [
      "شفافیت کامل مه جنگی",
      "حساب‌کننده معکوس کول‌داون کمپ‌های خنثی",
      "هشدارهای مرزی خطر پویا",
      "رادار emplacement وارد"
    ],
    priceDaily: 7.00,
    priceWeekly: 13.99,
    priceMonthly: 19.99,
    priceLifetime: 49.98,
  },
  "cyber-sentry-engine": {
    nameFa: "موتور سایبر-سنتری",
    descriptionFa: "یک استبیلیزر ریکول نخبه و هسته سایلنت-ایم تطبیقی که برای شکستن قاب‌های ساختاری و اجرای تاکتیکال پیکسل-پرفکت کالیبره شده است.",
    shortDescFa: "استبیلیزر ریکول و سایلنت ایم نخبه برای R6",
    featuresFa: [
      "بردار حذف ریکول ریز",
      "پیش‌بین گلوله‌نافذ از دیوار",
      "تارگتینگ اسکلتی هوشمند (سر/گله/سینه)",
      "بدون فلیکر پوشش روی کپچر"
    ],
    priceDaily: 12.25,
    priceWeekly: 24.49,
    priceMonthly: 34.99,
    priceLifetime: 87.48,
  },
  "valkyrie-structural-radar": {
    nameFa: "رادار ساختاری والکایر",
    descriptionFa: "دید کامل دیوار و الخطوط اپراتور در زمان واقعی، مکان گجت‌ها، سلامت و سطح تجهیزات را نمایش می‌دهد.",
    shortDescFa: "ESP اسکلت کامل و دید دیوار R6",
    featuresFa: [
      "رندر درخشش اسکلت استخوانی کامل",
      "ردیاب گجت‌ها و الکترونیک",
      "متریک‌های سلامت و سوخت دقیق",
      "چارچوب‌باکس ۳ بعدی پشت مانع"
    ],
    priceDaily: 10.50,
    priceWeekly: 20.99,
    priceMonthly: 29.99,
    priceLifetime: 74.98,
  },
  "vanguard-bypass-core": {
    nameFa: "هسته بایپاس وانگارد",
    descriptionFa: "مجموعه تقویت نرم‌افزاری کرنل‌مود رینگ-۰ که از مجازی‌سازی درایور موس و تزریق حافظه پویای ایمن برای بایپاس اسکن‌های پیشرفته استفاده می‌کند.",
    shortDescFa: "ایم‌بات بایپاس وانگارد برای Valorant",
    featuresFa: [
      "درایور کرنل جداسازی‌شده وانگارد",
      "ورودی‌های HID مجازی (پی‌لود سفارشی Razer/Corsair)",
      "منحنی تنظیم FOV صاف",
      "حالت استریم امن یکپارچه"
    ],
    priceDaily: 14.00,
    priceWeekly: 27.99,
    priceMonthly: 39.99,
    priceLifetime: 99.98,
  },
  "specter-wallhack-overlay": {
    nameFa: "اورلای وال‌هک اسپکتر",
    descriptionFa: "خطوط کنتراست بالا و بردارهای تریسر پیش‌بینانه مستقیماً بر روی بازیکنان دشمن رندر می‌کند، به‌صورت یکپارچه چک‌های اعتبارسنجی اسکرین‌شات را بایپاس می‌کند.",
    shortDescFa: "وال‌هک با تأخیر فوق‌العاده کم برای Valorant",
    featuresFa: [
      "رندر آوت‌لاین با تأخیر فوق‌العاده کم",
      "بایپاس اسکن‌های فعال اسکرین‌شات",
      "نمایش متریک فاصله و لودآوت سلاح",
      "سایه‌های طلایی/سایبری قابل تنظیم"
    ],
    priceDaily: 9.80,
    priceWeekly: 19.59,
    priceMonthly: 27.99,
    priceLifetime: 69.98,
  },
  "golden-hwid-spoofer-elite": {
    nameFa: "گلدن اسپوفر HWID الیت",
    descriptionFa: "یک کلینر کرنل عمیق قوی که سریال‌های دیسک، آدرس‌های MAC، رجیستری مادربورد و کانفیگ‌های NIC را به‌صورت فوری رندومایز می‌کند.",
    shortDescFa: "بایپاس بن HWID - رندومایز رجیستری، Disk UUID، MAC",
    featuresFa: [
      "رندومایز رجیستری و Disk UUID با یک کلیک",
      "اسکافینگ MAC پویای شبکه کامل",
      "کلینر فایل ردیابی شادو-بن",
      "پشتیبانی از تمام چیپست‌های مادربورد Intel/AMD"
    ],
    priceDaily: 5.25,
    priceWeekly: 10.49,
    priceMonthly: 14.99,
    priceLifetime: 37.48,
  },
  "phantom-strike-aimbot": {
    nameFa: "ایم‌بات فانتوم استرایک",
    descriptionFa: "کمک هدف‌گیری دقت-مهندسی‌شده با کنترل ریکول انسانی‌سازی‌شده و مقیاس‌بندی FOV تطبیقی برای مچ‌مچینگ رقابتی.",
    shortDescFa: "ایم‌بات CS2 با هموارسازی انسانی و جبران ریکول",
    featuresFa: [
      "هموارسازی ایم انسانی",
      "جبران ریکول پویا",
      "مقیاس‌بندی FOV تطبیقی",
      "تریگربات با تأخیر تصادفی"
    ],
    priceDaily: 10.50,
    priceWeekly: 20.99,
    priceMonthly: 29.99,
    priceLifetime: 74.98,
  },
  "shadow-realm-esp": {
    nameFa: "شادو ریلم ESP",
    descriptionFa: "تقویت بصری طیف‌کامل با درخشش اسکلت، شناسایی سلاح، و پیش‌بینی مسیر نارنجک.",
    shortDescFa: "ESP طیف‌کامل CS2 با اسکلت، سلاح و مسیر نارنجک",
    featuresFa: [
      "اسکلِت و باکس ESP",
      "شناسایی سلاح و نارنجک",
      "خطوط مسیر نارنجک",
      "یکپارچه‌سازی هک رادار"
    ],
    priceDaily: 8.05,
    priceWeekly: 16.09,
    priceMonthly: 22.99,
    priceLifetime: 57.48,
  },
  "apex-predator-core": {
    nameFa: "هسته اکس پرداتور",
    descriptionFa: "کمک هدف‌گیری پیشرفته ساخته‌شده برای حرکت سریع Apex. شامل حذف ریکول و پیش‌بینی هدف برای همه کلاس‌های سلاح.",
    shortDescFa: "ایم‌بات پیشرفته برای Apex Legends",
    featuresFa: [
      "حذف ریکول برای همه سلاح‌ها",
      "الگوریتم پیش‌بینی هدف",
      "سایلنت ایم با محدودکننده FOV",
      "رندر ضد استریم"
    ],
    priceDaily: 11.55,
    priceWeekly: 23.09,
    priceMonthly: 32.99,
    priceLifetime: 82.48,
  },
  "royal-armory-skin-changer": {
    nameFa: "تغییر‌پوسته رویال آرموری",
    descriptionFa: "باز کردن و تجهیز هر پوستی در بازی بدون خرید. فقط سمت کلاینت، کاملاً امن از شناسایی.",
    shortDescFa: "باز کردن همه پوست‌های Apex Legends",
    featuresFa: [
      "همه پوست‌های افسانه‌ای باز شده",
      "تعویض پوست سلاح و شخصیت",
      "رندر فقط سمت کلاینت",
      "بدون ریسک شناسایی سمت سرور"
    ],
    priceDaily: 3.50,
    priceWeekly: 6.99,
    priceMonthly: 9.99,
    priceLifetime: 24.98,
  },
  "siege-radar-hack": {
    nameFa: "هک رادار سایج",
    descriptionFa: "تقویت مینی‌مپ که موقعیت دشمنان، گجت‌ها و نشانگرهای هدف را در زمان واقعی نشان می‌دهد.",
    shortDescFa: "تقویت مینی‌مپ برای R6 Siege",
    featuresFa: [
      "موقعیت دشمن روی مینی‌مپ",
      "تشخیص گجت و تله",
      "برجسته‌سازی نشانگر هدف",
      "یکپارچگی دوربین پهپاد"
    ],
    priceDaily: 4.55,
    priceWeekly: 9.09,
    priceMonthly: 12.99,
    priceLifetime: 32.48,
  },
};

async function main() {
  console.log("🌱 Seeding Farsi product data...\n");

  let updated = 0;
  let skipped = 0;

  for (const [slug, data] of Object.entries(PRODUCTS_FA_DATA)) {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) {
      console.log(`  ⚠️  Not found: ${slug}`);
      skipped++;
      continue;
    }

    await prisma.product.update({
      where: { slug },
      data: {
        nameFa: data.nameFa,
        descriptionFa: data.descriptionFa,
        shortDescFa: data.shortDescFa,
        featuresFa: JSON.stringify(data.featuresFa),
        priceDaily: data.priceDaily,
        priceWeekly: data.priceWeekly,
        priceMonthly: data.priceMonthly,
        priceLifetime: data.priceLifetime,
      },
    });

    console.log(`  ✅ Updated: ${slug} → ${data.nameFa} ($${data.priceDaily}/d $${data.priceWeekly}/w $${data.priceMonthly}/mo $${data.priceLifetime}/lt)`);
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