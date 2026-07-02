# Golden Cheat — Session Startup Guide

## ⚡ اول هر سشن جدید (قبل از هر کاری)

**مرحله ۰ — بررسی گیت (فقط اگه کار قبلی بوده):**
```bash
git diff --stat
git log --oneline -5
```

**مرحله ۱ — خوندن حافظه (الزامی):**
```
Read memory/MEMORY.md
Read memory/rules.md
```
`MEMORY.md` تنها ایندکس معتبره. نیازی به اسکن کل پروژه نیست.
نکته: فایل `memory/project-overview.md` قدیمی و نا‌هنده — دیگه استفاده نشه.

**مرحله ۲ — گیت زمانی (mtime gate):**
بالای `memory/project.md` سه خط `> Scan stamp:` و `> package.json mtime:` و `> schema.prisma mtime:` هست. اگه هر کدوم از اینا تغییر کرد (یا فایل‌ها موجود نبودن) بزن:
```bash
npm run scan
```
این دستور فایل‌های `memory/project.md`, `schema.md`, `routes.md`, `components.md`, `stores.md` رو بازنویسی می‌کنه. بقیه فایل‌ها دست‌نویس هستن و تغییر نمی‌کنن.

**مرحله ۳ — فقط فایل موضوعی رو لود کن:**
- DB/دیتا → `memory/schema.md`
- روت‌ها/اندپوینت‌ها → `memory/routes.md`
- کامپوننت‌ها → `memory/components.md`
- state/context/hooks → `memory/stores.md`
- استک/پروایدرها/`env` → `memory/project.md`
- قوانین کسب‌وکار → `memory/rules.md` (از مرحله ۱)

**مرحله ۴ — ثبت سشن جدید:**
توی `memory/session-log.md` یه ورودی جدید اضافه کن با تاریخ و کارهایی که قراره انجام بشه.

---

## 📋 قوانین پروژه

@AGENTS.md

### اجرا
```bash
npm run dev    # localhost:3000 (turbopack)
npm run build
npm run lint
npm run scan   # بازسازی حافظه پروژه
```

### نکات مهم
- Next.js 16 دارای breaking changes است — قبل از نوشتن کد، داکیومنت مربوطه رو بخون
- داده‌ها واقعی هستند (SQLite از طریق Prisma) — `src/data/mockData.ts` فقط fallback هست
- برای جزئیات بیشتر قوانین (localStorage keys, billing, RTL, ...) به `memory/rules.md` مراجعه کن

### تم طراحی (خلاصه)
- **رنگ‌ها**: obsidian `#06090F`, gold `#C9963A`, cyber `#00F0FF`, danger `#FF3366`, success `#00FF88`
- **فونت‌ها**: Cinzel/Rajdhani (display), Vazirmatn/Kalameh (FA), Inter/JetBrains Mono (EN/mono)
- **RTL**: پشتیبانی کامل فارسی — FA پیش‌فرض، EN فقط با `/en/*`
- لیست کامل کلاس‌های CSS و قوانین کسب‌وکار در `memory/rules.md`

---

## 🔄 بعد از هر کار مهم

1. اگه `schema.prisma` تغییر یا وابستگی جدید اضافه شد → `npm run scan`
2. اگه قوانین کسب‌وکار (localStorage key, billing formula, جدید) پیدا شد → `memory/rules.md` آپدیت کن
3. اگه فایل حافظه جدیدی اضافه شد → `MEMORY.md` آپدیت کن
4. لاگ سشن توی `memory/session-log.md` بنویس
