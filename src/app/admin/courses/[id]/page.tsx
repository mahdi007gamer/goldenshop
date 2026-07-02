"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Edit, Trash2, BookOpen, FileText, Clock, Video, Image, Music, Paperclip, Lock, Globe, ChevronDown } from "lucide-react";
import { TipTapEditor } from "@/components/ui/TipTapEditor";
import { FileUploadSection } from "@/components/ui/FileUploadSection";
import { GuideEditor } from "@/components/ui/GuideEditor";
import { Button } from "@/components/ui/Button";
import { toast } from "@/store/toast-store";

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  fileUrl: string | null;
  fileName: string | null;
  filePassword: string | null;
  guideContent: string;
  duration: number;
  order: number;
}

interface CourseData {
  id: string;
  title: string;
  titleEn: string | null;
  slug: string;
  description: string;
  descriptionEn: string | null;
  fullDescription: string | null;
  fullDescriptionEn: string | null;
  prerequisites: string | null;
  prerequisitesEn: string | null;
  thumbnail: string | null;
  status: string;
  productId: string | null;
  lessons: Lesson[];
}

interface Product {
  id: string;
  name: string;
  game: string;
}

type LangTab = "fa" | "en";

export default function CourseEditPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [langTab, setLangTab] = useState<LangTab>("fa");
  const [products, setProducts] = useState<Product[]>([]);
  const [course, setCourse] = useState<CourseData>({
    id: "",
    title: "",
    titleEn: "",
    slug: "",
    description: "",
    descriptionEn: "",
    fullDescription: null,
    fullDescriptionEn: null,
    prerequisites: null,
    prerequisitesEn: null,
    thumbnail: null,
    status: "draft",
    productId: null,
    lessons: [],
  });
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    content: "",
    videoUrl: "",
    imageUrl: "",
    audioUrl: "",
    fileUrl: "",
    fileName: "",
    filePassword: "",
    guideContent: "",
    duration: "10",
    order: "0",
  });

  const loadCourse = useCallback(async () => {
    try {
      setLoading(true);
      const [courseRes, productsRes] = await Promise.all([
        fetch(`/api/admin/courses/${id}`, { credentials: "include" }),
        fetch("/api/admin/products?take=100", { credentials: "include" }),
      ]);
      const courseJson = await courseRes.json();
      const productsJson = await productsRes.json();

      if (courseJson.success) {
        setCourse({
          ...courseJson.data,
          titleEn: courseJson.data.titleEn || "",
          descriptionEn: courseJson.data.descriptionEn || "",
          fullDescription: courseJson.data.fullDescription || "",
          fullDescriptionEn: courseJson.data.fullDescriptionEn || "",
          prerequisites: courseJson.data.prerequisites || "",
          prerequisitesEn: courseJson.data.prerequisitesEn || "",
          lessons: courseJson.data.lessons || [],
        });
      } else {
        toast.error("خطا", "دوره یافت نشد");
        router.push("/admin?tab=courses");
      }
      if (productsJson.success) {
        setProducts(productsJson.products || []);
      }
    } catch {
      toast.error("خطا", "بارگذاری دوره با مشکل مواجه شد");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { loadCourse(); }, [loadCourse]);

  const handleSave = async () => {
    if (!course.title.trim()) {
      toast.error("خطا", "عنوان دوره الزامی است");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...course,
          productId: course.productId || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("موفق", "دوره به‌روزرسانی شد");
      } else {
        toast.error("خطا", json.error?.message || "ذخیره با مشکل مواجه شد");
      }
    } catch {
      toast.error("خطا", "ذخیره دوره با مشکل مواجه شد");
    } finally {
      setSaving(false);
    }
  };

  const handleAddLesson = async () => {
    if (!lessonForm.title.trim()) {
      toast.error("خطا", "عنوان درس الزامی است");
      return;
    }
    try {
      const res = await fetch(`/api/admin/courses/${id}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...lessonForm,
          duration: parseInt(lessonForm.duration) || 0,
          order: parseInt(lessonForm.order) || 0,
          videoUrl: lessonForm.videoUrl || null,
          imageUrl: lessonForm.imageUrl || null,
          audioUrl: lessonForm.audioUrl || null,
          fileUrl: lessonForm.fileUrl || null,
          fileName: lessonForm.fileName || null,
          filePassword: lessonForm.filePassword || null,
          guideContent: lessonForm.guideContent || "{}",
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("درس جدید اضافه شد");
        setShowLessonModal(false);
        setLessonForm({ title: "", content: "", videoUrl: "", imageUrl: "", audioUrl: "", fileUrl: "", fileName: "", filePassword: "", guideContent: "", duration: "10", order: "0" });
        loadCourse();
      } else {
        toast.error("خطا", json.error?.message || "اضافه کردن درس با مشکل مواجه شد");
      }
    } catch {
      toast.error("خطا", "اضافه کردن درس با مشکل مواجه شد");
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("حذف این درس؟")) return;
    try {
      const res = await fetch(`/api/admin/courses/${id}/lessons?lessonId=${lessonId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("درس حذف شد");
        loadCourse();
      } else {
        toast.error("خطا", "حذف درس با مشکل مواجه شد");
      }
    } catch {
      toast.error("خطا", "حذف درس با مشکل مواجه شد");
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

  return (
    <div className="min-h-screen bg-obsidian p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin?tab=courses")}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen size={20} className="text-gold" />
                ویرایش: {course.title}
              </h1>
              <p className="text-xs text-gray-500">مدیریت محتوا، پیش‌نیازها و درس‌ها</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={saving} icon={<Save size={14} />}>
              {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </Button>
          </div>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center gap-2 bg-obsidian-light rounded-xl border border-white/5 p-1">
          <button
            onClick={() => setLangTab("fa")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              langTab === "fa" ? "bg-gold/10 text-gold border border-gold/20" : "text-gray-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <Globe size={12} />
            فارسی
          </button>
          <button
            onClick={() => setLangTab("en")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              langTab === "en" ? "bg-cyber/10 text-cyber border border-cyber/20" : "text-gray-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <Globe size={12} />
            English
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Basic info */}
            <div className="bg-obsidian-light rounded-xl border border-white/5 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    عنوان دوره
                  </label>
                  <input
                    type="text"
                    value={langTab === "fa" ? course.title : course.titleEn || ""}
                    onChange={(e) => setCourse({ ...course, [langTab === "fa" ? "title" : "titleEn"]: e.target.value })}
                    className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Slug</label>
                  <input
                    type="text"
                    value={course.slug}
                    onChange={(e) => setCourse({ ...course, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white font-mono focus:border-gold/30 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  توضیحات کوتاه
                </label>
                <textarea
                  value={langTab === "fa" ? course.description : course.descriptionEn || ""}
                  onChange={(e) => setCourse({ ...course, [langTab === "fa" ? "description" : "descriptionEn"]: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Full Description (TipTap) */}
            <div className="bg-obsidian-light rounded-xl border border-white/5 overflow-hidden">
              <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2">
                <FileText size={14} className={langTab === "fa" ? "text-gold" : "text-cyber"} />
                <span className="text-xs font-medium text-gray-300">
                  {langTab === "fa" ? "توضیحات کامل (فارسی)" : "Full Description (English)"}
                </span>
              </div>
              <TipTapEditor
                value={langTab === "fa" ? (course.fullDescription || "") : (course.fullDescriptionEn || "")}
                onChange={(v) => setCourse({ ...course, [langTab === "fa" ? "fullDescription" : "fullDescriptionEn"]: v })}
                minHeight={300}
                dir={langTab === "fa" ? "rtl" : "ltr"}
                placeholder={langTab === "fa" ? "توضیحات کامل دوره را بنویسید..." : "Write full course description..."}
              />
            </div>

            {/* Prerequisites (TipTap) */}
            <div className="bg-obsidian-light rounded-xl border border-white/5 overflow-hidden">
              <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2">
                <BookOpen size={14} className={langTab === "fa" ? "text-gold" : "text-cyber"} />
                <span className="text-xs font-medium text-gray-300">
                  {langTab === "fa" ? "پیش‌نیازها (فارسی)" : "Prerequisites (English)"}
                </span>
              </div>
              <TipTapEditor
                value={langTab === "fa" ? (course.prerequisites || "") : (course.prerequisitesEn || "")}
                onChange={(v) => setCourse({ ...course, [langTab === "fa" ? "prerequisites" : "prerequisitesEn"]: v })}
                minHeight={200}
                dir={langTab === "fa" ? "rtl" : "ltr"}
                placeholder={langTab === "fa" ? "پیش‌نیازهای دوره را بنویسید..." : "Write course prerequisites..."}
              />
            </div>

            {/* Lessons */}
            <div className="bg-obsidian-light rounded-xl border border-white/5 overflow-hidden">
              <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-success" />
                  <span className="text-xs font-medium text-gray-300">درس‌ها ({course.lessons.length})</span>
                </div>
                <Button size="sm" onClick={() => setShowLessonModal(true)} icon={<Plus size={12} />}>افزودن درس</Button>
              </div>
              <div className="divide-y divide-white/5">
                {course.lessons.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-xs">هنوز درسی اضافه نشده</div>
                ) : (
                  course.lessons.map((lesson, idx) => (
                    <div key={lesson.id} className="px-4 py-3 flex items-center justify-between hover:bg-white/[0.02]">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-gold/10 text-gold text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs text-white font-medium">{lesson.title}</p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500">
                            <Clock size={10} />
                            <span>{lesson.duration} دقیقه</span>
                            {lesson.videoUrl && <Video size={10} className="text-cyber" />}
                            {lesson.imageUrl && <Image size={10} className="text-gold" />}
                            {lesson.audioUrl && <Music size={10} className="text-success" />}
                            {lesson.fileUrl && <Paperclip size={10} className="text-gray-400" />}
                            {lesson.filePassword && <Lock size={10} className="text-amber-400" />}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-danger"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-obsidian-light rounded-xl border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-medium text-gold">تنظیمات دوره</h3>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">وضعیت</label>
                <select
                  value={course.status}
                  onChange={(e) => setCourse({ ...course, status: e.target.value })}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
                >
                  <option value="draft">پیش‌نویس</option>
                  <option value="published">منتشر شده</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">تصویر کاور</label>
                <input
                  type="text"
                  value={course.thumbnail || ""}
                  onChange={(e) => setCourse({ ...course, thumbnail: e.target.value || null })}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
                  placeholder="/images/course.jpg"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">محصول مرتبط</label>
                <select
                  value={course.productId || ""}
                  onChange={(e) => setCourse({ ...course, productId: e.target.value || null })}
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
                >
                  <option value="">— بدون محصول —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.game})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-obsidian-light rounded-xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">افزودن درس جدید</h3>
              <button onClick={() => setShowLessonModal(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <div className="p-4 space-y-3">
              <InputField label="عنوان درس" value={lessonForm.title} onChange={(v) => setLessonForm({ ...lessonForm, title: v })} />
              <div>
                <label className="text-xs text-gray-400 mb-1 block">محتوای درس</label>
                <TipTapEditor
                  value={lessonForm.content}
                  onChange={(v) => setLessonForm({ ...lessonForm, content: v })}
                  minHeight={150}
                  dir="rtl"
                  placeholder="محتوای درس..."
                />
              </div>

              {/* File Upload Section */}
              <FileUploadSection
                fileUrl={lessonForm.fileUrl}
                fileName={lessonForm.fileName}
                filePassword={lessonForm.filePassword}
                onFileUrlChange={(v) => setLessonForm({ ...lessonForm, fileUrl: v })}
                onFileNameChange={(v) => setLessonForm({ ...lessonForm, fileName: v })}
                onFilePasswordChange={(v) => setLessonForm({ ...lessonForm, filePassword: v })}
              />

              {/* Guide Editor Section */}
              <div className="border-t border-white/5 pt-4">
                <label className="text-xs text-gray-400 mb-2 block font-medium flex items-center gap-2">
                  <FileText size={12} className="text-gold" />
                  راهنمای قدم به قدم
                </label>
                <GuideEditor
                  value={lessonForm.guideContent}
                  onChange={(v) => setLessonForm({ ...lessonForm, guideContent: v })}
                  dir="rtl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InputField label="URL ویدیو" value={lessonForm.videoUrl} onChange={(v) => setLessonForm({ ...lessonForm, videoUrl: v })} placeholder="..." />
                <InputField label="URL تصویر" value={lessonForm.imageUrl} onChange={(v) => setLessonForm({ ...lessonForm, imageUrl: v })} placeholder="..." />
                <InputField label="URL صدا" value={lessonForm.audioUrl} onChange={(v) => setLessonForm({ ...lessonForm, audioUrl: v })} placeholder="..." />
                <InputField label="نام فایل" value={lessonForm.fileName} onChange={(v) => setLessonForm({ ...lessonForm, fileName: v })} placeholder="cheat.zip" />
                <InputField label="مدت (دقیقه)" type="number" value={lessonForm.duration} onChange={(v) => setLessonForm({ ...lessonForm, duration: v })} />
                <InputField label="ترتیب" type="number" value={lessonForm.order} onChange={(v) => setLessonForm({ ...lessonForm, order: v })} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setShowLessonModal(false)}>انصراف</Button>
                <Button onClick={handleAddLesson} icon={<Plus size={14} />}>افزودن</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-gray-500 font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
        placeholder={placeholder}
      />
    </div>
  );
}
