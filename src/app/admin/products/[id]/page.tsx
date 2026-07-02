"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Globe, FileText, Star, CheckCircle, AlertCircle, Loader2, ImageIcon, Upload, X, Plus, Trash2 } from "lucide-react";
import { toast } from "@/store/toast-store";

type LangTab = "fa" | "en";

interface ProductData {
  id: string;
  name: string;
  nameFa: string | null;
  nameEn: string | null;
  slug: string;
  slugEn: string | null;
  game: string;
  category: string;
  price: number;
  salePrice: number | null;
  priceDaily: number | null;
  priceWeekly: number | null;
  priceMonthly: number | null;
  priceLifetime: number | null;
  rating: number;
  reviewsCount: number;
  features: string;
  featuresFa: string | null;
  featuresEn: string | null;
  description: string;
  descriptionFa: string | null;
  descriptionEn: string | null;
  shortDesc: string | null;
  shortDescFa: string | null;
  shortDescEn: string | null;
  tags: string | null;
  tagsEn: string | null;
  isPopular: boolean;
  status: string;
  bypassRate: string;
  updateStatus: string;
  imageUrl: string | null;
  bannerImage: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  metaTitle: string | null;
  metaTitleFa: string | null;
  metaTitleEn: string | null;
  metaDescription: string | null;
  metaDescriptionFa: string | null;
  metaDescriptionEn: string | null;
  focusKeyphrase: string | null;
  focusKeyphraseFa: string | null;
  focusKeyphraseEn: string | null;
  metaKeywords: string | null;
  metaKeywordsFa: string | null;
  metaKeywordsEn: string | null;
  ogTitle: string | null;
  ogTitleEn: string | null;
  ogDescription: string | null;
  ogDescriptionEn: string | null;
  ogImage: string | null;
  twitterTitle: string | null;
  twitterTitleEn: string | null;
  twitterDescription: string | null;
  twitterDescriptionEn: string | null;
  twitterImage: string | null;
  canonicalUrl: string | null;
  schemaType: string;
}

const GAMES = ["Valorant", "CS2", "R6 Siege", "Dota 2", "Apex Legends", "Fortnite", "PUBG", "League of Legends"];
const CATEGORIES = ["Aimbot", "Wallhack", "ESP Overlay", "HWID Spoofer", "Skin Changer", "Radar", "Misc"];
const BYPASS_RATES = ["50%", "75%", "100%"];
const UPDATE_STATUSES = ["Undetected", "Detected", "Testing"];
const STATUSES = ["active", "inactive"];

function parseJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  if (typeof val === "string") {
    try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
  }
  return [];
}

