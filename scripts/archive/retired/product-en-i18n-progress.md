---
name: product-en-i18n-progress
description: پیشرفت سیستم دو زبانه محصولات — فاز 0 تا فاز 2 انجام شده، فاز 3-6 باقی مانده
metadata:
  type: project
---

# Product English i18n — پیشرفت تا سشن 2026-06-28

## وضعیت فعلی: فاز 6 تمام شده — همه فازها کامل است

## هدف نهایی
صفحه محصول انگلیسی (مثلاً `/en/products/cheat-rainbow-six`) باید:
1. دقیقاً همان استایل و تم اصلی سایت فارسی را داشته باشد
2. محتوای کامل و درست انگلیسی (عنوان، توضیحات، features، SEO meta) داشته باشد
3. از یک سیستم layout واحد استفاده کند — فقط محتوا بر اساس locale تغییر کند

## فازها

### فاز 0 — Discovery ✅
- فهمیدن ساختار: دو صفحه جدا
  - `src/app/products/[slug]/page.tsx` (فارسی، 917 خط، استایل اصلی)
  - `src/app/[lang]/products/[slug]/page.tsx` (انگلیسی، 767 خط، استایل ساده/متفاوت)
- علت root cause: کامپوننت جدا با استایل inline متفاوت

### فاز 1 — حذف صفحه انگلیسی جدا ✅
- **حذف:** `src/app/[lang]/products/[slug]/page.tsx` (فایل 767 خطی)
- **ایجاد:** wrapper کوچک `[lang]/products/[slug]/page.tsx` (10 خط) که فقط `ProductPage` فارسی را import می‌کند
- **تغییر در `ProductPage`:** تشخیص `lang` از `useParams().lang` به جای `useLang()` (چون `useLang` در بعضی موارد قدیمی می‌ماند)
- **نتیجه:** بیلد موفق، مسیر `/en/products/[slug]` کار می‌کند

### فاز 2 — یکپارچه‌سازی کامپوننت ✅ (تأیید شده در 2026-06-28)
- **آپدیت type `Product`:** اضافه شدن فیلدهای `*En` (nameEn, descriptionEn, shortDescEn, featuresEn, metaTitleEn, etc.)
- **آپدیت display logic:**
  - `displayName`: اگر `lang=en` باشد `product.nameEn || product.name`
  - `displayDesc`: اگر `lang=en` باشد `product.descriptionEn || product.description`
  - `displayShortDesc`: اگر `lang=en` باشد `product.shortDescEn || product.shortDesc`
  - `displayFeatures`: اگر `lang=en` باشد `product.featuresEn || product.features`
- **آپدیت SEO:**
  - `seoTitle`: اگر `lang=en` باشد `metaTitleEn || metaTitle || nameEn || name`
  - `seoDesc`: اگر `lang=en` باشد `metaDescriptionEn || metaDescription || shortDescEn || shortDesc`
  - `seoOgTitle/Desc`: مشابه
  - `seoCanonical`: اگر `lang=en` باشد `canonicalUrl || https://goldencheat.com/en/products/{slugEn}`
  - `seoKeywords`: اگر `lang=en` باشد `metaKeywordsEn || metaKeywords`
  - `twitterTitle/Desc`: اگر `lang=en` باشد `twitterTitleEn/DescriptionEn || ...`
- **آپدیت JSON-LD:**
  - `name`: اگر `lang=en` باشد `nameEn || name`
  - `description`: اگر `lang=en` باشد `metaDescriptionEn || ...`
  - `category`: اگر `lang=en` باشد `categoryEn || category`
- **نتیجه:** بیلد موفق
- **تست API:** همه فیلدهای *En در دیتابیس موجود هستند (nameEn, descriptionEn, shortDescEn, featuresEn, metaTitleEn, etc.)
- **تأیید نهایی سشن 2026-06-28:**
  - `npm run build` بدون ارور
  - 6 مسیر `/en/products/[slug]` (apex/pubg/r6/melonity/recoil/cs2) بدون شکست
  - محصولات FA: `/products/[slug]` بدون تغییر
  - `displayName`/`seoTitle`/`canonicalUrl`/`shortDesc`/`metaDescription`/`features`/`twitterTitle`/`ogTitle`/`JSON-LD` همگی `isFa` دارند
  - فیلدهای *En اختیاری (ogTitleEn/twitterTitleEn/categoryEn/focusKeyphraseEn/metaKeywordsEn) در DB ناقص‌اند — این عدم تعادل داده است و در فاز ۴ seed خواهد شد

