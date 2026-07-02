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
  "aegis-codex": {
    nameFa: "ایجیس کدکس ایم‌بات",
    descriptionFa: "ایم‌بات پیش‌بینی دینامیک فوق‌الدقه برای شلاسک‌های هدف، خودکارسازی آخرین ضربه و مدیریت خط میدانی با تکنولوژی امن حافظه.",
    shortDescFa: "ایم‌بات دقیق برای Dota 2 با پیش‌بینی دینامیک",
    featuresFa: [
      "ردیابی دینامیک شات‌های مهارتی",
      "آخرین ضربه خودکار و مدیریت خط",
      "تأخیرهای خطی انسانی",
      "تکنولوژی امن overlay حافظه",
    ],
    priceDaily: 4,
    priceWeekly: 12,
    priceMonthly: 24.99,
    priceLifetime: 60,
  },
  "oracle-vision": {
    nameFa: "اوراکل ویژن ESP",
    descriptionFa: "شفافیت کامل میدان نبرد با نشانگرهای دینامیک که تایمرهای کمپ، ساختمان‌های دشمن و واردهای را نمایش می‌دهد.",
    shortDescFa: "دید کامل میدان نبرد برای Dota 2",
    featuresFa: [
      "شفافیت کامل مه جنگ",
      "شمارش معکوس کمپ‌های خنثی",
      "هشدارهای مرز خطر دینامیک",
      "رادار جایگذاری وارد",
    ],
    priceDaily: 3,
    priceWeekly: 9,
    priceMonthly: 19.99,
    priceLifetime: 45,
  },
  "cyber-sentry": {
    nameFa: "موتور سایبر-سنتری",
    descriptionFa: "یک تثبیت‌کننده ریکویل نخبه و هسته سایلنت-ایم تطبیقی کالیبره‌شده برای شکستن ساختارها و اجراهای تاکتیکی پیکسل‌کامل.",
    shortDescFa: "ایم‌بات غیرقابل شناسایی برای R6 Siege",
    featuresFa: [
      "حذف ریکویل میکرو",
      "پیش‌بینی گلوله با نفوذ دیوار",
      "هدف‌گیری هوشمند استخوانی",
      "بدون لرزش overlay هنگام ضبط",
    ],
    priceDaily: 5,
    priceWeekly: 15,
    priceMonthly: 34.99,
    priceLifetime: 80,
  },
  "valkyrie-radar": {
    nameFa: "رادار ساختاری والکیری",
    descriptionFa: "دید کامل دیوارها و طرح‌های استخوانی اپراتورها در زمان واقعی، با نمایش لوکاسیون گجت‌ها، سلامت و تجهیزات.",
    shortDescFa: "دید ESP کامل برای R6 Siege",
    featuresFa: [
      "رندر کامل استخوان‌های بدن",
      "ردیاب گجت‌ها و الکترونیک‌ها",
      "معیارهای دقیق سلامت و سوخت",
      "قاب‌بندی سه‌بعدی پشت موانع",
    ],
    priceDaily: 4,
    priceWeekly: 12,
    priceMonthly: 29.99,
    priceLifetime: 70,
  },
  "vanguard-bypass": {
    nameFa: "هسته بایپس وانگارد",
    descriptionFa: "یک مجموعه بهبود نرم‌افزاری سطح صفر هسته‌ای با مجازی‌سازی درایور ماوس و تزریقات امن حافظه دینامیک برای دور زدن اسکن‌های پیشرفته.",
    shortDescFa: "ایم‌بات سطح هسته برای Valorant",
    featuresFa: [
      "درایور هسته‌ای ایزوله از وانگارد",
      "ورودی‌های HID مجازی",
      "منحنی تنظیم FOV نرم",
      "حالت جریان تمیز امن",
    ],
    priceDaily: 6,
    priceWeekly: 18,
    priceMonthly: 39.99,
    priceLifetime: 95,
  },
  "specter-wallhack": {
    nameFa: "اورلی دیواربین اسپکتر",
    descriptionFa: "رندر خطوط کنتراست بالا و بردارهای پیش‌بینی ترک‌ها مستقیم روی بازیکنان دشمن، با دور زدن اعتبارسنجی اسکرین‌شات.",
    shortDescFa: "دیواربین حرفه‌ای برای Valorant",
    featuresFa: [
      "رندر outline کم‌تأخیر",
      "دور زدن اسکن اسکرین‌شات‌ها",
      "نمایش متریک فاصله و سلاح",
      "رنگ‌های طلایی/سایبر قابل تنظیم",
    ],
    priceDaily: 4,
    priceWeekly: 12,
    priceMonthly: 27.99,
    priceLifetime: 65,
  },
  "golden-hwid-spoofer": {
    nameFa: "گلدن اسپوفر HWID الیت",
    descriptionFa: "یک پاک‌کننده عمیق هسته‌ای که سریال دیسک، آدرس MAC، رجیستری مادربرد و تنظیمات NIC شما را فوری تصادفی‌سازی می‌کند.",
    shortDescFa: "اسپوفر HWID برای همه بازی‌ها",
    featuresFa: [
      "تصادفی‌سازی رجیستری و UUID دیسک",
      "پاک‌کردن پویای شبکه MAC",
      "پاک‌کننده فایل‌های رد بن سایه",
      "پشتیبانی از همه چیپ‌ست‌ها",
    ],
    priceDaily: 2,
    priceWeekly: 6,
    priceMonthly: 14.99,
    priceLifetime: 35,
  },
  "phantom-strike": {
    nameFa: "فانتوم استرایک ایم‌بات",
    descriptionFa: "کمک هدف‌گیری مهندسی‌شده با دقت با کنترل ریکویل انسانی و مقیاس‌بندی FOV تطبیقی برای مسابقات رقابتی.",
    shortDescFa: "ایم‌بات قدرتمند برای CS2",
    featuresFa: [
      "صاف‌سازی هدف‌گیری انسانی",
      "جبران ریکویل دینامیک",
      "مقیاس‌بندی FOV تطبیقی",
      "تریگربات با تأخیر تصادفی",
    ],
    priceDaily: 4,
    priceWeekly: 12,
    priceMonthly: 29.99,
    priceLifetime: 70,
  },
  "inferno-trigger": {
    nameFa: "تریگر اینفیرنو",
    descriptionFa: "سیستم تریگر هوشمند با تشخیص خودکار هدف و تیر اول دقیق برای بازی‌های تیراندازی اول‌شخص.",
    shortDescFa: "تریگربات هوشمند برای CS2",
    featuresFa: [
      "تشخیص خودکار هدف",
      "تیر اول دقیق",
      "تأخیر تصادفی ضد بن",
      "تنظیم FOV قابل شخصی‌سازی",
    ],
    priceDaily: 3,
    priceWeekly: 9,
    priceMonthly: 22.99,
    priceLifetime: 55,
  },
  "apex-predator": {
    nameFa: "هسته پدرشکن اپکس",
    descriptionFa: "کمک هدف‌گیری پیشرفته ساخته‌شده برای حرکت سریع Apex. شامل حذف ریکویل و پیش‌بینی هدف برای همه کلاس‌های سلاح.",
    shortDescFa: "ایم‌بات پیشرفته برای Apex Legends",
    featuresFa: [
      "حذف ریکویل برای همه سلاح‌ها",
      "الگوریتم پیش‌بینی هدف",
      "سایلنت ایم با محدودکننده FOV",
      "رندر ضد استریم",
    ],
    priceDaily: 5,
    priceWeekly: 14,
    priceMonthly: 32.99,
    priceLifetime: 75,
  },
  "skinforge-ua": {
    nameFa: "اسکین‌فورج UA",
    descriptionFa: "باز کردن و تجهیز هر پوستی در بازی بدون خرید. فقط سمت کلاینت، کاملاً امن از شناسایی.",
    shortDescFa: "باز کردن همه پوست‌ها در Apex Legends",
    featuresFa: [
      "همه پوست‌های افسانه‌ای باز شده",
      "تعویض پوست سلاح و شخصیت",
      "رندر فقط سمت کلاینت",
      "بدون ریسک شناسایی سمت سرور",
    ],
    priceDaily: 1,
    priceWeekly: 3,
    priceMonthly: 9.99,
    priceLifetime: 25,
  },
  "siege-radar": {
    nameFa: "هک رادار سایج",
    descriptionFa: "تقویت مینی‌مپ که موقعیت دشمنان، گجت‌ها و نشانگرهای هدف را در زمان واقعی نشان می‌دهد.",
    shortDescFa: "تقویت مینی‌مپ برای R6 Siege",
    featuresFa: [
      "موقعیت دشمن روی مینی‌مپ",
      "تشخیص گجت و تله",
      "برجسته‌سازی نشانگر هدف",
      "یکپارچگی دوربین پهپاد",
    ],
    priceDaily: 2,
    priceWeekly: 5,
    priceMonthly: 12.99,
    priceLifetime: 30,
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
