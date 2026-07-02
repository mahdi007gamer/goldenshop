"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Eye, EyeOff, FileText, Globe, Upload, Loader2 } from "lucide-react";
import { TipTapEditor } from "@/components/ui/TipTapEditor";
import { Button } from "@/components/ui/Button";
import { toast } from "@/store/toast-store";

type LangTab = "fa" | "en";

interface ArticleData {
  id: string;
  title: string;
  titleEn: string | null;
  slug: string;
  excerpt: string;
  excerptEn: string | null;
  content: string;
  contentEn: string | null;
  coverImage: string | null;
  category: string;
  categoryEn: string | null;
  tags: string;
  status: string;
  metaTitle: string | null;
  metaTitleEn: string | null;
  metaDescription: string | null;
  metaDescriptionEn: string | null;
  readingTime: number;
}

const CATEGORIES_FA = ["آموزشی", "نصب", "تنظیمات", "نکات پیشرفته", "اخبار", "ترفند"];
const CATEGORIES_EN = ["Tutorial", "Installation", "Configuration", "Advanced Tips", "News", "Tips"];

export default function ArticleEditPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [langTab, setLangTab] = useState<LangTab>("fa");
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [article, setArticle] = useState<ArticleData>({
    id: "",
    title: "",
    titleEn: null,
    slug: "",
    excerpt: "",
    excerptEn: null,
    content: "",
    contentEn: null,
    coverImage: null,
    category: "General",
    categoryEn: null,
    tags: "",
    status: "draft",
    metaTitle: "",
    metaTitleEn: null,
    metaDescription: "",
    metaDescriptionEn: null,
    readingTime: 5,
  });

  const loadArticle = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/articles/${id}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        const d = json.data;
        setArticle({
          ...d,
          titleEn: d.titleEn || "",
          excerptEn: d.excerptEn || "",
          contentEn: d.contentEn || "",
          categoryEn: d.categoryEn || "",
          metaTitle: d.metaTitle || "",
          metaTitleEn: d.metaTitleEn || "",
          metaDescription: d.metaDescription || "",
          metaDescriptionEn: d.metaDescriptionEn || "",
          tags: Array.isArray(d.tags) ? d.tags.join(", ") : (typeof d.tags === "string" ? (JSON.parse(d.tags || "[]") as string[]).join(", ") : ""),
        });
      } else {
        toast.error("خطا", "مقاله یافت نشد");
        router.push("/admin?tab=articles");
      }
    } catch {
      toast.error("خطا", "بارگذاری مقاله با مشکل مواجه شد");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { loadArticle(); }, [loadArticle]);

  const handleSave = async () => {
    if (!article.title.trim()) {
      toast.error("خطا", "عنوان فارسی مقاله الزامی است");
      setLangTab("fa");
      return;
    }
    if (!article.content.trim()) {
      toast.error("خطا", "محتوای فارسی مقاله الزامی است");
      setLangTab("fa");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...article,
          tags: article.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("موفق", "مقاله به‌روزرسانی شد");
      } else {
        toast.error("خطا", json.error?.message || "ذخیره با مشکل مواجه شد");
      }
    } catch {
      toast.error("خطا", "ذخیره مقاله با مشکل مواجه شد");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string | number | null) => {
    setArticle((prev) => ({ ...prev, [field]: value }));
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "image");
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) {
        updateField("coverImage", json.data.url);
        toast.success("موفق", "تصویر کاور آپلود شد");
      } else {
        toast.error("خطا", json.error?.message || "آپلود با مشکل مواجه شد");
      }
    } catch {
      toast.error("خطا", "آپلود تصویر با مشکل مواجه شد");
    } finally {
      setUploadingCover(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          <span>در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  const isFa = langTab === "fa";
  const dir = isFa ? "rtl" : "ltr";
  const categories = isFa ? CATEGORIES_FA : CATEGORIES_EN;

  return (
    <div className="min-h-screen bg-obsidian p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin?tab=articles")}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText size={20} className="text-gold" />
                ویرایش: {article.title}
              </h1>
              <p className="text-xs text-gray-500">ویرایشگر متن غنی با پشتیبانی از فارسی و انگلیسی</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setShowPreview(!showPreview)} icon={showPreview ? <EyeOff size={14} /> : <Eye size={14} />}>
              {showPreview ? "ویرایش" : "پیش‌نمایش"}
            </Button>
            <Button onClick={handleSave} disabled={saving} icon={<Save size={14} />}>
              {saving ? "در حال ذخیره..." : "ذخیره"}
            </Button>
          </div>
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
            {!article.title && <span className="text-danger text-[10px]">*</span>}
          </button>
          <button
            onClick={() => setLangTab("en")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              !isFa ? "bg-cyber/10 text-cyber border border-cyber/20" : "text-gray-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <Globe size={12} />
            English
            {!article.titleEn && <span className="text-gold/50 text-[10px]">(optional)</span>}
          </button>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Basic Info */}
            <div className="bg-obsidian-light rounded-xl border border-white/5 p-4 space-y-3" dir={dir}>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  {isFa ? "عنوان مقاله" : "Article Title"}
                  {isFa && <span className="text-danger mr-1">*</span>}
                </label>
                <input
                  type="text"
                  value={isFa ? article.title : (article.titleEn || "")}
                  onChange={(e) => updateField(isFa ? "title" : "titleEn", e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none"
                  placeholder={isFa ? "عنوان مقاله به فارسی..." : "Article title in English..."}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Slug</label>
                <input
                  type="text"
                  value={article.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white font-mono focus:border-gold/30 focus:outline-none"
                  placeholder="article-slug"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  {isFa ? "خلاصه" : "Excerpt"}
                  {isFa && <span className="text-danger mr-1">*</span>}
                </label>
                <textarea
                  value={isFa ? article.excerpt : (article.excerptEn || "")}
                  onChange={(e) => updateField(isFa ? "excerpt" : "excerptEn", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none resize-none"
                  placeholder={isFa ? "خلاصه کوتاهی از مقاله..." : "Brief summary of the article..."}
                />
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-obsidian-light rounded-xl border border-white/5 overflow-hidden">
              <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2">
                <FileText size={14} className={isFa ? "text-gold" : "text-cyber"} />
                <span className="text-xs font-medium text-gray-300">
                  {isFa ? "محتوای مقاله (فارسی)" : "Article Content (English)"}
                </span>
                {isFa && <span className="text-danger text-[10px]">* الزامی</span>}
              </div>
              {showPreview ? (
                <div
                  className="p-4 prose prose-invert max-w-none text-sm text-gray-300 min-h-[400px]"
                  dir={dir}
                  dangerouslySetInnerHTML={{
                    __html: (isFa ? article.content : (article.contentEn || "")) || `<p class="text-gray-500">${isFa ? "محتوایی وجود ندارد" : "No content yet"}</p>`,
                  }}
                />
              ) : (
                <TipTapEditor
                  key={`edit-content-${langTab}`}
                  value={isFa ? article.content : (article.contentEn || "")}
                  onChange={(v) => updateField(isFa ? "content" : "contentEn", v)}
                  minHeight={400}
                  dir={dir}
                  placeholder={isFa ? "محتوای مقاله را بنویسید..." : "Write your article content..."}
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Publish Settings */}
            <div className="bg-obsidian-light rounded-xl border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-medium text-gold">تنظیمات انتشار</h3>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">وضعیت</label>
                <select
                  value={article.status}
                  onChange={(e) => updateField("status", e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
                >
                  <option value="draft">پیش‌نویس</option>
                  <option value="published">منتشر شده</option>
                  <option value="archived">آرشیو</option>
                </select>
              </div>
              {/* Category with datalist */}
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">
                  {isFa ? "دسته‌بندی (فارسی)" : "Category (English)"}
                </label>
                <input
                  type="text"
                  value={isFa ? article.category : (article.categoryEn || "")}
                  onChange={(e) => updateField(isFa ? "category" : "categoryEn", e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
                  placeholder={isFa ? "دسته‌بندی فارسی" : "English category"}
                  dir={dir}
                  list={isFa ? "edit-cat-fa" : "edit-cat-en"}
                />
                <datalist id="edit-cat-fa">
                  {CATEGORIES_FA.map((c) => <option key={c} value={c} />)}
                </datalist>
                <datalist id="edit-cat-en">
                  {CATEGORIES_EN.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">برچسب‌ها (با کاما جدا کنید)</label>
                <input
                  type="text"
                  value={article.tags}
                  onChange={(e) => updateField("tags", e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
                  placeholder="tag1, tag2, tag3"
                  dir="ltr"
                />
              </div>
              {/* Cover Image with Upload */}
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">تصویر کاور</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={article.coverImage || ""}
                    onChange={(e) => updateField("coverImage", e.target.value || null)}
                    className="flex-1 px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
                    placeholder="/images/cover.jpg"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploadingCover}
                    className="flex items-center gap-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white hover:border-gold/20 transition-colors disabled:opacity-50"
                  >
                    {uploadingCover ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    آپلود
                  </button>
                  <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadCover} />
                </div>
                {article.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.coverImage} alt="Cover" className="mt-2 h-20 rounded-lg border border-white/10 object-cover" />
                )}
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">زمان مطالعه (دقیقه)</label>
                <input
                  type="number"
                  value={article.readingTime}
                  onChange={(e) => updateField("readingTime", parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
                  min="1"
                />
              </div>
            </div>

            {/* SEO */}
            <div className="bg-obsidian-light rounded-xl border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-medium text-gold">تنظیمات SEO</h3>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">
                  Meta Title {isFa ? "(فارسی)" : "(English)"}
                </label>
                <input
                  type="text"
                  value={isFa ? (article.metaTitle || "") : (article.metaTitleEn || "")}
                  onChange={(e) => updateField(isFa ? "metaTitle" : "metaTitleEn", e.target.value || null)}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
                  dir={dir}
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">
                  Meta Description {isFa ? "(فارسی)" : "(English)"}
                </label>
                <textarea
                  value={isFa ? (article.metaDescription || "") : (article.metaDescriptionEn || "")}
                  onChange={(e) => updateField(isFa ? "metaDescription" : "metaDescriptionEn", e.target.value || null)}
                  rows={2}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none resize-none"
                  dir={dir}
                />
              </div>
            </div>

            {/* Completion Status */}
            <div className="bg-obsidian-light rounded-xl border border-white/5 p-4 space-y-2">
              <h3 className="text-xs font-medium text-gold">وضعیت تکمیل</h3>
              <div className="space-y-1.5">
                <CompletionRow label="عنوان فارسی" filled={!!article.title.trim()} required />
                <CompletionRow label="محتوای فارسی" filled={!!article.content.trim()} required />
                <CompletionRow label="خلاصه فارسی" filled={!!article.excerpt.trim()} required />
                <CompletionRow label="Slug" filled={!!article.slug.trim()} required />
                <div className="border-t border-white/5 my-1" />
                <CompletionRow label="عنوان انگلیسی" filled={!!(article.titleEn || "").trim()} />
                <CompletionRow label="محتوای انگلیسی" filled={!!(article.contentEn || "").trim()} />
                <CompletionRow label="خلاصه انگلیسی" filled={!!(article.excerptEn || "").trim()} />
                <CompletionRow label="دسته‌بندی انگلیسی" filled={!!(article.categoryEn || "").trim()} />
              </div>
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
        {required && <span className="text-danger mr-0.5">*</span>}
      </span>
      <span className={`text-[10px] ${filled ? "text-success" : required ? "text-danger" : "text-gray-600"}`}>
        {filled ? "✓" : required ? "✗" : "—"}
      </span>
    </div>
  );
}