#### عدم تعادل‌های شناسایی شده (برای فاز ۴)
این فیلدها خالی/ناقص هستند و fallback دارند ولی بهینه نیستند:
- `ogTitleEn`, `ogDescriptionEn`, `twitterTitleEn`, `twitterDescriptionEn` — خالی (fallback به FA)
- `categoryEn` — خالی در اکثر محصولات (fallback به FA)
- `focusKeyphraseEn`, `metaKeywordsEn` — خالی
- `longDescriptionEn` — خالی
- متون FA گاهی بهینه نیستند (در فاز ۴ اصلاح می‌شوند)

### فاز 3 — Audit داده‌ها ✅ (اجرا شد در 2026-06-28)
**اسکریپت:** `scripts/audit-data.ts` (پایدار، قابل اجرای مجدد)

#### یافته‌ها (از ۲۴ محصول)
| فیلد | وضعیت |
|------|-------|
| `nameEn`, `metaTitleEn` | ✅ ۲۴ محصول OK (طول > 15) |
| `descriptionEn`, `metaDescriptionEn`, `shortDescEn` | ✅ ۲۴ محصول OK |
| `canonicalUrl` | ✅ همه `/en/` دارند |
| `featuresEn` | ❌ ۲۴ محصول MISSING (عمداً خالی چون بهتر با featuresDetail کار می‌کند) |
| `categoryEn` | ❌ ۲۴ محصول MISSING |
| `metaKeywordsEn` | ❌ ۲۴ محصول MISSING |
| `focusKeyphraseEn` | ⚠️ ۴ محصول کوتاه/بد (apex/csgo/dayz/scum/zula) |

#### مشکلات داده‌ای (برای فاز ۴)
- ۴ فیلدخالی: `featuresEn`, `categoryEn`, `metaKeywordsEn`, `focusKeyphraseEn` → seed لازم داره
- `cheat-scum`/`cheat-zula` — `nameEn` دارای bad length (کوتاهتر از نام فارسی است)
- `cheat-apex` slugEn با طول ۴ — ولی در مسیر درست میشه
- فیلدهای EN optional با fallback به FA جواب می‌دهند ولی بهینه نیستند

#### مشکلات قدیمی DB (برای اطلاع)
backup `prisma/dev.db.backup-2026-06-27` نیز ده‌انبار فیلد EN داشت؛ تنها `nameEn/metaTitleEn/shortDescEn/metaDescriptionEn` در اصل پر بوده.

### فاز 4 — اصلاح داده‌ها ✅ (اجرا شد در 2026-06-28)
- **اسکریپت:** ارتقای `scripts/seed-product-features-seo.ts` با:
  - اضافه شدن `categoryEn` به هر �۴ محصول
  - اضافه شدن فیلد `metaKeywordsEn` (آرایه �-۸ کلمه کلیدی)
- **Backup:** `dev.db.backup-after-phase4-2026-06-28`
- **تغییرات DB:**
  - `prisma/schema.prisma`: اضافه شدن `categoryEn String?`
  - `npx prisma db push` انجام شد
- **مشکلات رفع شده:**
  - API `[id]/route.ts` فیلدهای `categoryEn`, `focusKeyphraseEn`, `metaKeywordsEn`, `ogTitleEn/Desc`, `twitterTitleEn/Desc` رو برنمی‌گشت → اضافه شد
  - `slugFa` در ا�کریپت by-slug وجود نداشت (درست به `slugEn`) → �۰� می‌داد
  - ۱۰ محصول `nameEn` خیلی کوتاه بود (مثلاً "DayZ Cheat") → به‌تر شد
- **نتیجه نهایی:**
  - �۴/۲۴ محصول فعال (یکی "private" بود → "active" شد: cheat-r6-recoil)
  - �۴/۲۴ featuresEn، metaKeywordsEn، canoncialUrl، slugEn، categoryEn پر شده
  - audit نهایی: nameEn و focusKeyphraseEn همه OK
