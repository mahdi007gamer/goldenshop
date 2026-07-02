"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, Upload, ImageIcon, X, Plus, Trash2,
  RefreshCw, FileText, CreditCard, Settings, Eye, Search, Link2,
  Shield, Zap, Clock, Cpu, Crosshair, Palette, Radio, Star,
  CheckCircle, Download, Headphones, Target, Lock, Wifi,
  Monitor, Gamepad2, Brain, Rocket, LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "@/store/toast-store";
import { TipTapEditor } from "@/components/ui/TipTapEditor";
import { SEOAnalyzer } from "@/components/admin/seo/SEOAnalyzer";
import { SEOFields } from "@/components/admin/seo/SEOFields";

const ICON_OPTIONS = [
  "Shield", "Zap", "Clock", "Cpu", "Eye", "Crosshair",
  "Palette", "Radio", "Star", "CheckCircle", "Download",
  "RefreshCw", "Headphones", "Target", "Lock", "Wifi",
  "Monitor", "Gamepad2", "Brain", "Rocket",
] as const;

const ICON_MAP: Record<string, LucideIcon> = {
  Shield, Zap, Clock, Cpu, Eye, Crosshair,
  Palette, Radio, Star, CheckCircle, Download,
  RefreshCw, Headphones, Target, Lock, Wifi,
  Monitor, Gamepad2, Brain, Rocket,
};

const SCHEMA_TYPES = [
  "Product",
  "SoftwareApplication",
  "VideoGame",
  "Offer",
  "AggregateOffer",
];

interface GalleryItem {
  url: string;
  captionFa?: string;
  captionEn?: string;
  order: number;
}

