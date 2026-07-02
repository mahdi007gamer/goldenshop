// ============================================================
// SEO Analysis Engine — 17+ checks with bilingual feedback
// ============================================================

export type SEOCategory = "critical" | "important" | "good-to-have";
export type SEOStatus = "pass" | "fail" | "warning" | "info";

export interface SEOCheckItem {
  id: string;
  category: SEOCategory;
  status: SEOStatus;
  title: string;
  titleFa: string;
  description: string;
  descriptionFa: string;
  value?: string | number;
  target?: string | number;
  score: number;
  maxScore: number;
}

export interface SEOAnalysisResult {
  totalScore: number;
  passCount: number;
  failCount: number;
  warningCount: number;
  checks: SEOCheckItem[];
  readabilityScore: number;
  suggestions: string[];
  suggestionsFA: string[];
}

export interface SEOInput {
  name: string;
  nameFa?: string;
  description?: string;
  descriptionFa?: string;
  slug: string;
  game: string;
  category: string;
  features?: string[];
  featuresFa?: string[];
  imageUrl?: string;
  galleryItems?: { url: string }[];
  galleryImages?: string[];
  pricingPlans?: { priceUSD?: number; price?: number }[];
  price?: number;
  metaTitle?: string;
  metaTitleFa?: string;
  metaDescription?: string;
  metaDescriptionFa?: string;
  focusKeyphrase?: string;
  focusKeyphraseFa?: string;
  metaKeywords?: string[];
  metaKeywordsFa?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  schemaType?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function wordCount(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function keyphraseDensity(text: string, keyphrase: string): number {
  if (!text || !keyphrase) return 0;
  const words = text.toLowerCase().split(/\s+/).length;
  const escaped = keyphrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = (text.toLowerCase().match(new RegExp(escaped, "g")) || []).length;
  return words > 0 ? (matches / words) * 100 : 0;
}

function readabilityScore(text: string): number {
  if (!text) return 0;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const words = wordCount(text);
  if (sentences === 0 || words === 0) return 0;
  const syllables = text.split(/[aeiouAEIOU]/).length - 1;
  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  return Math.min(100, Math.max(0, Math.round(score)));
}

// ── Main Analysis ────────────────────────────────────────────────────────────

export function analyzeSEO(input: SEOInput): SEOAnalysisResult {
  const checks: SEOCheckItem[] = [];
  const suggestions: string[] = [];
  const suggestionsFA: string[] = [];

  const kp = input.focusKeyphrase || input.name || "";
  const kpFa = input.focusKeyphraseFa || input.nameFa || "";
  const desc = input.description || "";
  const descFa = input.descriptionFa || "";
  const mt = input.metaTitle || "";
  const mtFa = input.metaTitleFa || "";
  const md = input.metaDescription || "";
  const mdFa = input.metaDescriptionFa || "";
  const slug = input.slug || "";
  const galleryCount = (input.galleryItems?.length || 0) + (input.galleryImages?.length || 0);
  const kwCount = input.metaKeywords?.length || 0;
  const kwFaCount = input.metaKeywordsFa?.length || 0;
  const featCount = input.features?.length || 0;
  const hasPricing = (input.pricingPlans && input.pricingPlans.length > 0) || (input.price != null && input.price > 0);
  const hasMainImage = !!input.imageUrl;
  const hasOgImage = !!input.ogImage || hasMainImage;

  // ── 1. Focus Keyphrase ─────────────────────────────────────────────────
  const kpOk = kp.length >= 3;
  checks.push({
    id: "focus-keyphrase",
    category: "critical",
    status: kpOk ? "pass" : "fail",
    title: "Focus Keyphrase Set",
    titleFa: "کلمه کلیدی اصلی تعیین شده",
    description: kpOk ? `Keyphrase: "${kp}"` : "Set a focus keyphrase to optimize for",
    descriptionFa: kpOk ? `کلمه کلیدی: "${kp}"` : "یک کلمه کلیدی اصلی برای بهینه‌سازی تعیین کنید",
    value: kp || undefined,
    score: kpOk ? 10 : 0,
    maxScore: 10,
  });

  // ── 2. Meta Title EN Length ────────────────────────────────────────────
  const mtLen = mt.length;
  const mtStatus: SEOStatus = mtLen === 0 ? "fail" : mtLen < 30 ? "warning" : mtLen > 60 ? "warning" : "pass";
  checks.push({
    id: "meta-title-en",
    category: "critical",
    status: mtStatus,
    title: "Meta Title (EN) Length",
    titleFa: "طول عنوان متا (انگلیسی)",
    description: mtLen === 0
      ? "Meta title is missing — critical for SEO"
      : `${mtLen} characters ${mtLen < 30 ? "(too short, min 30)" : mtLen > 60 ? "(too long, max 60)" : "(perfect!)"}`,
    descriptionFa: mtLen === 0
      ? "عنوان متا وجود ندارد — برای سئو حیاتی است"
      : `${mtLen} کاراکتر ${mtLen < 30 ? "(خیلی کوتاه)" : mtLen > 60 ? "(خیلی بلند)" : "(عالی!)"}`,
    value: mtLen,
    target: "30-60 chars",
    score: mtStatus === "pass" ? 8 : mtStatus === "warning" ? 4 : 0,
    maxScore: 8,
  });

  // ── 3. Meta Title EN — contains keyphrase ──────────────────────────────
  const mtHasKp = mt.toLowerCase().includes(kp.toLowerCase());
  checks.push({
    id: "meta-title-keyphrase",
    category: "critical",
    status: mt && mtHasKp ? "pass" : mt ? "fail" : "fail",
    title: "Keyphrase in Meta Title",
    titleFa: "کلمه کلیدی در عنوان متا",
    description: mtHasKp ? `"${kp}" found in meta title` : `Add "${kp}" to meta title`,
    descriptionFa: mtHasKp ? `"${kp}" در عنوان متا وجود دارد` : `"${kp}" را به عنوان متا اضافه کنید`,
    score: mtHasKp ? 8 : 0,
    maxScore: 8,
  });

  // ── 4. Meta Title — keyphrase at start ─────────────────────────────────
  const mtStartsWithKp = mt.toLowerCase().startsWith(kp.toLowerCase());
  checks.push({
    id: "meta-title-kp-start",
    category: "important",
    status: mtStartsWithKp ? "pass" : mt ? "warning" : "fail",
    title: "Keyphrase at Start of Title",
    titleFa: "کلمه کلیدی در ابتدای عنوان",
    description: mtStartsWithKp
      ? "Keyphrase appears at the beginning — excellent!"
      : "Move keyphrase to the beginning of meta title for better SEO",
    descriptionFa: mtStartsWithKp
      ? "کلمه کلیدی در ابتدا قرار دارد — عالی!"
      : "کلمه کلیدی را به ابتدای عنوان متا منتقل کنید",
    score: mtStartsWithKp ? 5 : 0,
    maxScore: 5,
  });

  // ── 5. Meta Description EN Length ──────────────────────────────────────
  const mdLen = md.length;
  const mdStatus: SEOStatus = mdLen === 0 ? "fail" : mdLen < 120 ? "warning" : mdLen > 160 ? "warning" : "pass";
  checks.push({
    id: "meta-desc-en",
    category: "critical",
    status: mdStatus,
    title: "Meta Description (EN) Length",
    titleFa: "طول توضیحات متا (انگلیسی)",
    description: mdLen === 0
      ? "Meta description is missing"
      : `${mdLen} chars ${mdLen < 120 ? "(too short, min 120)" : mdLen > 160 ? "(too long, max 160)" : "(perfect!)"}`,
    descriptionFa: mdLen === 0
      ? "توضیحات متا وجود ندارد"
      : `${mdLen} کاراکتر ${mdLen < 120 ? "(خیلی کوتاه)" : mdLen > 160 ? "(خیلی بلند)" : "(عالی!)"}`,
    value: mdLen,
    target: "120-160 chars",
    score: mdStatus === "pass" ? 8 : mdStatus === "warning" ? 3 : 0,
    maxScore: 8,
  });

  // ── 6. Meta Description — keyphrase ────────────────────────────────────
  const mdHasKp = md.toLowerCase().includes(kp.toLowerCase());
  checks.push({
    id: "meta-desc-keyphrase",
    category: "critical",
    status: mdHasKp ? "pass" : "fail",
    title: "Keyphrase in Meta Description",
    titleFa: "کلمه کلیدی در توضیحات متا",
    description: mdHasKp ? "Keyphrase present in meta description" : `Add "${kp}" to meta description`,
    descriptionFa: mdHasKp ? "کلمه کلیدی در توضیحات متا وجود دارد" : `"${kp}" را به توضیحات متا اضافه کنید`,
    score: mdHasKp ? 6 : 0,
    maxScore: 6,
  });

  // ── 7. Meta Title FA Length ────────────────────────────────────────────
  const mtFaLen = mtFa.length;
  const mtFaStatus: SEOStatus = mtFaLen >= 20 && mtFaLen <= 70 ? "pass" : mtFaLen === 0 ? "fail" : "warning";
  checks.push({
    id: "meta-title-fa",
    category: "critical",
    status: mtFaStatus,
    title: "Meta Title (FA) Length",
    titleFa: "طول عنوان متا (فارسی)",
    description: `${mtFaLen} chars (target: 20-70)`,
    descriptionFa: `${mtFaLen} کاراکتر (هدف: ۲۰-۷۰)`,
    value: mtFaLen,
    target: "20-70 chars",
    score: mtFaStatus === "pass" ? 6 : mtFaStatus === "warning" ? 3 : 0,
    maxScore: 6,
  });

  // ── 8. Meta Description FA Length ──────────────────────────────────────
  const mdFaLen = mdFa.length;
  const mdFaStatus: SEOStatus = mdFaLen >= 50 && mdFaLen <= 170 ? "pass" : mdFaLen === 0 ? "fail" : "warning";
  checks.push({
    id: "meta-desc-fa",
    category: "critical",
    status: mdFaStatus,
    title: "Meta Description (FA) Length",
    titleFa: "طول توضیحات متا (فارسی)",
    description: `${mdFaLen} chars (target: 50-170)`,
    descriptionFa: `${mdFaLen} کاراکتر (هدف: ۵۰-۱۷۰)`,
    value: mdFaLen,
    target: "50-170 chars",
    score: mdFaStatus === "pass" ? 6 : mdFaStatus === "warning" ? 3 : 0,
    maxScore: 6,
  });

  // ── 9. Description EN Word Count ───────────────────────────────────────
  const descWords = wordCount(desc);
  const descStatus: SEOStatus = descWords === 0 ? "fail" : descWords < 150 ? "warning" : descWords >= 300 ? "pass" : "info";
  checks.push({
    id: "description-length-en",
    category: "important",
    status: descStatus,
    title: "Description Word Count (EN)",
    titleFa: "تعداد کلمات توضیحات (انگلیسی)",
    description: `${descWords} words ${descWords < 150 ? "(min 150 recommended)" : descWords >= 300 ? "(excellent!)" : "(good, 300+ ideal)"}`,
    descriptionFa: `${descWords} کلمه`,
    value: descWords,
    target: "300+ words",
    score: descWords >= 300 ? 6 : descWords >= 150 ? 3 : 0,
    maxScore: 6,
  });

  // ── 10. Keyphrase Density ──────────────────────────────────────────────
  const density = keyphraseDensity(desc, kp);
  const densityStatus: SEOStatus = density === 0 ? "fail" : density < 0.5 ? "warning" : density > 3.0 ? "warning" : "pass";
  checks.push({
    id: "keyphrase-density",
    category: "important",
    status: densityStatus,
    title: "Keyphrase Density",
    titleFa: "چگالی کلمه کلیدی",
    description: `${density.toFixed(1)}% ${density < 0.5 ? "(too low, target 0.5-3%)" : density > 3 ? "(too high, keyword stuffing!)" : "(perfect 0.5-3%)"}`,
    descriptionFa: `${density.toFixed(1)}٪ ${density < 0.5 ? "(خیلی کم)" : density > 3 ? "(خیلی زیاد!)" : "(ایده‌آل)"}`,
    value: `${density.toFixed(1)}%`,
    target: "0.5-3%",
    score: densityStatus === "pass" ? 5 : density === 0 ? 0 : 2,
    maxScore: 5,
  });

  // ── 11. Keyphrase in First Paragraph ───────────────────────────────────
  const firstPara = desc.split("\n")[0] || "";
  const kpInFirstPara = firstPara.toLowerCase().includes(kp.toLowerCase());
  checks.push({
    id: "keyphrase-first-para",
    category: "important",
    status: kpInFirstPara ? "pass" : desc ? "fail" : "fail",
    title: "Keyphrase in First Paragraph",
    titleFa: "کلمه کلیدی در اولین پاراگراف",
    description: kpInFirstPara
      ? "Keyphrase appears in opening paragraph — great!"
      : "Add keyphrase to the first paragraph of description",
    descriptionFa: kpInFirstPara
      ? "کلمه کلیدی در اولین پاراگراف وجود دارد — عالی!"
      : "کلمه کلیدی را در اولین پاراگراف توضیحات اضافه کنید",
    score: kpInFirstPara ? 5 : 0,
    maxScore: 5,
  });

  // ── 12. Slug Format ────────────────────────────────────────────────────
  const slugOk = slug.length >= 3 && /^[a-z0-9-]+$/.test(slug) && slug.length <= 75;
  checks.push({
    id: "slug-format",
    category: "critical",
    status: slugOk ? "pass" : "warning",
    title: "URL Slug Format",
    titleFa: "فرمت URL (اسلاگ)",
    description: slug
      ? `/${slug} ${slugOk ? "(clean URL)" : "(use lowercase letters, numbers, hyphens only)"}`
      : "Slug is missing",
    descriptionFa: slug
      ? `/${slug} ${slugOk ? "(URL مناسب)" : "(فقط حروف کوچک، اعداد و خط تیره)"}`
      : "اسلاگ وجود ندارد",
    value: slug,
    score: slugOk ? 5 : 2,
    maxScore: 5,
  });

  // ── 13. Slug Keyphrase ─────────────────────────────────────────────────
  const slugKpCheck = kp.toLowerCase().replace(/\s+/g, "-");
  const slugHasKp = slug.toLowerCase().includes(slugKpCheck);
  checks.push({
    id: "slug-keyphrase",
    category: "important",
    status: slugHasKp ? "pass" : "warning",
    title: "Keyphrase in URL",
    titleFa: "کلمه کلیدی در URL",
    description: slugHasKp ? "URL contains the keyphrase — perfect!" : "Consider including keyphrase in URL slug",
    descriptionFa: slugHasKp ? "URL شامل کلمه کلیدی است — عالی!" : "کلمه کلیدی را در اسلاگ URL اضافه کنید",
    score: slugHasKp ? 4 : 0,
    maxScore: 4,
  });

  // ── 14. Main Image ─────────────────────────────────────────────────────
  checks.push({
    id: "main-image",
    category: "critical",
    status: hasMainImage ? "pass" : "fail",
    title: "Main Product Image",
    titleFa: "تصویر اصلی محصول",
    description: hasMainImage
      ? "Main image is set"
      : "Add a main product image (required for Google Shopping & rich results)",
    descriptionFa: hasMainImage ? "تصویر اصلی تنظیم شده" : "تصویر اصلی محصول را اضافه کنید (برای نتایج غنی گوگل ضروری است)",
    score: hasMainImage ? 5 : 0,
    maxScore: 5,
  });

  // ── 15. OG Image ───────────────────────────────────────────────────────
  checks.push({
    id: "og-image",
    category: "important",
    status: hasOgImage ? "pass" : "warning",
    title: "Open Graph Image (Social Share)",
    titleFa: "تصویر Open Graph (شبکه اجتماعی)",
    description: hasOgImage
      ? "OG image available for social sharing"
      : "Add OG image for better social media appearance",
    descriptionFa: hasOgImage
      ? "تصویر OG برای اشتراک‌گذاری شبکه اجتماعی موجود است"
      : "تصویر OG را برای ظاهر بهتر در شبکه‌های اجتماعی اضافه کنید",
    score: hasOgImage ? 4 : 0,
    maxScore: 4,
  });

  // ── 16. Gallery Count ──────────────────────────────────────────────────
  const galleryStatus: SEOStatus = galleryCount >= 3 ? "pass" : galleryCount > 0 ? "warning" : "fail";
  checks.push({
    id: "gallery-images",
    category: "good-to-have",
    status: galleryStatus,
    title: "Gallery Media Count",
    titleFa: "تعداد رسانه گالری",
    description: `${galleryCount} media items ${galleryCount < 3 ? "(add 3+ for rich results)" : "(great!)"}`,
    descriptionFa: `${galleryCount} آیتم رسانه ${galleryCount < 3 ? "(۳+ آیتم برای نتایج غنی اضافه کنید)" : "(عالی!)"}`,
    value: galleryCount,
    target: "3+",
    score: galleryCount >= 3 ? 3 : galleryCount > 0 ? 1 : 0,
    maxScore: 3,
  });

  // ── 17. Keywords Count ─────────────────────────────────────────────────
  const kwStatus: SEOStatus = kwCount >= 5 ? "pass" : kwCount > 0 ? "warning" : "fail";
  checks.push({
    id: "keywords",
    category: "good-to-have",
    status: kwStatus,
    title: "Meta Keywords Count",
    titleFa: "تعداد کلمات کلیدی متا",
    description: `${kwCount} keywords ${kwCount < 5 ? "(add 5-10 keywords)" : "(good!)"}`,
    descriptionFa: `${kwCount} کلمه کلیدی ${kwCount < 5 ? "(۵-۱۰ کلمه کلیدی اضافه کنید)" : "(خوب!)"}`,
    value: kwCount,
    target: "5-10",
    score: kwCount >= 5 ? 3 : kwCount > 0 ? 1 : 0,
    maxScore: 3,
  });

  // ── 18. Features Count ─────────────────────────────────────────────────
  const featStatus: SEOStatus = featCount >= 4 ? "pass" : featCount > 0 ? "warning" : "fail";
  checks.push({
    id: "features-list",
    category: "important",
    status: featStatus,
    title: "Product Features Listed",
    titleFa: "ویژگی‌های محصول",
    description: `${featCount} features ${featCount < 4 ? "(add 4+ for better content)" : "(great!)"}`,
    descriptionFa: `${featCount} ویژگی ${featCount < 4 ? "(۴+ ویژگی برای محتوای بهتر)" : "(عالی!)"}`,
    value: featCount,
    score: featCount >= 4 ? 4 : featCount > 0 ? 2 : 0,
    maxScore: 4,
  });

  // ── 19. Pricing Plans ──────────────────────────────────────────────────
  checks.push({
    id: "pricing-plans",
    category: "important",
    status: hasPricing ? "pass" : "warning",
    title: "Pricing Plans (Schema.org)",
    titleFa: "پلن‌های قیمت‌گذاری (داده ساختاریافته)",
    description: hasPricing
      ? "Pricing available — enables price rich results"
      : "Add pricing plans for Google Shopping integration",
    descriptionFa: hasPricing
      ? "قیمت‌گذاری موجود است — نتایج غنی قیمت را فعال می‌کند"
      : "پلن‌های قیمت را برای ادغام گوگل شاپینگ اضافه کنید",
    score: hasPricing ? 4 : 0,
    maxScore: 4,
  });

  // ── 20. Description FA Length ──────────────────────────────────────────
  const descFaWords = wordCount(descFa);
  const descFaStatus: SEOStatus = descFaWords >= 100 ? "pass" : descFaWords > 0 ? "warning" : "fail";
  checks.push({
    id: "description-length-fa",
    category: "important",
    status: descFaStatus,
    title: "Description Word Count (FA)",
    titleFa: "تعداد کلمات توضیحات (فارسی)",
    description: `${descFaWords} words (target 100+)`,
    descriptionFa: `${descFaWords} کلمه (هدف: ۱۰۰+)`,
    value: descFaWords,
    target: "100+ words",
    score: descFaWords >= 100 ? 4 : descFaWords > 0 ? 2 : 0,
    maxScore: 4,
  });

  // ── 21. OG Title ───────────────────────────────────────────────────────
  const hasOgTitle = !!input.ogTitle;
  checks.push({
    id: "og-title",
    category: "good-to-have",
    status: hasOgTitle ? "pass" : "warning",
    title: "Open Graph Title",
    titleFa: "عنوان Open Graph",
    description: hasOgTitle ? "OG title is set" : "Add OG title for better social sharing",
    descriptionFa: hasOgTitle ? "عنوان OG تنظیم شده" : "عنوان OG را برای اشتراک‌گذاری بهتر اضافه کنید",
    score: hasOgTitle ? 3 : 0,
    maxScore: 3,
  });

  // ── 22. Twitter Card ───────────────────────────────────────────────────
  const hasTwitter = !!input.twitterTitle || !!input.twitterDescription;
  checks.push({
    id: "twitter-card",
    category: "good-to-have",
    status: hasTwitter ? "pass" : "warning",
    title: "Twitter Card Data",
    titleFa: "داده‌های کارت توییتر",
    description: hasTwitter ? "Twitter card data is set" : "Add Twitter card data for better Twitter sharing",
    descriptionFa: hasTwitter ? "داده‌های کارت توییتر تنظیم شده" : "داده‌های کارت توییتر را اضافه کنید",
    score: hasTwitter ? 3 : 0,
    maxScore: 3,
  });

  // ── 23. Canonical URL ──────────────────────────────────────────────────
  const hasCanonical = !!input.canonicalUrl;
  checks.push({
    id: "canonical-url",
    category: "important",
    status: hasCanonical ? "pass" : "warning",
    title: "Canonical URL",
    titleFa: "URL کانونی",
    description: hasCanonical ? "Canonical URL is set" : "Set canonical URL to prevent duplicate content",
    descriptionFa: hasCanonical ? "URL کانونی تنظیم شده" : "URL کانونی را برای جلوگیری از محتوای تکراری تنظیم کنید",
    score: hasCanonical ? 3 : 0,
    maxScore: 3,
  });

  // ── 24. Focus Keyphrase FA ─────────────────────────────────────────────
  const kpFaOk = kpFa.length >= 2;
  checks.push({
    id: "focus-keyphrase-fa",
    category: "important",
    status: kpFaOk ? "pass" : "fail",
    title: "Focus Keyphrase (FA)",
    titleFa: "کلمه کلیدی اصلی (فارسی)",
    description: kpFaOk ? `FA keyphrase: "${kpFa}"` : "Set a Persian focus keyphrase",
    descriptionFa: kpFaOk ? `کلمه کلیدی فارسی: "${kpFa}"` : "یک کلمه کلیدی فارسی تعیین کنید",
    value: kpFa || undefined,
    score: kpFaOk ? 5 : 0,
    maxScore: 5,
  });

  // ── 25. Keywords FA ────────────────────────────────────────────────────
  const kwFaStatus: SEOStatus = kwFaCount >= 3 ? "pass" : kwFaCount > 0 ? "warning" : "fail";
  checks.push({
    id: "keywords-fa",
    category: "good-to-have",
    status: kwFaStatus,
    title: "Meta Keywords (FA)",
    titleFa: "کلمات کلیدی متا (فارسی)",
    description: `${kwFaCount} FA keywords ${kwFaCount < 3 ? "(add 3+)" : "(good!)"}`,
    descriptionFa: `${kwFaCount} کلمه کلیدی فارسی ${kwFaCount < 3 ? "(۳+ اضافه کنید)" : "(خوب!)"}`,
    value: kwFaCount,
    score: kwFaCount >= 3 ? 2 : kwFaCount > 0 ? 1 : 0,
    maxScore: 2,
  });

  // ── Compute Totals ──────────────────────────────────────────────────────
  const totalScore = checks.reduce((sum, c) => sum + c.score, 0);
  const maxPossible = checks.reduce((sum, c) => sum + c.maxScore, 0);
  const normalizedScore = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;

  const passCount = checks.filter((c) => c.status === "pass").length;
  const failCount = checks.filter((c) => c.status === "fail").length;
  const warningCount = checks.filter((c) => c.status === "warning").length;

  // Generate suggestions from failed critical checks
  const failedCritical = checks.filter((c) => c.category === "critical" && c.status === "fail");
  failedCritical.forEach((c) => {
    suggestions.push(c.description);
    suggestionsFA.push(c.descriptionFa);
  });

  return {
    totalScore: normalizedScore,
    passCount,
    failCount,
    warningCount,
    checks,
    readabilityScore: readabilityScore(desc),
    suggestions,
    suggestionsFA,
  };
}