export default function ProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [langTab, setLangTab] = useState<LangTab>("fa");
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const [product, setProduct] = useState<ProductData>({
    id: "",
    name: "",
    nameFa: null,
    nameEn: null,
    slug: "",
    slugEn: null,
    game: "Valorant",
    category: "Aimbot",
    price: 0,
    salePrice: null,
    priceDaily: null,
    priceWeekly: null,
    priceMonthly: null,
    priceLifetime: null,
    rating: 0,
    reviewsCount: 0,
    features: "",
    featuresFa: null,
    featuresEn: null,
    description: "",
    descriptionFa: null,
    descriptionEn: null,
    shortDesc: null,
    shortDescFa: null,
    shortDescEn: null,
    tags: null,
    tagsEn: null,
    isPopular: false,
    status: "active",
    bypassRate: "100%",
    updateStatus: "Undetected",
    imageUrl: null,
    bannerImage: null,
    videoUrl: null,
    audioUrl: null,
    metaTitle: null,
    metaTitleFa: null,
    metaTitleEn: null,
    metaDescription: null,
    metaDescriptionFa: null,
    metaDescriptionEn: null,
    focusKeyphrase: null,
    focusKeyphraseFa: null,
    focusKeyphraseEn: null,
    metaKeywords: null,
    metaKeywordsFa: null,
    metaKeywordsEn: null,
    ogTitle: null,
    ogTitleEn: null,
    ogDescription: null,
    ogDescriptionEn: null,
    ogImage: null,
    twitterTitle: null,
    twitterTitleEn: null,
    twitterDescription: null,
    twitterDescriptionEn: null,
    twitterImage: null,
    canonicalUrl: null,
    schemaType: "Product",
  });

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/products/${id}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        const d = json.data;
        setProduct({
          ...d,
          nameFa: d.nameFa || "",
          nameEn: d.nameEn || "",
          slugEn: d.slugEn || "",
          features: Array.isArray(d.features) ? d.features.join("\n") : (typeof d.features === "string" ? (JSON.parse(d.features || "[]") as string[]).join("\n") : ""),
          featuresFa: Array.isArray(d.featuresFa) ? d.featuresFa.join("\n") : (d.featuresFa ? (JSON.parse(d.featuresFa || "[]") as string[]).join("\n") : ""),
          featuresEn: Array.isArray(d.featuresEn) ? d.featuresEn.join("\n") : (d.featuresEn ? (JSON.parse(d.featuresEn || "[]") as string[]).join("\n") : ""),
          description: d.description || "",
          descriptionFa: d.descriptionFa || "",
          descriptionEn: d.descriptionEn || "",
          shortDesc: d.shortDesc || "",
          shortDescFa: d.shortDescFa || "",
          shortDescEn: d.shortDescEn || "",
          tags: Array.isArray(d.tags) ? d.tags.join(", ") : (d.tags ? (JSON.parse(d.tags || "[]") as string[]).join(", ") : ""),
          tagsEn: Array.isArray(d.tagsEn) ? d.tagsEn.join(", ") : (d.tagsEn ? (JSON.parse(d.tagsEn || "[]") as string[]).join(", ") : ""),
          metaTitle: d.metaTitle || "",
          metaTitleFa: d.metaTitleFa || "",
          metaTitleEn: d.metaTitleEn || "",
          metaDescription: d.metaDescription || "",
          metaDescriptionFa: d.metaDescriptionFa || "",
          metaDescriptionEn: d.metaDescriptionEn || "",
          focusKeyphrase: d.focusKeyphrase || "",
          focusKeyphraseFa: d.focusKeyphraseFa || "",
          focusKeyphraseEn: d.focusKeyphraseEn || "",
          metaKeywords: Array.isArray(d.metaKeywords) ? d.metaKeywords.join(", ") : "",
          metaKeywordsFa: Array.isArray(d.metaKeywordsFa) ? d.metaKeywordsFa.join(", ") : "",
          metaKeywordsEn: Array.isArray(d.metaKeywordsEn) ? d.metaKeywordsEn.join(", ") : "",
          ogTitle: d.ogTitle || "",
          ogTitleEn: d.ogTitleEn || "",
          ogDescription: d.ogDescription || "",
          ogDescriptionEn: d.ogDescriptionEn || "",
          twitterTitle: d.twitterTitle || "",
          twitterTitleEn: d.twitterTitleEn || "",
          twitterDescription: d.twitterDescription || "",
          twitterDescriptionEn: d.twitterDescriptionEn || "",
          canonicalUrl: d.canonicalUrl || "",
          schemaType: d.schemaType || "Product",
        });
      } else {
        toast.error("خطا", "محصول یافت نشد");
        router.push("/admin/products");
      }
    } catch {
      toast.error("خطا", "بارگذاری محصول با مشکل مواجه شد");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { loadProduct(); }, [loadProduct]);

  const updateField = (field: string, value: string | number | boolean | null) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!product.name.trim()) {
      toast.error("خطا", "نام محصول (فارسی) الزامی است");
      setLangTab("fa");
      return;
    }
    if (!product.game || !product.category || product.price === undefined) {
      toast.error("خطا", "بازی، دسته‌بندی و قیمت الزامی است");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: product.name,
        nameFa: product.nameFa || null,
        nameEn: product.nameEn || null,
        slug: product.slug,
        slugEn: product.slugEn || null,
        game: product.game,
        category: product.category,
        price: product.price,
        salePrice: product.salePrice,
        priceDaily: product.priceDaily,
        priceWeekly: product.priceWeekly,
        priceMonthly: product.priceMonthly,
        priceLifetime: product.priceLifetime,
        description: product.description,
        descriptionFa: product.descriptionFa || null,
        descriptionEn: product.descriptionEn || null,
        shortDesc: product.shortDesc || null,
        shortDescFa: product.shortDescFa || null,
        shortDescEn: product.shortDescEn || null,
        features: product.features.split("\n").filter(Boolean),
        featuresFa: product.featuresFa ? product.featuresFa.split("\n").filter(Boolean) : [],
        featuresEn: product.featuresEn ? product.featuresEn.split("\n").filter(Boolean) : [],
        tags: product.tags ? product.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        tagsEn: product.tagsEn ? product.tagsEn.split(",").map((t) => t.trim()).filter(Boolean) : [],
        isPopular: product.isPopular,
        status: product.status,
        bypassRate: product.bypassRate,
        updateStatus: product.updateStatus,
        imageUrl: product.imageUrl || null,
        bannerImage: product.bannerImage || null,
        videoUrl: product.videoUrl || null,
        audioUrl: product.audioUrl || null,
        metaTitle: product.metaTitle || null,
        metaTitleFa: product.metaTitleFa || null,
        metaTitleEn: product.metaTitleEn || null,
        metaDescription: product.metaDescription || null,
        metaDescriptionFa: product.metaDescriptionFa || null,
        metaDescriptionEn: product.metaDescriptionEn || null,
        focusKeyphrase: product.focusKeyphrase || null,
        focusKeyphraseFa: product.focusKeyphraseFa || null,
        focusKeyphraseEn: product.focusKeyphraseEn || null,
        metaKeywords: product.metaKeywords ? product.metaKeywords.split(",").map((t) => t.trim()).filter(Boolean) : [],
        metaKeywordsFa: product.metaKeywordsFa ? product.metaKeywordsFa.split(",").map((t) => t.trim()).filter(Boolean) : [],
        metaKeywordsEn: product.metaKeywordsEn ? product.metaKeywordsEn.split(",").map((t) => t.trim()).filter(Boolean) : [],
        ogTitle: product.ogTitle || null,
        ogTitleEn: product.ogTitleEn || null,
        ogDescription: product.ogDescription || null,
        ogDescriptionEn: product.ogDescriptionEn || null,
        ogImage: product.ogImage || null,
        twitterTitle: product.twitterTitle || null,
        twitterTitleEn: product.twitterTitleEn || null,
        twitterDescription: product.twitterDescription || null,
        twitterDescriptionEn: product.twitterDescriptionEn || null,
        twitterImage: product.twitterImage || null,
        canonicalUrl: product.canonicalUrl || null,
        schemaType: product.schemaType,
      };
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("موفق", "محصول به‌روزرسانی شد");
      } else {
        toast.error("خطا", json.error?.message || "ذخیره با مشکل مواجه شد");
      }
    } catch {
      toast.error("خطا", "ذخیره محصول با مشکل مواجه شد");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 size={20} className="animate-spin text-gold" />
          <span>در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  const isFa = langTab === "fa";
  const dir = isFa ? "rtl" : "ltr";

  return (
    <div className="min-h-screen bg-obsidian p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/products")}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText size={20} className="text-gold" />
                ویرایش: {product.name || product.nameEn || "—"}
              </h1>
              <p className="text-xs text-gray-500">
                {product.game} • {product.category} • <span className="font-mono">{product.slug}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-gold text-obsidian font-bold text-sm rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "در حال ذخیره..." : "ذخیره"}
          </button>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center gap-2 bg-obsidian-light rounded-xl border border-white/5 p-1">
          <button
            onClick={() => setLangTab("fa")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              isFa ? "bg-gold/10 text-gold border border-gold/20" : "text-gray-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <Globe size={12} />
            فارسی
            {!product.name.trim() && <span className="text-danger text-[10px]">*</span>}
          </button>
          <button
            onClick={() => setLangTab("en")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              !isFa ? "bg-cyber/10 text-cyber border border-cyber/20" : "text-gray-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <Globe size={12} />
            English
          </button>
        </div>

        {/* Product Public URLs — quick view of FA/EN pages */}
        {product.slug && (
          <div className="bg-obsidian-light rounded-xl border border-white/5 p-3">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">لینک‌های عمومی</h3>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gold font-bold w-6">FA</span>
                <a
                  href={`/fa/products/${product.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-gray-400 hover:text-cyber transition-colors font-mono truncate"
                >
                  /fa/products/{product.slug}
                </a>
              </div>
              {product.slugEn && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-cyber font-bold w-6">EN</span>
                  <a
                    href={`/en/products/${product.slugEn}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-gray-400 hover:text-cyber transition-colors font-mono truncate"
                  >
                    /en/products/{product.slugEn}
                  </a>
                </div>
              )}
              {!product.slugEn && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-600 font-bold w-6">EN</span>
                  <span className="text-[11px] text-gray-600 italic">Slug (EN) تنظیم نشده</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Basic Info */}
            <div className="bg-obsidian-light rounded-xl border border-white/5 p-4 space-y-3" dir={dir}>
              <h2 className="text-xs font-bold text-gold flex items-center gap-2">
                <FileText size={14} />
                {isFa ? "اطلاعات پایه" : "Basic Information"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">
                    {isFa ? "نام محصول (فارسی)" : "Product Name (FA)"}
                    {isFa && <span className="text-danger ml-1">*</span>}
                  </label>
                  <input
                    type="text"
                    value={isFa ? product.name : (product.nameFa || "")}
                    onChange={(e) => updateField(isFa ? "name" : "nameFa", e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none"
                    placeholder={isFa ? "نام محصول به فارسی..." : "Product name in Farsi..."}
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">
                    {isFa ? "نام محصول (انگلیسی)" : "Product Name (EN)"}
                  </label>
                  <input
                    type="text"
                    value={isFa ? (product.nameEn || "") : product.name}
                    onChange={(e) => updateField(isFa ? "nameEn" : "name", e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none"
                    placeholder={isFa ? "Product name in English..." : "Product name in English..."}
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Slug (FA)</label>
                  <input
                    type="text"
                    value={product.slug}
                    onChange={(e) => updateField("slug", e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white font-mono focus:border-gold/30 focus:outline-none"
                    placeholder="product-slug"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Slug (EN)</label>
                  <input
                    type="text"
                    value={product.slugEn || ""}
                    onChange={(e) => updateField("slugEn", e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white font-mono focus:border-gold/30 focus:outline-none"
                    placeholder="product-slug-en"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">{isFa ? "بازی" : "Game"}</label>
                  <select
                    value={product.game}
                    onChange={(e) => updateField("game", e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none"
                  >
                    {GAMES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">{isFa ? "دسته‌بندی" : "Category"}</label>
                  <select
                    value={product.category}
                    onChange={(e) => updateField("category", e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-obsidian-light rounded-xl border border-white/5 p-4 space-y-3" dir={dir}>
              <h2 className="text-xs font-bold text-gold flex items-center gap-2">
                <Star size={14} />
                {isFa ? "قیمت‌گذاری (دلار)" : "Pricing (USD)"}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">{isFa ? "قیمت پایه ($)" : "Base Price ($)"}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={product.price != null ? product.price : 0}
                    onChange={(e) => updateField("price", parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">{isFa ? "قیمت حراج ($)" : "Sale Price ($)"}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={product.salePrice != null ? product.salePrice : ""}
                    onChange={(e) => updateField("salePrice", e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none"
                    placeholder="—"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">{isFa ? "روزانه ($)" : "Daily ($)"}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={product.priceDaily != null ? product.priceDaily : ""}
                    onChange={(e) => updateField("priceDaily", e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none"
                    placeholder="—"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">{isFa ? "هفتگی ($)" : "Weekly ($)"}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={product.priceWeekly != null ? product.priceWeekly : ""}
                    onChange={(e) => updateField("priceWeekly", e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none"
                    placeholder="—"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">{isFa ? "ماهانه ($)" : "Monthly ($)"}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={product.priceMonthly != null ? product.priceMonthly : ""}
                    onChange={(e) => updateField("priceMonthly", e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none"
                    placeholder="—"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">{isFa ? "مادام‌العمر ($)" : "Lifetime ($)"}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={product.priceLifetime != null ? product.priceLifetime : ""}
                    onChange={(e) => updateField("priceLifetime", e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none"
                    placeholder="—"
                  />
                </div>
              </div>
            </div>

            {/* Short Description */}
            <div className="bg-obsidian-light rounded-xl border border-white/5 p-4 space-y-3" dir={dir}>
              <h2 className="text-xs font-bold text-gold flex items-center gap-2">
                <FileText size={14} />
                {isFa ? "توضیحات کوتاه" : "Short Description"}
              </h2>
              <textarea
                value={isFa ? (product.shortDesc || "") : (product.shortDescEn || "")}
                onChange={(e) => updateField(isFa ? "shortDesc" : "shortDescEn", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none resize-none"
                placeholder={isFa ? "توضیح کوتاهی از محصول..." : "Brief product description..."}
              />
            </div>

            {/* Description */}
            <div className="bg-obsidian-light rounded-xl border border-white/5 p-4 space-y-3" dir={dir}>
              <h2 className="text-xs font-bold text-gold flex items-center gap-2">
                <FileText size={14} />
                {isFa ? "توضیحات کامل" : "Full Description"}
              </h2>
              <textarea
                value={isFa ? product.description : (product.descriptionEn || "")}
                onChange={(e) => updateField(isFa ? "description" : "descriptionEn", e.target.value)}
                rows={6}
                className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none resize-y"
                placeholder={isFa ? "توضیحات کامل محصول..." : "Full product description..."}
              />
            </div>

            {/* Features */}
            <div className="bg-obsidian-light rounded-xl border border-white/5 p-4 space-y-3" dir={dir}>
              <h2 className="text-xs font-bold text-gold flex items-center gap-2">
                <Star size={14} />
                {isFa ? "ویژگی‌ها" : "Features"}
                <span className="text-[10px] text-gray-500 font-normal">
                  ({isFa ? "هر خط یک ویژگی" : "One per line"})
                </span>
              </h2>
              <textarea
                value={isFa ? product.features : (product.featuresEn || "")}
                onChange={(e) => updateField(isFa ? "features" : "featuresEn", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none resize-none font-mono"
                placeholder={isFa ? "ویژگی ۱\nویژگی ۲\nویژگی ۳" : "Feature 1\nFeature 2\nFeature 3"}
                dir="ltr"
              />
            </div>

            {/* Tags */}
            <div className="bg-obsidian-light rounded-xl border border-white/5 p-4 space-y-3" dir={dir}>
              <h2 className="text-xs font-bold text-gold flex items-center gap-2">
                <Star size={14} />
                {isFa ? "برچسب‌ها" : "Tags"}
                <span className="text-[10px] text-gray-500 font-normal">
                  ({isFa ? "با کاما جدا کنید" : "Comma-separated"})
                </span>
              </h2>
              <input
                type="text"
                value={isFa ? (product.tags || "") : (product.tagsEn || "")}
                onChange={(e) => updateField(isFa ? "tags" : "tagsEn", e.target.value)}
                className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none"
                placeholder={isFa ? "tag1, tag2, tag3" : "tag1, tag2, tag3"}
                dir="ltr"
              />
            </div>

            {/* Media */}
            <div className="bg-obsidian-light rounded-xl border border-white/5 p-4 space-y-3" dir={dir}>
              <h2 className="text-xs font-bold text-gold flex items-center gap-2">
                <ImageIcon size={14} />
                {isFa ? "تصویر و مدیا" : "Image & Media"}
              </h2>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">{isFa ? "تصویر محصول" : "Product Image"}</label>
                <input
                  type="text"
                  value={product.imageUrl || ""}
                  onChange={(e) => updateField("imageUrl", e.target.value || null)}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none"
                  placeholder="/images/product.png"
                  dir="ltr"
                />
                {product.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt="Product" className="mt-2 h-20 rounded-lg border border-white/10 object-cover" />
                )}
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">{isFa ? "بنر تبلیغاتی" : "Banner Image"}</label>
                <input
                  type="text"
                  value={product.bannerImage || ""}
                  onChange={(e) => updateField("bannerImage", e.target.value || null)}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none"
                  placeholder="/images/banner.png"
                  dir="ltr"
                />
                {product.bannerImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.bannerImage} alt="Banner" className="mt-2 h-16 w-48 rounded-lg border border-white/10 object-cover" />
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Video URL</label>
                  <input
                    type="text"
                    value={product.videoUrl || ""}
                    onChange={(e) => updateField("videoUrl", e.target.value || null)}
                    className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none"
                    placeholder="/video/demo.mp4"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Audio URL</label>
                  <input
                    type="text"
                    value={product.audioUrl || ""}
                    onChange={(e) => updateField("audioUrl", e.target.value || null)}
                    className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none"
                    placeholder="/audio/demo.mp3"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Publish Settings */}
            <div className="bg-obsidian-light rounded-xl border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-gold">
                {isFa ? "تنظیمات انتشار" : "Publish Settings"}
              </h3>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">{isFa ? "وضعیت" : "Status"}</label>
                <select
                  value={product.status}
                  onChange={(e) => updateField("status", e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s === "active" ? (isFa ? "فعال" : "Active") : (isFa ? "غیرفعال" : "Inactive")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">{isFa ? "نرخ دورزدن انتی‌چیت" : "Bypass Rate"}</label>
                <select
                  value={product.bypassRate}
                  onChange={(e) => updateField("bypassRate", e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
                >
                  {BYPASS_RATES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">{isFa ? "وضعیت آپدیت" : "Update Status"}</label>
                <select
                  value={product.updateStatus}
                  onChange={(e) => updateField("updateStatus", e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
                >
                  {UPDATE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={product.isPopular}
                  onChange={(e) => updateField("isPopular", e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-obsidian text-gold focus:ring-gold/30"
                />
                <label htmlFor="isPopular" className="text-xs text-gray-300">
                  {isFa ? "محصول محبوب" : "Popular Product"} <Star size={10} className="inline text-gold" />
                </label>
              </div>
            </div>

            {/* SEO FA */}
            <div className="bg-obsidian-light rounded-xl border border-white/5 p-4 space-y-3" dir={dir}>
              <h3 className="text-xs font-bold text-gold">SEO — {isFa ? "فارسی" : "English"}</h3>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Meta Title</label>
                <input
                  type="text"
                  value={isFa ? (product.metaTitle || "") : (product.metaTitleEn || "")}
                  onChange={(e) => updateField(isFa ? "metaTitle" : "metaTitleEn", e.target.value || null)}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
                  dir={dir}
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Meta Description</label>
                <textarea
                  value={isFa ? (product.metaDescription || "") : (product.metaDescriptionEn || "")}
                  onChange={(e) => updateField(isFa ? "metaDescription" : "metaDescriptionEn", e.target.value || null)}
                  rows={2}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none resize-none"
                  dir={dir}
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Focus Keyphrase</label>
                <input
                  type="text"
                  value={isFa ? (product.focusKeyphrase || "") : (product.focusKeyphraseEn || "")}
                  onChange={(e) => updateField(isFa ? "focusKeyphrase" : "focusKeyphraseEn", e.target.value || null)}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
                  dir={dir}
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Meta Keywords</label>
                <input
                  type="text"
                  value={isFa ? (product.metaKeywords || "") : (product.metaKeywordsEn || "")}
                  onChange={(e) => updateField(isFa ? "metaKeywords" : "metaKeywordsEn", e.target.value || null)}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
                  placeholder="kw1, kw2, kw3"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Open Graph */}
            <div className="bg-obsidian-light rounded-xl border border-white/5 p-4 space-y-3" dir={dir}>
              <h3 className="text-xs font-bold text-gold">Open Graph</h3>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">OG Title</label>
                <input
                  type="text"
                  value={isFa ? (product.ogTitle || "") : (product.ogTitleEn || "")}
                  onChange={(e) => updateField(isFa ? "ogTitle" : "ogTitleEn", e.target.value || null)}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
                  dir={dir}
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">OG Description</label>
                <textarea
                  value={isFa ? (product.ogDescription || "") : (product.ogDescriptionEn || "")}
                  onChange={(e) => updateField(isFa ? "ogDescription" : "ogDescriptionEn", e.target.value || null)}
                  rows={2}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none resize-none"
                  dir={dir}
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">OG Image</label>
                <input
                  type="text"
                  value={product.ogImage || ""}
                  onChange={(e) => updateField("ogImage", e.target.value || null)}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
                  placeholder="/images/og.png"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Schema Type</label>
                <select
                  value={product.schemaType}
                  onChange={(e) => updateField("schemaType", e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
                >
                  {["Product", "SoftwareApplication", "VideoGame", "Offer", "AggregateOffer"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Completion Status */}
            <div className="bg-obsidian-light rounded-xl border border-white/5 p-4 space-y-2">
              <h3 className="text-xs font-bold text-gold">{isFa ? "وضعیت تکمیل" : "Completion"}</h3>
              <CompletionRow label={isFa ? "نام فارسی" : "FA Name"} filled={!!product.name.trim()} required />
              <CompletionRow label={isFa ? "نام انگلیسی" : "EN Name"} filled={!!(product.nameEn || "").trim()} />
              <CompletionRow label={isFa ? "توضیحات فارسی" : "FA Description"} filled={!!product.description.trim()} />
              <CompletionRow label={isFa ? "توضیحات انگلیسی" : "EN Description"} filled={!!(product.descriptionEn || "").trim()} />
              <CompletionRow label="Slug" filled={!!product.slug.trim()} required />
              <CompletionRow label={isFa ? "قیمت" : "Price"} filled={product.price > 0} required />
              <div className="border-t border-white/5 my-1" />
              <CompletionRow label={isFa ? "ویژگی‌های فارسی" : "FA Features"} filled={!!product.features.trim()} />
              <CompletionRow label={isFa ? "ویژگی‌های انگلیسی" : "EN Features"} filled={!!(product.featuresEn || "").trim()} />
              <CompletionRow label="Meta Title" filled={!!(product.metaTitle || "").trim()} />
              <CompletionRow label="Meta Description" filled={!!(product.metaDescription || "").trim()} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompletionRow({ label, filled, required }: { label: string; filled: boolean; required?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-gray-400">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </span>
      <span className={`text-[10px] ${filled ? "text-success" : required ? "text-danger" : "text-gray-600"}`}>
        {filled ? <CheckCircle size={10} /> : required ? <AlertCircle size={10} /> : "—"}
      </span>
    </div>
  );
}
