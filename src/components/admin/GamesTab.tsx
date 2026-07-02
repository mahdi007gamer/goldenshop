"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Edit3, Trash2, Search, RefreshCw, Gamepad2,
  Check, X, Palette, Eye, EyeOff, GripVertical, ExternalLink,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "@/store/toast-store";

interface Game {
  id: string;
  slug: string;
  slugEn?: string | null;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  iconUrl?: string | null;
  bannerUrl?: string | null;
  accentColor: string;
  gradientFrom?: string | null;
  gradientTo?: string | null;
  sortOrder: number;
  isActive: boolean;
  metaTitle?: string | null;
  metaTitleEn?: string | null;
  metaDescription?: string | null;
  metaDescriptionEn?: string | null;
  createdAt: string;
  updatedAt: string;
}

const apiGet = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Request failed");
  return json.data as T;
};

const apiPost = async <T,>(url: string, body: unknown): Promise<T> => {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Request failed");
  return json.data as T;
};

const apiPut = async <T,>(url: string, body: unknown): Promise<T> => {
  const res = await fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Request failed");
  return json.data as T;
};

const apiDelete = async (url: string): Promise<void> => {
  const res = await fetch(url, { method: "DELETE" });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Request failed");
};

const EMPTY_FORM: Omit<Game, "id" | "createdAt" | "updatedAt"> = {
  slug: "",
  slugEn: "",
  name: "",
  nameEn: "",
  description: "",
  descriptionEn: "",
  iconUrl: "",
  bannerUrl: "",
  accentColor: "#C9963A",
  gradientFrom: "",
  gradientTo: "",
  sortOrder: 0,
  isActive: true,
  metaTitle: "",
  metaTitleEn: "",
  metaDescription: "",
  metaDescriptionEn: "",
};