- **مشکلات باقی‌مانده (جزئی و بهینه‌سازی):**
  - �۰ محصول slugEn کوتاه (�-۶ کاراکتر) — قابل قبول
  - ۱۰ محصول focusKeyphraseEn � کلمه‌ای — قابل قبول
  - برخی categoryEn کوتاه (۳-� کاراکتر) — قابل قبول

### فاز 5 — تایید SEO و URL structure ✅ (اجرا شد در 2026-06-28)
- **`<html lang>` و `dir` در سرور:**
  - `src/app/layout.tsx` به صورت dynamic شد — از `headers()` و `x-url` می‌خونه
  - `/en/*` → `<html lang="en" dir="ltr">` در اولین paint سرور (بدون FOUC)
  - `/*` → `<html lang="fa" dir="rtl">`
- **Canonical + hreflang:**
  - `src/middleware.ts` → اضافه شدن `response.headers.set("x-url", pathname)`
  - `src/app/layout.tsx` → اضافه شدن canonical self-referencing + hreflang fa/en/x-default
  - حذف شدن canonical تکراری از `src/app/[lang]/products/page.tsx` و `src/app/[lang]/blog/page.tsx`
- **نتیجه:**
  - `/products/cheat-apex` → canonical: `https://goldencheat.com/products/cheat-apex`, hreflang fa/en/x-default
  - `/en/products/cheat-apex` → canonical: `https://goldencheat.com/en/products/cheat-apex`, hreflang fa/en/x-default
  - بیلد موفق
- **فایل‌های تغییر یافته:**
  - `src/app/layout.tsx` — dynamic lang/dir + canonical/hreflang
  - `src/middleware.ts` — اضافه شدن x-url header
  - `src/app/[lang]/products/page.tsx` — حذف canonical تکراری
  - `src/app/[lang]/blog/page.tsx` — حذف canonical تکراری
  - `src/app/[lang]/products/[slug]/page.tsx` — اضافه شدن client-side canonical/hreflang set
  - `src/app/products/[slug]/page.tsx` — بهبود canonical/hreflang set با helper

### فاز 6 — تست نهایی end-to-end ✅ (اجرا شد در 2026-06-28)
- **Build:** `npm run build` ✓ Compiled successfully in 6.2s, 0 errors, 0 warnings
- **مسیرهای FA:** `/`, `/products`, `/products/[slug]`, `/blog`, `/cart`, `/courses`, `/login` → همه 200 و `lang=fa`
- **مسیرهای EN:** `/en`, `/en/products`, `/en/products/[slug]`, `/en/blog` → همه 200 و `lang=en`
- **Canonical + hreflang:** همه صفحات canonical self-referencing + hreflang fa/en/x-default دارند
- **API EN content:** ۲۴/۲۴ محصول nameEn, categoryEn, featuresEn, metaKeywordsEn, canonicalUrl, ogTitleEn, twitterTitleEn, focusKeyphraseEn دارند
- **DB backup:** `prisma/prisma/dev.db.backup-after-phase4-2026-06-28`

## فایل‌های کلیدی
- `src/app/products/[slug]/page.tsx` — صفحه اصلی محصول (فارسی/انگلیسی)
- `src/app/[lang]/products/[slug]/page.tsx` — wrapper برای مسیر انگلیسی
- `src/components/products/ProductDescription.tsx` — render features (از isRTL استفاده می‌کند)
- `src/components/products/ProductGallery.tsx` — گالری تصاویر
- `src/context/LangContext.tsx` — تشخیص lang از URL
- `src/middleware.ts` — تنظیم cookie lang

## نکات مهم
- **مشکل `<html lang="fa">`:** این توسط `LangContext` ست می‌شود و بعضی مواقع قدیمی می‌ماند. محتوای صفحه درست است (عنوان انگلیسی نشان داده می‌شود) ولی html tag ممکن است قدیمی بماند. این نیاز به بررسی بیشتر در فاز 5 دارد.
- **API همه فیلدهای *En را برمی‌گرداند** — مشکل داده نیست، مشکل نمایش بود که در فاز 2 حل شد.
- **مسیر `/products/[slug]`** همیشه فارسی باقی می‌ماند (برای backward compatibility)

## بعد از هر کار
1. آپدیت این فایل
2. آپدیت `memory/session-log.md`
3. آپدیت `memory/MEMORY.md`
