"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, FileText, Globe, Eye, EyeOff, Upload, Loader2 } from "lucide-react";
import { TipTapEditor } from "@/components/ui/TipTapEditor";
import { Button } from "@/components/ui/Button";
import { toast } from "@/store/toast-store";

type LangTab = "fa" | "en";

interface ArticleForm {
  title: string;
  titleEn: string;
  slug: string;
  excerpt: string;
  excerptEn: string;
  content: string;
  contentEn: string;
  coverImage: string;
  category: string;
  categoryEn: string;
  tags: string;
  status: string;
  metaTitle: string;
  metaTitleEn: string;
  metaDescription: string;
  metaDescriptionEn: string;
  readingTime: string;
}

const CATEGORIES_FA = ["آموزشی", "نصب", "تنظیمات", "نکات پیشرفته", "اخبار", "ترفند"];
const CATEGORIES_EN = ["Tutorial", "Installation", "Configuration", "Advanced Tips", "News", "Tips"];

export default function NewArticlePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [langTab, setLangTab] = useState<LangTab>("fa");
  const [showPreview, setShowPreview] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ArticleForm>({
    title: "",
    titleEn: "",
    slug: "",
    excerpt: "",
    excerptEn: "",
    content: "",
    contentEn: "",
    coverImage: "",
    category: "",
    categoryEn: "",
    tags: "",
    status: "draft",
    metaTitle: "",
    metaTitleEn: "",
    metaDescription: "",
    metaDescriptionEn: "",
    readingTime: "5",
  });

  const update = <K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleTitleChange = (value: string) => {
    update("title", value);
    if (!form.slug || form.slug === form.title.toLowerCase().replace(/\s+/g, "-")) {
      update("slug", value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    }
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
        update("coverImage", json.data.url);
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

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("خطا", "عنوان فارسی مقاله الزامی است");
      setLangTab("fa");
      return;
    }
    if (!form.content.trim()) {
      toast.error("خطا", "محتوای فارسی مقاله الزامی است");
      setLangTab("fa");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        readingTime: parseInt(form.readingTime) || 5,
        coverImage: form.coverImage || null,
        category: form.category || "General",
      };
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("موفق", "مقاله جدید ایجاد شد");
        router.replace(`/admin/articles/${json.data.id}/edit`);
      } else {
        toast.error("خطا", json.error?.message || "ایجاد مقاله با مشکل مواجه شد");
      }
    } catch {
      toast.error("خطا", "ایجاد مقاله با مشکل مواجه شد");
    } finally {
      setSaving(false);
    }
  };

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
                مقاله جدید
              </h1>
              <p className="text-xs text-gray-500">ایجاد مقاله با پشتیبانی از فارسی و انگلیسی</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setShowPreview(!showPreview)} icon={showPreview ? <EyeOff size={14} /> : <Eye size={14} />}>
              {showPreview ? "ویرایش" : "پیش‌نمایش"}
            </Button>
            <Button onClick={handleSave} disabled={saving} icon={<Save size={14} />}>
              {saving ? "در حال ذخیره..." : "انتشار"}
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
            {!form.title && <span className="text-danger text-[10px]">*</span>}
          </button>
          <button
            onClick={() => setLangTab("en")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              !isFa ? "bg-cyber/10 text-cyber border border-cyber/20" : "text-gray-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <Globe size={12} />
            English
            {!form.titleEn && <span className="text-gold/50 text-[10px]">(optional)</span>}
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
                  value={isFa ? form.title : form.titleEn}
                  onChange={(e) => update(isFa ? "title" : "titleEn", e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none"
                  placeholder={isFa ? "عنوان مقاله به فارسی..." : "Article title in English..."}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => update("slug", e.target.value)}
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
                  value={isFa ? form.excerpt : form.excerptEn}
                  onChange={(e) => update(isFa ? "excerpt" : "excerptEn", e.target.value)}
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
                    __html: (isFa ? form.content : form.contentEn) || `<p class="text-gray-500">${isFa ? "محتوایی وجود ندارد" : "No content yet"}</p>`,
                  }}
                />
              ) : (
                <TipTapEditor
                  key={`content-${langTab}`}
                  value={isFa ? form.content : form.contentEn}
                  onChange={(v) => update(isFa ? "content" : "contentEn", v)}
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
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
                >
                  <option value="draft">پیش‌نویس</option>
                  <option value="published">منتشر شده</option>
                </select>
              </div>
              {/* Category with datalist */}
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">
                  {isFa ? "دسته‌بندی (فارسی)" : "Category (English)"}
                </label>
                <input
                  type="text"
                  value={isFa ? form.category : form.categoryEn}
                  onChange={(e) => update(isFa ? "category" : "categoryEn", e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
                  placeholder={isFa ? "دسته‌بندی فارسی" : "English category"}
                  dir={dir}
                  list={isFa ? "cat-fa" : "cat-en"}
                />
                <datalist id="cat-fa">
                  {CATEGORIES_FA.map((c) => <option key={c} value={c} />)}
                </datalist>
                <datalist id="cat-en">
                  {CATEGORIES_EN.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">برچسب‌ها (با کاما جدا کنید)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => update("tags", e.target.value)}
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
                    value={form.coverImage}
                    onChange={(e) => update("coverImage", e.target.value)}
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
                {form.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.coverImage} alt="Cover" className="mt-2 h-20 rounded-lg border border-white/10 object-cover" />
                )}
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">زمان مطالعه (دقیقه)</label>
                <input
                  type="number"
                  value={form.readingTime}
                  onChange={(e) => update("readingTime", e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
                  min="1"
                />
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-obsidian-light rounded-xl border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-medium text-gold">تنظیمات SEO</h3>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">
                  Meta Title {isFa ? "(فارسی)" : "(English)"}
                </label>
                <input
                  type="text"
                  value={isFa ? form.metaTitle : form.metaTitleEn}
                  onChange={(e) => update(isFa ? "metaTitle" : "metaTitleEn", e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
                  dir={dir}
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">
                  Meta Description {isFa ? "(فارسی)" : "(English)"}
                </label>
                <textarea
                  value={isFa ? form.metaDescription : form.metaDescriptionEn}
                  onChange={(e) => update(isFa ? "metaDescription" : "metaDescriptionEn", e.target.value)}
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
                <CompletionRow label="عنوان فارسی" filled={!!form.title.trim()} required />
                <CompletionRow label="محتوای فارسی" filled={!!form.content.trim()} required />
                <CompletionRow label="خلاصه فارسی" filled={!!form.excerpt.trim()} required />
                <CompletionRow label="Slug" filled={!!form.slug.trim()} required />
                <div className="border-t border-white/5 my-1" />
                <CompletionRow label="عنوان انگلیسی" filled={!!form.titleEn.trim()} />
                <CompletionRow label="محتوای انگلیسی" filled={!!form.contentEn.trim()} />
                <CompletionRow label="خلاصه انگلیسی" filled={!!form.excerptEn.trim()} />
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