export default function GamesTab() {
  const { token } = useAuthStore();
  const [games, setGames] = useState<Game[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Game | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  // Drag-and-drop reorder state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const loadGames = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("take", "100");
      const data = await apiGet<{ games: Game[]; total: number }>(`/api/admin/games?${params}`);
      setGames(data.games);
      setTotal(data.total);
    } catch (err) {
      toast.error("خطا", err instanceof Error ? err.message : "بارگذاری بازی‌ها با مشکل مواجه شد");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { loadGames(); }, [loadGames]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, sortOrder: total });
    setShowModal(true);
  };

  const openEdit = (g: Game) => {
    setEditing(g);
    setForm({
      slug: g.slug,
      slugEn: g.slugEn || "",
      name: g.name,
      nameEn: g.nameEn || "",
      description: g.description || "",
      descriptionEn: g.descriptionEn || "",
      iconUrl: g.iconUrl || "",
      bannerUrl: g.bannerUrl || "",
      accentColor: g.accentColor,
      gradientFrom: g.gradientFrom || "",
      gradientTo: g.gradientTo || "",
      sortOrder: g.sortOrder,
      isActive: g.isActive,
      metaTitle: g.metaTitle || "",
      metaTitleEn: g.metaTitleEn || "",
      metaDescription: g.metaDescription || "",
      metaDescriptionEn: g.metaDescriptionEn || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("خطا", "نام بازی الزامی است"); return; }
    if (!form.slug.trim()) { toast.error("خطا", "اسلاگ الزامی است"); return; }
    try {
      setSaving(true);
      if (editing) {
        await apiPut(`/api/admin/games/${editing.id}`, form);
        toast.success("موفق", `بازی "${form.name}" ویرایش شد`);
      } else {
        await apiPost("/api/admin/games", form);
        toast.success("موفق", `بازی "${form.name}" ساخته شد`);
      }
      setShowModal(false);
      loadGames();
    } catch (err) {
      toast.error("خطا", err instanceof Error ? err.message : "ذخیره بازی با مشکل مواجه شد");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (g: Game) => {
    if (!confirm(`آیا از حذف بازی "${g.name}" مطمئن هستید؟`)) return;
    try {
      await apiDelete(`/api/admin/games/${g.id}`);
      toast.success("موفق", `بازی "${g.name}" حذف شد`);
      loadGames();
    } catch (err) {
      toast.error("خطا", err instanceof Error ? err.message : "حذف بازی با مشکل مواجه شد");
    }
  };

  const toggleActive = async (g: Game) => {
    try {
      await apiPut(`/api/admin/games/${g.id}`, { isActive: !g.isActive });
      toast.success("موفق", `بازی "${g.name}" ${g.isActive ? "غیرفعال" : "فعال"} شد`);
      loadGames();
    } catch (err) {
      toast.error("خطا", err instanceof Error ? err.message : "تغییر وضعیت با مشکل مواجه شد");
    }
  };

  // ─── Drag-and-drop reorder ─────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    // Transparent drag image for cleaner visuals (optional)
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverId !== id) setDragOverId(id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);
    if (!draggedId || draggedId === targetId) { setDraggedId(null); return; }

    const fromIndex = games.findIndex((g) => g.id === draggedId);
    const toIndex = games.findIndex((g) => g.id === targetId);
    if (fromIndex < 0 || toIndex < 0) { setDraggedId(null); return; }

    // Reorder the local array
    const next = [...games];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setGames(next);
    setDraggedId(null);

    // Persist new order to the server
    setReordering(true);
    try {
      const ids = next.map((g) => g.id);
      const res = await fetch("/api/admin/games/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Reorder failed");
      toast.success("موفق", "ترتیب بازی‌ها ذخیره شد");
    } catch (err) {
      toast.error("خطا", err instanceof Error ? err.message : "ذخیره ترتیب با مشکل مواجه شد");
      loadGames(); // revert to server state on failure
    } finally {
      setReordering(false);
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="جستجوی بازی..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white placeholder:text-gray-600 focus:border-gold/30 focus:outline-none"
            />
          </div>
          <div className="flex gap-1 bg-obsidian rounded-lg p-1">
            {(["all", "active", "inactive"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${statusFilter === s ? "bg-gold/20 text-gold" : "text-gray-500 hover:text-white"}`}
              >
                {s === "all" ? "همه" : s === "active" ? "فعال" : "غیرفعال"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadGames} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gold transition-colors" title="بازخوانی">
            <RefreshCw size={14} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gold/20 text-gold hover:bg-gold/30 transition-colors text-xs font-medium"
          >
            <Plus size={14} />
            بازی جدید
          </button>
        </div>
      </div>

      {/* Reorder hint + status */}
      {games.length > 1 && (
        <div className="flex items-center justify-between text-[10px] text-gray-500 px-1">
          <span>برای تغییر ترتیب، بازی را بکشید و رها کنیید (Drag & Drop)</span>
          {reordering && <span className="text-gold flex items-center gap-1"><RefreshCw size={10} className="animate-spin" /> در حال ذخیره...</span>}
        </div>
      )}

      {/* Games grid */}
      <div className="bg-obsidian-light rounded-xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">در حال بارگذاری...</div>
        ) : games.length === 0 ? (
          <div className="p-12 text-center">
            <Gamepad2 size={48} className="mx-auto mb-4 text-gray-700" />
            <p className="text-gray-500">هیچ بازی یافت نشد</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {games.map((g) => (
              <div
                key={g.id}
                draggable
                onDragStart={(e) => handleDragStart(e, g.id)}
                onDragOver={(e) => handleDragOver(e, g.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, g.id)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-4 p-4 transition-colors cursor-grab active:cursor-grabbing ${
                  dragOverId === g.id ? "bg-gold/5 ring-1 ring-gold/30" :
                  draggedId === g.id ? "opacity-50" : "hover:bg-white/[0.02]"
                }`}
              >
                <GripVertical size={14} className="text-gray-600 flex-shrink-0" />
                {/* Color swatch + icon */}
                <div className="flex-shrink-0">
                  {g.iconUrl ? (
                    <img src={g.iconUrl} alt={g.name} className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-lg border border-white/10 flex items-center justify-center"
                      style={{ background: `${g.accentColor}20`, borderColor: `${g.accentColor}40` }}
                    >
                      <Gamepad2 size={20} style={{ color: g.accentColor }} />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{g.name}</span>
                    {g.nameEn && <span className="text-xs text-gray-500">({g.nameEn})</span>}
                    {!g.isActive && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">غیرفعال</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>اسلاگ: <code className="text-cyber bg-cyber/5 px-1 rounded">{g.slug}</code></span>
                    <span>ترتیب: {g.sortOrder}</span>
                    <span className="flex items-center gap-1" style={{ color: g.accentColor }}>
                      <Palette size={10} />
                      {g.accentColor}
                    </span>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(g)}
                    className={`p-2 rounded-md hover:bg-white/5 transition-colors ${g.isActive ? "text-green-400" : "text-gray-500"}`}
                    title={g.isActive ? "غیرفعال کردن" : "فعال کردن"}
                  >
                    {g.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    onClick={() => openEdit(g)}
                    className="p-2 rounded-md hover:bg-white/5 text-gray-400 hover:text-gold transition-colors"
                    title="ویرایش"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(g)}
                    className="p-2 rounded-md hover:bg-white/5 text-gray-500 hover:text-danger transition-colors"
                    title="حذف"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-obsidian-light border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h3 className="text-base font-bold text-gold flex items-center gap-2">
                <Gamepad2 size={16} />
                {editing ? "ویرایش بازی" : "بازی جدید"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-5">
              {/* Basic */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">اطلاعات پایه</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">نام (FA) *</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none" dir="rtl" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">نام (EN)</label>
                    <input type="text" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">اسلاگ (FA) *</label>
                    <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none font-mono" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">اسلاگ (EN)</label>
                    <input type="text" value={form.slugEn} onChange={(e) => setForm({ ...form, slugEn: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none font-mono" dir="ltr" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">توضیحات (FA)</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none resize-none" dir="rtl" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">توضیحات (EN)</label>
                    <textarea value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} rows={2} className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none resize-none" dir="ltr" />
                  </div>
                </div>
              </div>

              {/* Appearance */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">ظاهر</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">رنگ اصلی</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer" />
                      <input type="text" value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} className="flex-1 px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none font-mono" dir="ltr" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Gradient از</label>
                    <input type="text" value={form.gradientFrom} onChange={(e) => setForm({ ...form, gradientFrom: e.target.value })} placeholder="from-red-950/50" className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none font-mono" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Gradient به</label>
                    <input type="text" value={form.gradientTo} onChange={(e) => setForm({ ...form, gradientTo: e.target.value })} placeholder="to-obsidian" className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none font-mono" dir="ltr" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">آیکون URL</label>
                    <input type="text" value={form.iconUrl} onChange={(e) => setForm({ ...form, iconUrl: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">بنر URL</label>
                    <input type="text" value={form.bannerUrl} onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none" dir="ltr" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">ترتیب نمایش</label>
                    <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none" dir="ltr" />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded border-white/20 bg-obsidian text-gold focus:ring-gold/30" />
                      <span className="text-sm text-gray-300">فعال</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SEO */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">SEO</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Meta Title (FA)</label>
                    <input type="text" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none" dir="rtl" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Meta Title (EN)</label>
                    <input type="text" value={form.metaTitleEn} onChange={(e) => setForm({ ...form, metaTitleEn: e.target.value })} className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Meta Description (FA)</label>
                    <textarea value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} rows={2} className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none resize-none" dir="rtl" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Meta Description (EN)</label>
                    <textarea value={form.metaDescriptionEn} onChange={(e) => setForm({ ...form, metaDescriptionEn: e.target.value })} rows={2} className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-sm text-white focus:border-gold/30 focus:outline-none resize-none" dir="ltr" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-white/5">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors text-sm">انصراف</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold/20 text-gold hover:bg-gold/30 transition-colors text-sm font-medium disabled:opacity-50">
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                {editing ? "ذخیره تغییرات" : "ساخت بازی"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