interface FeatureDetail {
  titleFa: string;
  titleEn: string;
  descriptionFa?: string;
  descriptionEn?: string;
  icon: string;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [nameFa, setNameFa] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEn, setSlugEn] = useState("");
  const [game, setGame] = useState("Valorant");
  const [category, setCategory] = useState("Aimbot");
  const [categoryEn, setCategoryEn] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [priceDaily, setPriceDaily] = useState("");
  const [priceWeekly, setPriceWeekly] = useState("");
  const [priceMonthly, setPriceMonthly] = useState("");
  const [priceLifetime, setPriceLifetime] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionFa, setDescriptionFa] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [shortDescFa, setShortDescFa] = useState("");
  const [shortDescEn, setShortDescEn] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [subtitleEn, setSubtitleEn] = useState("");
  const [highlightTagFa, setHighlightTagFa] = useState("");
  const [highlightTagEn, setHighlightTagEn] = useState("");
  const [features, setFeatures] = useState("");
  const [featuresFa, setFeaturesFa] = useState("");
  const [featuresEn, setFeaturesEn] = useState("");
  const [bypassRate, setBypassRate] = useState("100%");
  const [updateStatus, setUpdateStatus] = useState("Undetected");
  const [status, setStatus] = useState("active");
  const [imageUrl, setImageUrl] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [featuresDetail, setFeaturesDetail] = useState<FeatureDetail[]>([]);
  const [isPopular, setIsPopular] = useState(false);
  const [galleryInput, setGalleryInput] = useState("");

  // Games list — synced with admin Games tab
  const [games, setGames] = useState<Array<{ id: string; name: string; nameEn: string | null; accentColor: string | null }>>([]);
  const [gamesLoading, setGamesLoading] = useState(true);

  // SEO state — basic
  const [metaTitle, setMetaTitle] = useState("");
  const [metaTitleFa, setMetaTitleFa] = useState("");
  const [metaTitleEn, setMetaTitleEn] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaDescriptionFa, setMetaDescriptionFa] = useState("");
  const [metaDescriptionEn, setMetaDescriptionEn] = useState("");
  const [focusKeyphrase, setFocusKeyphrase] = useState("");
  const [focusKeyphraseFa, setFocusKeyphraseFa] = useState("");
  const [focusKeyphraseEn, setFocusKeyphraseEn] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [schemaType, setSchemaType] = useState("Product");
  const [ogImageUploading, setOgImageUploading] = useState(false);

  // SEO state — new fields
  const [metaKeywords, setMetaKeywords] = useState<string[]>([]);
  const [metaKeywordsFa, setMetaKeywordsFa] = useState<string[]>([]);
  const [metaKeywordsEn, setMetaKeywordsEn] = useState<string[]>([]);
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogTitleEn, setOgTitleEn] = useState("");
  const [ogDescriptionEn, setOgDescriptionEn] = useState("");
  const [twitterTitle, setTwitterTitle] = useState("");
  const [twitterDescription, setTwitterDescription] = useState("");
  const [twitterTitleEn, setTwitterTitleEn] = useState("");
  const [twitterDescriptionEn, setTwitterDescriptionEn] = useState("");
  const [twitterImage, setTwitterImage] = useState("");

  const imageRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const ogImageRef = useRef<HTMLInputElement>(null);

  const productId = params.id as string;

  // Load product
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/products/${productId}`, { credentials: "include" });
        const json = await res.json();
        if (!json.success) throw new Error("Product not found");
        const p = json.data;
        setName(p.name || "");
        setNameFa(p.nameFa || "");
        setNameEn(p.nameEn || "");
        setSlug(p.slug || "");
        setSlugEn(p.slugEn || "");
        setGame(p.game || "Valorant");
        setCategory(p.category || "Aimbot");
        setCategoryEn(p.categoryEn || "");
        setPrice(p.price != null ? String(p.price) : "");
        setSalePrice(p.salePrice != null ? String(p.salePrice) : "");
        setPriceDaily(p.priceDaily != null ? String(p.priceDaily) : "");
        setPriceWeekly(p.priceWeekly != null ? String(p.priceWeekly) : "");
        setPriceMonthly(p.priceMonthly != null ? String(p.priceMonthly) : "");
        setPriceLifetime(p.priceLifetime != null ? String(p.priceLifetime) : "");
        setDescription(p.description || "");
        setDescriptionFa(p.descriptionFa || "");
        setDescriptionEn(p.descriptionEn || "");
        setShortDesc(p.shortDesc || "");
        setShortDescFa(p.shortDescFa || "");
        setShortDescEn(p.shortDescEn || "");
        setSubtitle(p.subtitle || "");
        setSubtitleEn(p.subtitleEn || "");
        setHighlightTagFa((p as any).highlightTagFa || "");
        setHighlightTagEn((p as any).highlightTagEn || "");
        setFeatures(Array.isArray(p.features) ? p.features.join("\n") : "");
        setFeaturesFa(Array.isArray(p.featuresFa) ? p.featuresFa.join("\n") : "");
        setFeaturesEn(Array.isArray(p.featuresEn) ? p.featuresEn.join("\n") : "");
        setBypassRate(p.bypassRate || "100%");
        setUpdateStatus(p.updateStatus || "Undetected");
        setStatus(p.status || "active");
        setImageUrl(p.imageUrl || "");
        setBannerImage(p.bannerImage || "");
        setVideoUrl(p.videoUrl || "");
        setAudioUrl(p.audioUrl || "");
        const loadedGalleryItems = Array.isArray(p.galleryItems) ? p.galleryItems : [];
        const loadedGalleryImages = Array.isArray(p.galleryImages) ? p.galleryImages : [];
        setGalleryItems(loadedGalleryItems);
        setGalleryImages(loadedGalleryItems.length > 0 ? [] : loadedGalleryImages);
        setFeaturesDetail(Array.isArray(p.featuresDetail) ? p.featuresDetail : []);
        setIsPopular(p.isPopular || false);
        // SEO basic
        setMetaTitle(p.metaTitle || "");
        setMetaTitleFa(p.metaTitleFa || "");
        setMetaTitleEn(p.metaTitleEn || "");
        setMetaDescription(p.metaDescription || "");
        setMetaDescriptionFa(p.metaDescriptionFa || "");
        setMetaDescriptionEn(p.metaDescriptionEn || "");
        setFocusKeyphrase(p.focusKeyphrase || "");
        setFocusKeyphraseFa(p.focusKeyphraseFa || "");
        setFocusKeyphraseEn(p.focusKeyphraseEn || "");
        setCanonicalUrl(p.canonicalUrl || "");
        setOgImage(p.ogImage || "");
        setSchemaType(p.schemaType || "Product");
        // SEO new fields
        setMetaKeywords(Array.isArray(p.metaKeywords) ? p.metaKeywords : []);
        setMetaKeywordsFa(Array.isArray(p.metaKeywordsFa) ? p.metaKeywordsFa : []);
        setMetaKeywordsEn(Array.isArray(p.metaKeywordsEn) ? p.metaKeywordsEn : []);
        setOgTitle(p.ogTitle || "");
        setOgDescription(p.ogDescription || "");
        setOgTitleEn(p.ogTitleEn || "");
        setOgDescriptionEn(p.ogDescriptionEn || "");
        setTwitterTitle(p.twitterTitle || "");
        setTwitterDescription(p.twitterDescription || "");
        setTwitterTitleEn(p.twitterTitleEn || "");
        setTwitterDescriptionEn(p.twitterDescriptionEn || "");
        setTwitterImage(p.twitterImage || "");
      } catch (err) {
        toast.error("Error", err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    }
    if (productId) load();
  }, [productId]);

  // Fetch games list from admin DB (synced)
  useEffect(() => {
    fetch("/api/games")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setGames(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setGamesLoading(false));
  }, []);

  const uploadFile = useCallback(async (file: File, type: "image" | "video" | "audio" | "file"): Promise<string | null> => {
    setUploadingField(type);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) {
        toast.success("Upload successful", `${type} uploaded successfully`);
        return json.data.url;
      } else {
        toast.error("Error", json.error?.message || "Upload failed");
        return null;
      }
    } catch {
      toast.error("Error", "Upload failed");
      return null;
    } finally {
      setUploadingField(null);
    }
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    const url = await uploadFile(file, "image");
    if (url) setImageUrl(url);
    setImageUploading(false);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file, "image");
    if (url) setBannerImage(url);
  };

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOgImageUploading(true);
    const url = await uploadFile(file, "image");
    if (url) setOgImage(url);
    setOgImageUploading(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadFile(file, "image");
      if (url) newUrls.push(url);
    }
    if (newUrls.length > 0) {
      setGalleryImages((prev) => [...prev, ...newUrls]);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file, "video");
    if (url) setVideoUrl(url);
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file, "audio");
    if (url) setAudioUrl(url);
  };

  const addGalleryItem = () => {
    if (!galleryInput.trim()) return;
    setGalleryItems((prev) => [...prev, { url: galleryInput.trim(), captionFa: "", captionEn: "", order: prev.length }]);
    setGalleryInput("");
  };

  const removeGalleryItem = (index: number) => {
    setGalleryItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addFeatureDetail = () => {
    setFeaturesDetail((prev) => [...prev, { titleFa: "", titleEn: "", descriptionFa: "", descriptionEn: "", icon: "Shield" }]);
  };

  const removeFeatureDetail = (index: number) => {
    setFeaturesDetail((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFeatureDetail = (index: number, field: keyof FeatureDetail, value: string) => {
    setFeaturesDetail((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  // ── Unified form data for SEO components ──────────────────────────────────

  const seoFormData = {
    name, nameFa, nameEn, description, descriptionFa, descriptionEn,
    slug, slugEn, game, category, categoryEn,
    features: features.split("\n").filter(Boolean),
    featuresFa: featuresFa.split("\n").filter(Boolean),
    featuresEn: featuresEn.split("\n").filter(Boolean),
    imageUrl, galleryItems, galleryImages,
    price: parseFloat(price) || 0,
    metaTitle, metaTitleFa, metaTitleEn,
    metaDescription, metaDescriptionFa, metaDescriptionEn,
    focusKeyphrase, focusKeyphraseFa, focusKeyphraseEn,
    metaKeywords, metaKeywordsFa, metaKeywordsEn,
    ogTitle, ogDescription, ogTitleEn, ogDescriptionEn, ogImage,
    twitterTitle, twitterDescription, twitterTitleEn, twitterDescriptionEn, twitterImage,
    canonicalUrl, schemaType,
  };

  const handleSEOChange = useCallback((field: string, value: unknown) => {
    switch (field) {
      case "focusKeyphrase": setFocusKeyphrase(value as string); break;
      case "focusKeyphraseFa": setFocusKeyphraseFa(value as string); break;
      case "focusKeyphraseEn": setFocusKeyphraseEn(value as string); break;
      case "metaTitle": setMetaTitle(value as string); break;
      case "metaTitleFa": setMetaTitleFa(value as string); break;
      case "metaTitleEn": setMetaTitleEn(value as string); break;
      case "metaDescription": setMetaDescription(value as string); break;
      case "metaDescriptionFa": setMetaDescriptionFa(value as string); break;
      case "metaDescriptionEn": setMetaDescriptionEn(value as string); break;
      case "metaKeywords": setMetaKeywords(value as string[]); break;
      case "metaKeywordsFa": setMetaKeywordsFa(value as string[]); break;
      case "metaKeywordsEn": setMetaKeywordsEn(value as string[]); break;
      case "ogTitle": setOgTitle(value as string); break;
      case "ogDescription": setOgDescription(value as string); break;
      case "ogTitleEn": setOgTitleEn(value as string); break;
      case "ogDescriptionEn": setOgDescriptionEn(value as string); break;
      case "ogImage": setOgImage(value as string); break;
      case "twitterTitle": setTwitterTitle(value as string); break;
      case "twitterDescription": setTwitterDescription(value as string); break;
      case "twitterTitleEn": setTwitterTitleEn(value as string); break;
      case "twitterDescriptionEn": setTwitterDescriptionEn(value as string); break;
      case "twitterImage": setTwitterImage(value as string); break;
      case "canonicalUrl": setCanonicalUrl(value as string); break;
      case "schemaType": setSchemaType(value as string); break;
    }
  }, []);

  const handleAIFill = useCallback((field: string, value: unknown) => {
    if (Array.isArray(value)) {
      handleSEOChange(field, value);
    } else if (typeof value === "object" && value !== null) {
      Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
        handleSEOChange(key, val);
      });
    } else {
      handleSEOChange(field, value);
    }
  }, [handleSEOChange]);

  const handleSave = async () => {
    if (!name.trim() || !game || !category || !price) {
      toast.error("Validation", "Name, game, category, and price are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name, nameFa: nameFa || null, nameEn: nameEn || null,
        slug, slugEn: slugEn || null,
        game, category, categoryEn: categoryEn || null,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        priceDaily: priceDaily ? parseFloat(priceDaily) : null,
        priceWeekly: priceWeekly ? parseFloat(priceWeekly) : null,
        priceMonthly: priceMonthly ? parseFloat(priceMonthly) : null,
        priceLifetime: priceLifetime ? parseFloat(priceLifetime) : null,
        description, descriptionFa: descriptionFa || null, descriptionEn: descriptionEn || null,
        shortDesc: shortDesc || null, shortDescFa: shortDescFa || null, shortDescEn: shortDescEn || null,
        subtitle: subtitle || null, subtitleEn: subtitleEn || null,
        highlightTagFa: highlightTagFa || null, highlightTagEn: highlightTagEn || null,
        features: features.split("\n").filter(Boolean),
        featuresFa: featuresFa.split("\n").filter(Boolean),
        featuresEn: featuresEn.split("\n").filter(Boolean),
        bypassRate, updateStatus, status,
        imageUrl: imageUrl || null,
        bannerImage: bannerImage || null,
        videoUrl: videoUrl || null, audioUrl: audioUrl || null,
        galleryItems: [
          ...galleryItems,
          ...galleryImages
            .filter((url) => !galleryItems.some((item) => item.url === url))
            .map((url, i) => ({ url, order: galleryItems.length + i })),
        ],
        featuresDetail,
        isPopular,
        // SEO basic
        metaTitle: metaTitle || null,
        metaTitleFa: metaTitleFa || null,
        metaTitleEn: metaTitleEn || null,
        metaDescription: metaDescription || null,
        metaDescriptionFa: metaDescriptionFa || null,
        metaDescriptionEn: metaDescriptionEn || null,
        focusKeyphrase: focusKeyphrase || null,
        focusKeyphraseFa: focusKeyphraseFa || null,
        focusKeyphraseEn: focusKeyphraseEn || null,
        canonicalUrl: canonicalUrl || null,
        ogImage: ogImage || null,
        schemaType,
        // SEO new
        metaKeywords: metaKeywords.length > 0 ? metaKeywords : null,
        metaKeywordsFa: metaKeywordsFa.length > 0 ? metaKeywordsFa : null,
        metaKeywordsEn: metaKeywordsEn.length > 0 ? metaKeywordsEn : null,
        ogTitle: ogTitle || null,
        ogDescription: ogDescription || null,
        ogTitleEn: ogTitleEn || null,
        ogDescriptionEn: ogDescriptionEn || null,
        twitterTitle: twitterTitle || null,
        twitterDescription: twitterDescription || null,
        twitterTitleEn: twitterTitleEn || null,
        twitterDescriptionEn: twitterDescriptionEn || null,
        twitterImage: twitterImage || null,
      };
      const res = await fetch(`/api/admin/products?id=${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Update failed");
      toast.success("Success", `${name} updated successfully`);
      router.push("/admin?tab=products");
    } catch (err: unknown) {
      toast.error("Error", err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={24} className="text-gold animate-spin" />
          <span className="text-gray-500 text-sm">Loading product...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian text-white">
      {/* Sticky header */}
      <div className="sticky top-0 z-50 border-b border-white/5 bg-obsidian-light/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin?tab=products" className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-base font-bold text-white font-display">Edit Product</h1>
              <p className="text-[10px] text-gray-500">{name} — {slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:block">
              Logged in as <span className="text-gold">{user?.username}</span>
            </span>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gold text-obsidian font-bold text-sm rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50">
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* ═══ 2-COLUMN LAYOUT (responsive: stacks on mobile) ═══ */}
      <div className="seo-admin-grid">

        {/* ═══ LEFT COLUMN ═══ */}
        <div className="space-y-6 min-w-0">

          {/* Basic Information */}
          <section className="bg-obsidian-light rounded-xl border border-white/5 p-5 space-y-4">
            <h2 className="text-sm font-bold text-gold flex items-center gap-2"><FileText size={14} /> Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Name (FA)"><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" dir="rtl" /></Field>
              <Field label="Name (EN)"><input type="text" value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="input-field" /></Field>
              <Field label="Slug (FA)"><input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="input-field" /></Field>
              <Field label="Slug (EN)"><input type="text" value={slugEn} onChange={(e) => setSlugEn(e.target.value)} className="input-field" /></Field>
              <Field label={<span>Subtitle (FA)<br/><span className="text-gray-600 font-normal">(نمایش در کارت محصول)</span></span>}>
                <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="input-field" dir="rtl" placeholder="مثلاً: بدون بن و ارزان همراه آموزش" />
              </Field>
              <Field label={<span>Subtitle (EN)<br/><span className="text-gray-600 font-normal">(shown on product card)</span></span>}>
                <input type="text" value={subtitleEn} onChange={(e) => setSubtitleEn(e.target.value)} className="input-field" placeholder="e.g. Undetectable & cheap with tutorial" />
              </Field>
              <Field label={<span>Selling Point (FA)<br/><span className="text-gray-600 font-normal">(بج زیر عنوان)</span></span>}>
                <input type="text" value={highlightTagFa} onChange={(e) => setHighlightTagFa(e.target.value)} className="input-field" dir="rtl" placeholder="مثلاً: بهترین اسکریپت دوتا ۲" />
              </Field>
              <Field label={<span>Selling Point (EN)<br/><span className="text-gray-600 font-normal">(badge below title)</span></span>}>
                <input type="text" value={highlightTagEn} onChange={(e) => setHighlightTagEn(e.target.value)} className="input-field" placeholder="e.g. Best Dota 2 script" />
              </Field>
              <Field label="Game">
                <select value={game} onChange={(e) => setGame(e.target.value)} className="input-field">
                  {gamesLoading ? (
                    <option value={game}>{game} (loading...)</option>
                  ) : (
                    <>
                      {/* Show admin games (synced) */}
                      {games.map((g) => (
                        <option key={g.id} value={g.name}>
                          {g.nameEn || g.name}
                        </option>
                      ))}
                      {/* If current product game is NOT in admin list, keep it selectable so admins can still see it */}
                      {!games.some((g) => g.name === game) && (
                        <option value={game} disabled>⚠ {game} (not in Games list)</option>
                      )}
                    </>
                  )}
                </select>
              </Field>
              <Field label="Category (FA)">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
                  {["Aimbot", "Wallhack", "ESP Overlay", "HWID Spoofer", "Skin Changer", "Radar"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Category (EN)"><input type="text" value={categoryEn} onChange={(e) => setCategoryEn(e.target.value)} className="input-field" placeholder="e.g. Aimbot" /></Field>
              <Field label="Bypass Rate"><input type="text" value={bypassRate} onChange={(e) => setBypassRate(e.target.value)} className="input-field" /></Field>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-obsidian-light rounded-xl border border-white/5 p-5 space-y-4">
            <h2 className="text-sm font-bold text-gold flex items-center gap-2"><CreditCard size={14} /> Multi-Tier Pricing (USD)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <Field label="Base Price ($)"><input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="input-field" /></Field>
              <Field label="Sale Price ($)"><input type="number" step="0.01" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className="input-field" /></Field>
              <Field label="Daily ($)"><input type="number" step="0.01" value={priceDaily} onChange={(e) => setPriceDaily(e.target.value)} className="input-field" /></Field>
              <Field label="Weekly ($)"><input type="number" step="0.01" value={priceWeekly} onChange={(e) => setPriceWeekly(e.target.value)} className="input-field" /></Field>
              <Field label="Monthly ($)"><input type="number" step="0.01" value={priceMonthly} onChange={(e) => setPriceMonthly(e.target.value)} className="input-field" /></Field>
              <Field label="Lifetime ($)"><input type="number" step="0.01" value={priceLifetime} onChange={(e) => setPriceLifetime(e.target.value)} className="input-field" /></Field>
            </div>
          </section>

          {/* Media */}
          <section className="bg-obsidian-light rounded-xl border border-white/5 p-5 space-y-4">
            <h2 className="text-sm font-bold text-gold flex items-center gap-2"><ImageIcon size={14} /> Media & Images</h2>

            {/* Banner */}
            <div className="border border-white/5 rounded-lg p-4 space-y-3">
              <p className="text-xs font-bold text-gold">Banner Image</p>
              <input ref={bannerRef} type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
              <div className="flex items-start gap-4">
                <div className="w-48 h-28 rounded-lg border border-white/10 bg-obsidian flex items-center justify-center overflow-hidden flex-shrink-0">
                  {bannerImage ? <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" /> : <ImageIcon size={28} className="text-gray-600" />}
                </div>
                <div className="space-y-2">
                  <button onClick={() => bannerRef.current?.click()} disabled={uploadingField === "image"}
                    className="flex items-center gap-2 px-3 py-1.5 border border-gold/40 text-gold text-xs rounded-lg hover:bg-gold/10 transition-colors">
                    {uploadingField === "image" ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />} Upload Banner
                  </button>
                  {bannerImage && <button onClick={() => setBannerImage("")} className="flex items-center gap-1 text-[10px] text-danger hover:underline"><Trash2 size={10} /> Remove</button>}
                  <input type="text" value={bannerImage} onChange={(e) => setBannerImage(e.target.value)} placeholder="/uploads/products/banner.png" className="input-field text-[11px]" style={{ width: "240px" }} />
                </div>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="border border-white/5 rounded-lg p-4 space-y-3">
              <p className="text-xs font-bold text-gold">Product Thumbnail</p>
              <input ref={imageRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-lg border border-white/10 bg-obsidian flex items-center justify-center overflow-hidden flex-shrink-0">
                  {imageUrl ? <img src={imageUrl} alt="Product" className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-gray-600" />}
                </div>
                <div className="space-y-2">
                  <button onClick={() => imageRef.current?.click()} disabled={imageUploading}
                    className="flex items-center gap-2 px-3 py-1.5 border border-gold/40 text-gold text-xs rounded-lg hover:bg-gold/10 transition-colors">
                    {imageUploading ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />} {imageUploading ? "Uploading..." : "Upload Image"}
                  </button>
                  {imageUrl && <button onClick={() => setImageUrl("")} className="flex items-center gap-1 text-[10px] text-danger hover:underline"><Trash2 size={10} /> Remove</button>}
                  <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="/images/product.png" className="input-field text-[11px]" style={{ width: "240px" }} />
                </div>
              </div>
            </div>

            {/* Video & Audio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-white/5 rounded-lg p-4 space-y-3">
                <p className="text-xs font-bold text-gold">Video (MP4, WebM)</p>
                <input ref={videoRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                <div className="flex items-center gap-2">
                  <button onClick={() => videoRef.current?.click()} disabled={uploadingField === "video"}
                    className="flex items-center gap-2 px-3 py-1.5 border border-gold/40 text-gold text-xs rounded-lg hover:bg-gold/10 transition-colors">
                    {uploadingField === "video" ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />} Upload Video
                  </button>
                  {videoUrl && <span className="text-[10px] text-success">Video uploaded</span>}
                </div>
                <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="/uploads/videos/..." className="input-field text-[11px]" />
              </div>
              <div className="border border-white/5 rounded-lg p-4 space-y-3">
                <p className="text-xs font-bold text-gold">Audio (MP3, WAV)</p>
                <input ref={audioRef} type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                <div className="flex items-center gap-2">
                  <button onClick={() => audioRef.current?.click()} disabled={uploadingField === "audio"}
                    className="flex items-center gap-2 px-3 py-1.5 border border-gold/40 text-gold text-xs rounded-lg hover:bg-gold/10 transition-colors">
                    {uploadingField === "audio" ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />} Upload Audio
                  </button>
                  {audioUrl && <span className="text-[10px] text-success">Audio uploaded</span>}
                </div>
                <input type="text" value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} placeholder="/uploads/audio/..." className="input-field text-[11px]" />
              </div>
            </div>

            {/* Gallery */}
            <div className="border border-white/5 rounded-lg p-4 space-y-3">
              <p className="text-xs font-bold text-gold">Gallery Images</p>
              <input ref={galleryRef} type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
              <div className="flex items-center gap-2">
                <button onClick={() => galleryRef.current?.click()} disabled={uploadingField === "image"}
                  className="flex items-center gap-2 px-3 py-1.5 border border-gold/40 text-gold text-xs rounded-lg hover:bg-gold/10 transition-colors">
                  <Plus size={12} /> Add Images
                </button>
                <span className="text-[10px] text-gray-500">{galleryImages.length} images</span>
              </div>
              {galleryImages.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {galleryImages.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt="" className="w-16 h-16 rounded-md object-cover border border-white/10" />
                      <button onClick={() => setGalleryImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                <p className="text-[10px] text-gray-500">Gallery Items (with captions):</p>
                {galleryItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-obsidian rounded-lg p-2">
                    <img src={item.url} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                    <input type="text" value={item.captionEn || ""} onChange={(e) => { const updated = [...galleryItems]; updated[i] = { ...updated[i], captionEn: e.target.value }; setGalleryItems(updated); }} placeholder="Caption EN" className="input-field text-[11px] flex-1" />
                    <input type="text" value={item.captionFa || ""} onChange={(e) => { const updated = [...galleryItems]; updated[i] = { ...updated[i], captionFa: e.target.value }; setGalleryItems(updated); }} placeholder="Caption FA" className="input-field text-[11px] flex-1" dir="rtl" />
                    <button onClick={() => removeGalleryItem(i)} className="p-1 text-danger hover:bg-danger/10 rounded"><Trash2 size={12} /></button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input type="text" value={galleryInput} onChange={(e) => setGalleryInput(e.target.value)} placeholder="Image URL" className="input-field text-[11px] flex-1" />
                  <button onClick={addGalleryItem} className="px-3 py-1.5 border border-gold/40 text-gold text-xs rounded-lg hover:bg-gold/10"><Plus size={12} /></button>
                </div>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="bg-obsidian-light rounded-xl border border-white/5 p-5 space-y-4">
            <h2 className="text-sm font-bold text-gold flex items-center gap-2"><Eye size={14} /> Product Description</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gray-500 font-medium mb-1">Short Description (FA)</p>
                <textarea value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} rows={2} dir="rtl" className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white placeholder:text-gray-600 focus:border-gold/30 focus:outline-none resize-none" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-medium mb-1">Short Description (EN)</p>
                <textarea value={shortDescEn} onChange={(e) => setShortDescEn(e.target.value)} rows={2} className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white placeholder:text-gray-600 focus:border-gold/30 focus:outline-none resize-none" />
              </div>
            </div>
            <div className="space-y-4">
              <div dir="rtl">
                <p className="text-[10px] text-gray-500 font-medium mb-1">توضیحات کامل (FA) — ویرایشگر متن غنی (TipTap)</p>
                <TipTapEditor value={description} onChange={setDescription} minHeight={250} dir="rtl" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-medium mb-1">Full Description (EN) — Rich Text Editor (TipTap)</p>
                <TipTapEditor value={descriptionEn} onChange={setDescriptionEn} minHeight={250} />
              </div>
            </div>
          </section>

          {/* SEO Fields */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-gold flex items-center gap-2"><Search size={14} /> SEO — Search Engine Optimization</h2>
            <SEOFields formData={seoFormData} onChange={handleSEOChange} />
          </section>

          {/* Features */}
          <section className="bg-obsidian-light rounded-xl border border-white/5 p-5 space-y-4">
            <h2 className="text-sm font-bold text-gold flex items-center gap-2"><Settings size={14} /> Features & Details</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div dir="rtl">
                <p className="text-[10px] text-gray-500 font-medium mb-1">Features FA (one per line)</p>
                <textarea value={featuresFa} onChange={(e) => setFeaturesFa(e.target.value)} rows={6} dir="rtl" className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white placeholder:text-gray-600 focus:border-gold/30 focus:outline-none resize-none font-mono" />
              </div>
              <div dir="rtl">
                <p className="text-[10px] text-gray-500 font-medium mb-1">Features Base (one per line)</p>
                <textarea value={features} onChange={(e) => setFeatures(e.target.value)} rows={6} dir="rtl" className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white placeholder:text-gray-600 focus:border-gold/30 focus:outline-none resize-none font-mono" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-medium mb-1">Features EN (one per line)</p>
                <textarea value={featuresEn} onChange={(e) => setFeaturesEn(e.target.value)} rows={6} className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white placeholder:text-gray-600 focus:border-gold/30 focus:outline-none resize-none font-mono" />
              </div>
            </div>

            {/* Structured Features with icons */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gold">Structured Features (with icons)</p>
                  <p className="text-[10px] text-gray-500">Rich feature cards displayed on the product page with icons, titles, and descriptions.</p>
                </div>
                <button onClick={addFeatureDetail} className="flex items-center gap-1 px-3 py-1.5 border border-gold/40 text-gold text-xs rounded-lg hover:bg-gold/10 transition-colors"><Plus size={12} /> Add Feature</button>
              </div>

              {featuresDetail.length === 0 && (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-lg">
                  <p className="text-xs text-gray-500">No structured features yet.</p>
                  <p className="text-[10px] text-gray-600 mt-1">Click "Add Feature" to create rich feature cards with icons.</p>
                </div>
              )}

              {featuresDetail.map((feat, i) => (
                <div key={i} className="bg-obsidian border border-white/5 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-mono">Feature #{i + 1}</span>
                    <button onClick={() => removeFeatureDetail(i)} className="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-medium">Icon</label>
                    <div className="flex flex-wrap gap-1.5">
                      {ICON_OPTIONS.map((iconName) => {
                        const IconComp = ICON_MAP[iconName];
                        return (
                          <button key={iconName} type="button" onClick={() => updateFeatureDetail(i, "icon", iconName)}
                            title={iconName}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] rounded-lg border transition-all ${
                              feat.icon === iconName
                                ? "border-gold/60 bg-gold/15 text-gold shadow-[0_0_8px_rgba(201,150,58,0.15)]"
                                : "border-white/5 bg-white/[0.02] text-gray-400 hover:bg-white/5 hover:text-gray-300"
                            }`}>
                            {IconComp && <IconComp size={12} />}
                            <span>{iconName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-medium">Title (EN)</label>
                      <input type="text" value={feat.titleEn} onChange={(e) => updateFeatureDetail(i, "titleEn", e.target.value)} placeholder="e.g. Undetected & Safe" className="input-field text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-medium">Title (FA)</label>
                      <input type="text" value={feat.titleFa} onChange={(e) => updateFeatureDetail(i, "titleFa", e.target.value)} placeholder="مثال: شناسایی‌نشده و امن" className="input-field text-xs" dir="rtl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-medium">Description (EN)</label>
                      <textarea value={feat.descriptionEn || ""} onChange={(e) => updateFeatureDetail(i, "descriptionEn", e.target.value)} rows={2} placeholder="Short description for this feature..." className="w-full px-3 py-2 bg-obsidian-light border border-white/10 rounded-lg text-xs text-white placeholder:text-gray-600 focus:border-gold/30 focus:outline-none resize-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-medium">Description (FA)</label>
                      <textarea value={feat.descriptionFa || ""} onChange={(e) => updateFeatureDetail(i, "descriptionFa", e.target.value)} rows={2} dir="rtl" placeholder="توضیح کوتاه برای این ویژگی..." className="w-full px-3 py-2 bg-obsidian-light border border-white/10 rounded-lg text-xs text-white placeholder:text-gray-600 focus:border-gold/30 focus:outline-none resize-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Settings */}
          <section className="bg-obsidian-light rounded-xl border border-white/5 p-5 space-y-4">
            <h2 className="text-sm font-bold text-gold flex items-center gap-2"><Settings size={14} /> Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Field label="Update Status">
                <select value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)} className="input-field">
                  {["Undetected", "Updating", "Testing"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field">
                  {["active", "inactive"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Bypass Rate">
                <input type="text" value={bypassRate} onChange={(e) => setBypassRate(e.target.value)} className="input-field" />
              </Field>
              <Field label="Popular">
                <div className="flex items-center gap-2 h-[38px]">
                  <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} className="rounded accent-gold" />
                  <span className="text-xs text-gray-400">Mark as popular</span>
                </div>
              </Field>
            </div>
          </section>

          {/* Save Bar */}
          <div className="flex justify-end gap-3 pt-4 pb-8">
            <Link href="/admin?tab=products">
              <button className="px-4 py-2 border border-white/10 text-gray-400 text-sm rounded-lg hover:bg-white/5 transition-colors">Cancel</button>
            </Link>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-gold text-obsidian font-bold text-sm rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50">
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* ═══ RIGHT COLUMN — SEO Analyzer (sticky) ═══ */}
        <div className="seo-sticky-col">
          <SEOAnalyzer formData={seoFormData} onAIFill={handleAIFill} />
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={imageRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      <input ref={ogImageRef} type="file" accept="image/*" onChange={handleOgImageUpload} className="hidden" />
    </div>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-gray-500 font-medium">{label}</label>
      {children}
    </div>
  );
}
