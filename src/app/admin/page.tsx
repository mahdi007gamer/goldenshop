"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Package, ShoppingCart, Ticket, CreditCard, Shield,
  TrendingUp, Eye, Trash2, Edit, Search, Plus, ChevronDown,
  CheckCircle, XCircle, Clock, AlertTriangle, Settings,
  BarChart3, FileText, BookOpen, Landmark, RefreshCw, X,
  Crown, Zap, Globe, Copy, ExternalLink, Upload, ImageIcon,
  Loader2, Gamepad2, PackagePlus,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useLang } from "@/context/LangContext";
import { Button } from "@/components/ui/Button";
import { toast } from "@/store/toast-store";
import GamesTab from "@/components/admin/GamesTab";
import OrdersTab from "@/components/admin/OrdersTab";

// ─── Types ───────────────────────────────────────────────────────────────────

type AdminTab = "overview" | "products" | "games" | "licenses" | "inventory" | "users" | "orders" | "tickets" | "articles" | "courses" | "bank-cards";

interface AdminStats {
  totalUsers: number;
  activeLicenses: number;
  totalOrders: number;
  openTickets: number;
  totalProducts: number;
  revenue: number;
}

interface ProductItem {
  id: string; name: string; slug: string; game: string; category: string;
  price: number; salePrice?: number | null;
  priceDaily?: number | null; priceWeekly?: number | null;
  priceMonthly?: number | null; priceLifetime?: number | null;
  rating: number; reviewsCount: number;
  features: string; description: string; longDescription?: string | null;
  isPopular: boolean; status: string; bypassRate: string; updateStatus: string;
  imageUrl?: string | null; iconImage?: string | null; bannerImage?: string | null; galleryImages?: string | null;
  videoUrl?: string | null; audioUrl?: string | null;
  createdAt: string; updatedAt: string;
}

interface LicenseItem {
  id: string; key: string; orderId: string; userId: string; productId: string;
  productName: string; game: string; status: string; hwid?: string | null;
  activatedAt?: string | null; expiresAt: string; createdAt: string;
  user?: { username: string } | null;
}

interface UserItem {
  id: string; username: string; phone: string; role: string; status: string;
  walletBalance: number; createdAt: string; updatedAt: string;
}

interface OrderItem {
  id: string; user: { username: string } | null;
  items: { productName: string; price: number; quantity: number }[];
  subtotal: number; discount: number; total: number; status: string;
  paymentMethod: string; billingCycle: string; promoCode?: string | null;
  createdAt: string; updatedAt: string;
}

interface TicketItem {
  id: string; user: { username: string } | null; subject: string; game: string;
  status: string; createdAt: string; updatedAt: string;
  messages?: { id: string; userId: string; text: string; createdAt: string }[];
}

interface ArticleItem {
  id: string; title: string; slug: string; excerpt: string; content: string;
  coverImage?: string | null; authorId: string; authorName: string;
  category: string; tags: string; status: string; readingTime: number;
  views: number; metaTitle?: string | null; metaDescription?: string | null;
  publishedAt?: string | null; createdAt: string; updatedAt: string;
}

interface CourseItem {
  id: string; title: string; slug: string; description: string;
  thumbnail?: string | null; category: string; game: string; status: string;
  productId?: string | null; productName?: string;
  createdAt: string; updatedAt: string;
  lessons?: { id: string; title: string; order: number }[];
}

interface BankCardItem {
  id: string; cardNumber: string; shebaNumber: string; bankName: string;
  accountHolder: string; isActive: boolean; createdAt: string; updatedAt: string;
}

// ─── API Helper ──────────────────────────────────────────────────────────────

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: "include" });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Request failed");
  return json.data;
}

async function apiPost<T>(path: string, data: unknown): Promise<T> {
  const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(data) });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Request failed");
  return json.data;
}

async function apiPut<T>(path: string, data: unknown): Promise<T> {
  const res = await fetch(path, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(data) });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Request failed");
  return json.data;
}

async function apiDelete(path: string): Promise<void> {
  const res = await fetch(path, { method: "DELETE", credentials: "include" });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Request failed");
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const { user, checkSession, sessionChecked } = useAuthStore();
  const { translate: t } = useLang();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Check session on mount (zustand store starts with user=null)
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Redirect non-admins or unauthenticated users
  useEffect(() => {
    if (sessionChecked) {
      if (!user) {
        setLoading(false);
        router.replace("/login?redirect=/admin");
      } else if (user.role !== "admin") {
        setLoading(false);
        router.replace("/dashboard");
      }
    }
  }, [user, sessionChecked, router]);

  // Load stats
  const loadStats = useCallback(async () => {
    if (!user || user.role !== "admin") {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await apiGet<AdminStats>("/api/admin/stats");
      setStats(data);
    } catch {
      toast.error("خطا", "بارگذاری آمار با مشکل مواجه شد");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadStats(); }, [loadStats]);

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={24} className="text-gold animate-spin" />
          <span className="text-gray-500 text-sm">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "overview", label: "داشبورد", icon: <BarChart3 size={18} /> },
    { key: "products", label: "محصولات", icon: <Package size={18} />, count: stats?.totalProducts },
    { key: "games", label: "بازی‌ها", icon: <Gamepad2 size={18} /> },
    { key: "users", label: "کاربران", icon: <Users size={18} />, count: stats?.totalUsers },
    { key: "licenses", label: "لایسنس‌ها", icon: <Shield size={18} />, count: stats?.activeLicenses },
    { key: "inventory", label: "انبار لایسنس", icon: <PackagePlus size={18} /> },
    { key: "orders", label: "سفارشات", icon: <ShoppingCart size={18} />, count: stats?.totalOrders },
    { key: "tickets", label: "تیکت‌ها", icon: <Ticket size={18} />, count: stats?.openTickets },
    { key: "articles", label: "بلاگ", icon: <FileText size={18} /> },
    { key: "courses", label: "آموزش‌ها", icon: <BookOpen size={18} /> },
    { key: "bank-cards", label: "کارت بانکی", icon: <Landmark size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-obsidian text-white" dir="ltr">
      {/* Top bar */}
      <div className="sticky top-0 z-50 border-b border-white/5 bg-obsidian-light/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
              <Shield size={18} className="text-obsidian" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white font-display leading-tight">Admin Panel</h1>
              <p className="text-[10px] text-gray-500">Golden Cheat Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">
              Welcome, <span className="text-gold font-medium">{user?.username}</span>
            </span>
            <button onClick={loadStats} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gold transition-colors">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-obsidian-light/50 rounded-xl p-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-gold/15 text-gold border border-gold/20"
                  : "text-gray-400 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.key ? "bg-gold/20 text-gold" : "bg-white/5 text-gray-500"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && stats && <OverviewTab stats={stats} onNavigate={setActiveTab} />}
            {activeTab === "products" && <ProductsTab />}
            {activeTab === "games" && <GamesTab />}
            {activeTab === "licenses" && <LicensesTab />}
            {activeTab === "inventory" && <LicenseInventoryTab />}
            {activeTab === "users" && <UsersTab />}
            {activeTab === "orders" && <OrdersTab />}
            {activeTab === "tickets" && <TicketsTab />}
            {activeTab === "articles" && <ArticlesTab />}
            {activeTab === "courses" && <CoursesTab />}
            {activeTab === "bank-cards" && <BankCardsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab({ stats, onNavigate }: { stats: AdminStats; onNavigate: (tab: AdminTab) => void }) {
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
  const [recentTickets, setRecentTickets] = useState<TicketItem[]>([]);

  useEffect(() => {
    apiGet<{ orders: OrderItem[] }>("/api/admin/orders?take=5").then(d => setRecentOrders(d.orders)).catch(() => {});
    apiGet<{ tickets: TicketItem[] }>("/api/admin/tickets?take=5").then(d => setRecentTickets(d.tickets)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={<Users size={20} />} label="Users" value={stats.totalUsers} color="gold" />
        <StatCard icon={<Shield size={20} />} label="Licenses" value={stats.activeLicenses} color="cyber" />
        <StatCard icon={<ShoppingCart size={20} />} label="Orders" value={stats.totalOrders} color="success" />
        <StatCard icon={<Ticket size={20} />} label="Tickets" value={stats.openTickets} color="warning" />
        <StatCard icon={<Package size={20} />} label="Products" value={stats.totalProducts} color="purple" />
        <StatCard icon={<CreditCard size={20} />} label="Revenue" value={`$${stats.revenue.toFixed(0)}`} color="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="bg-obsidian-light rounded-xl border border-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><ShoppingCart size={14} className="text-gold" /> Recent Orders</h3>
            <button onClick={() => onNavigate("orders")} className="text-xs text-gold hover:underline">View All</button>
          </div>
          <div className="divide-y divide-white/5">
            {recentOrders.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-xs">No orders yet</div>
            ) : (
              recentOrders.map((o) => (
                <div key={o.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.02]">
                  <div>
                    <p className="text-xs font-medium text-white">{o.user?.username || "—"}</p>
                    <p className="text-[10px] text-gray-500">{o.items.map(i => i.productName).join(", ")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gold">${o.total.toFixed(2)}</p>
                    <StatusBadge status={o.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="bg-obsidian-light rounded-xl border border-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><Ticket size={14} className="text-gold" /> Recent Tickets</h3>
            <button onClick={() => onNavigate("tickets")} className="text-xs text-gold hover:underline">View All</button>
          </div>
          <div className="divide-y divide-white/5">
            {recentTickets.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-xs">No tickets yet</div>
            ) : (
              recentTickets.map((ticket) => (
                <div key={ticket.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.02]">
                  <div>
                    <p className="text-xs font-medium text-white">{ticket.user?.username || "—"}</p>
                    <p className="text-[10px] text-gray-500 truncate max-w-[200px]">{ticket.subject}</p>
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-obsidian-light rounded-xl border border-white/5 p-4">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Zap size={14} className="text-gold" /> Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "New Product", tab: "products" as AdminTab, icon: <Plus size={16} />, color: "gold" },
            { label: "New Article", tab: "articles" as AdminTab, icon: <FileText size={16} />, color: "cyber" },
            { label: "New Course", tab: "courses" as AdminTab, icon: <BookOpen size={16} />, color: "success" },
            { label: "Add Bank Card", tab: "bank-cards" as AdminTab, icon: <Landmark size={16} />, color: "purple" },
          ].map((action) => (
            <button
              key={action.tab}
              onClick={() => onNavigate(action.tab)}
              className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-gold/20 hover:bg-gold/5 transition-all text-xs text-gray-400 hover:text-white"
            >
              <div className={`w-7 h-7 rounded-lg bg-${action.color}/10 flex items-center justify-center text-${action.color}`}>
                {action.icon}
              </div>
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Products Tab ────────────────────────────────────────────────────────────

function ProductsTab() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [formData, setFormData] = useState({
    name: "", nameFa: "", slug: "", game: "Valorant", category: "Aimbot", price: "",
    salePrice: "", priceDaily: "", priceWeekly: "", priceMonthly: "", priceLifetime: "",
    description: "", descriptionFa: "", shortDesc: "", shortDescFa: "",
    features: "", featuresFa: "", bypassRate: "100%",
    updateStatus: "Undetected", imageUrl: "", iconImage: "", bannerImage: "", status: "active",
    galleryImages: "", videoUrl: "", audioUrl: "",
    galleryItems: "", featuresDetail: "",
  });
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<{ products: ProductItem[]; total: number }>(`/api/admin/products?search=${search}`);
      setProducts(data.products);
    } catch {
      toast.error("خطا", "بارگذاری محصولات با مشکل مواجه شد");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    setImageUploading(true);
    try {
      const uploadForm = new FormData();
      uploadForm.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: uploadForm });
      const json = await res.json();
      if (json.success) {
        setFormData((prev) => ({ ...prev, imageUrl: json.data.url }));
        toast.success("تصویر آپلود شد", "تصویر با موفقیت آپلود شد");
      } else {
        toast.error("خطا", json.error?.message || "آپلود تصویر با مشکل مواجه شد");
      }
    } catch {
      toast.error("خطا", "آپلود تصویر با مشکل مواجه شد");
    } finally {
      setImageUploading(false);
    }
  };

  // Generic file upload helper
  const uploadFile = async (file: File, type: "image" | "video" | "audio" | "file"): Promise<string | null> => {
    setUploadingField(type);
    try {
      const uploadForm = new FormData();
      uploadForm.append("file", file);
      uploadForm.append("type", type);
      const res = await fetch("/api/admin/upload", { method: "POST", body: uploadForm });
      const json = await res.json();
      if (json.success) {
        toast.success("آپلود موفق", `${type} با موفقیت آپلود شد`);
        return json.data.url;
      } else {
        toast.error("خطا", json.error?.message || "آپلود با مشکل مواجه شد");
        return null;
      }
    } catch {
      toast.error("خطا", "آپلود با مشکل مواجه شد");
      return null;
    } finally {
      setUploadingField(null);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file, "image");
    if (url) setFormData((prev) => ({ ...prev, bannerImage: url }));
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
      const existing = galleryPreviews.length > 0 ? galleryPreviews : (formData.galleryImages ? JSON.parse(formData.galleryImages) : []);
      const updated = [...existing, ...newUrls];
      setGalleryPreviews(updated);
      setFormData((prev) => ({ ...prev, galleryImages: JSON.stringify(updated) }));
    }
  };

  const removeGalleryImage = (index: number) => {
    const updated = galleryPreviews.filter((_, i) => i !== index);
    setGalleryPreviews(updated);
    setFormData((prev) => ({ ...prev, galleryImages: JSON.stringify(updated) }));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file, "video");
    if (url) setFormData((prev) => ({ ...prev, videoUrl: url }));
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file, "audio");
    if (url) setFormData((prev) => ({ ...prev, audioUrl: url }));
  };

  const handleSave = async () => {
    try {
      const parseJsonArray = (val: string) => {
        if (!val.trim()) return [];
        try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
      };
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        priceDaily: formData.priceDaily ? parseFloat(formData.priceDaily) : null,
        priceWeekly: formData.priceWeekly ? parseFloat(formData.priceWeekly) : null,
        priceMonthly: formData.priceMonthly ? parseFloat(formData.priceMonthly) : null,
        priceLifetime: formData.priceLifetime ? parseFloat(formData.priceLifetime) : null,
        features: formData.features.split("\n").filter(Boolean),
        featuresFa: formData.featuresFa.split("\n").filter(Boolean),
        galleryImages: parseJsonArray(formData.galleryImages),
        galleryItems: parseJsonArray(formData.galleryItems),
        featuresDetail: parseJsonArray(formData.featuresDetail),
      };
      if (editingProduct) {
        // PATCH with ?id= so the handler can find the product
        const res = await fetch(`/api/admin/products?id=${editingProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error?.message || "Update failed");
        toast.success("محصول به‌روزرسانی شد", `${formData.name} با موفقیت ویرایش شد`);
      } else {
        await apiPost("/api/admin/products", payload);
        toast.success("محصول جدید ایجاد شد", `${formData.name} با موفقیت اضافه شد`);
      }
      setShowModal(false);
      setEditingProduct(null);
      loadProducts();
    } catch (err: unknown) {
      toast.error("خطا", err instanceof Error ? err.message : "ذخیره محصول با مشکل مواجه شد");
    }
  };

  const handleDelete = async (product: ProductItem) => {
    if (!confirm(`Delete "${product.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/products?id=${product.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Delete failed");
      toast.success("محصول حذف شد", `${product.name} حذف شد`);
      loadProducts();
    } catch {
      toast.error("خطا", "حذف محصول با مشکل مواجه شد");
    }
  };

  const openEdit = (product: ProductItem) => {
    setEditingProduct(product);
    const gallery = product.galleryImages ? (Array.isArray(product.galleryImages) ? product.galleryImages : JSON.parse(product.galleryImages || "[]")) : [];
    setFormData({
      name: product.name, nameFa: (product as unknown as Record<string, unknown>).nameFa as string || "",
      slug: product.slug, game: product.game, category: product.category,
      price: String(product.price), salePrice: product.salePrice ? String(product.salePrice) : "",
      priceDaily: product.priceDaily != null ? String(product.priceDaily) : "",
      priceWeekly: product.priceWeekly != null ? String(product.priceWeekly) : "",
      priceMonthly: product.priceMonthly != null ? String(product.priceMonthly) : "",
      priceLifetime: product.priceLifetime != null ? String(product.priceLifetime) : "",
      description: product.description,
      descriptionFa: (product as unknown as Record<string, unknown>).descriptionFa as string || "",
      shortDesc: (product as unknown as Record<string, unknown>).shortDesc as string || "",
      shortDescFa: (product as unknown as Record<string, unknown>).shortDescFa as string || "",
      features: (Array.isArray(product.features) ? product.features : JSON.parse(product.features || "[]")).join("\n"),
      featuresFa: ((product as unknown as Record<string, unknown>).featuresFa
        ? (Array.isArray((product as unknown as Record<string, unknown>).featuresFa)
            ? ((product as unknown as Record<string, unknown>).featuresFa as string[])
            : JSON.parse((product as unknown as Record<string, unknown>).featuresFa as string || "[]"))
        : []).join("\n"),
      bypassRate: product.bypassRate, updateStatus: product.updateStatus,
      imageUrl: product.imageUrl || "", iconImage: (product as unknown as Record<string, unknown>).iconImage as string || "",
      bannerImage: (product as unknown as Record<string, unknown>).bannerImage as string || "",
      status: product.status, galleryImages: JSON.stringify(gallery),
      videoUrl: (product as unknown as Record<string, unknown>).videoUrl as string || "",
      audioUrl: (product as unknown as Record<string, unknown>).audioUrl as string || "",
      galleryItems: ((product as unknown as Record<string, unknown>).galleryItems
        ? (typeof (product as unknown as Record<string, unknown>).galleryItems === "string"
            ? (product as unknown as Record<string, unknown>).galleryItems as string
            : JSON.stringify((product as unknown as Record<string, unknown>).galleryItems))
        : ""),
      featuresDetail: ((product as unknown as Record<string, unknown>).featuresDetail
        ? (typeof (product as unknown as Record<string, unknown>).featuresDetail === "string"
            ? (product as unknown as Record<string, unknown>).featuresDetail as string
            : JSON.stringify((product as unknown as Record<string, unknown>).featuresDetail))
        : ""),
    });
    setImagePreview(product.imageUrl || null);
    setGalleryPreviews(gallery);
    setShowModal(true);
  };

  const openNew = () => {
    setEditingProduct(null);
    setFormData({
      name: "", nameFa: "", slug: "", game: "Valorant", category: "Aimbot", price: "", salePrice: "",
      priceDaily: "", priceWeekly: "", priceMonthly: "", priceLifetime: "",
      description: "", descriptionFa: "", shortDesc: "", shortDescFa: "",
      features: "", featuresFa: "", bypassRate: "100%", updateStatus: "Undetected", imageUrl: "", iconImage: "", bannerImage: "",
      status: "active", galleryImages: "[]", videoUrl: "", audioUrl: "",
      galleryItems: "", featuresDetail: "",
    });
    setImagePreview(null);
    setGalleryPreviews([]);
    setShowModal(true);
  };

  const formatPrice = (p: ProductItem) => {
    const parts: string[] = [];
    if (p.priceDaily != null) parts.push(`D:$${p.priceDaily}`);
    if (p.priceWeekly != null) parts.push(`W:$${p.priceWeekly}`);
    if (p.priceMonthly != null) parts.push(`M:$${p.priceMonthly}`);
    if (p.priceLifetime != null) parts.push(`L:$${p.priceLifetime}`);
    if (parts.length > 0) return parts.join(" · ");
    return `$${p.price}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white placeholder:text-gray-600 focus:border-gold/30 focus:outline-none" />
        </div>
        <Link href="/admin/products/new"><Button icon={<Plus size={14} />}>New Product</Button></Link>
      </div>

      <div className="bg-obsidian-light rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-gray-500">
                <th className="text-left px-3 py-2.5 font-medium">Product</th>
                <th className="text-left px-3 py-2.5 font-medium">Game</th>
                <th className="text-left px-3 py-2.5 font-medium">Price</th>
                <th className="text-left px-3 py-2.5 font-medium">Status</th>
                <th className="text-left px-3 py-2.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={`product-skel-${i}`} columns={5} />)
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No products found</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        {p.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-md object-cover border border-white/10 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-white">{p.name}</p>
                          <p className="text-gray-500 text-[10px]">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-400">{p.game}</td>
                    <td className="px-3 py-2.5">
                      <span className="text-gold font-medium">{formatPrice(p)}</span>
                    </td>
                    <td className="px-3 py-2.5"><StatusBadge status={p.status} /></td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/products/${p.id}/edit`} className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 hover:text-cyber"><Edit size={12} /></Link>
                        <button onClick={() => handleDelete(p)} className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 hover:text-danger"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} title={editingProduct ? "Edit Product" : "New Product"} wide>
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Name (EN)" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
            <InputField label="Name (FA)" value={formData.nameFa} onChange={(v) => setFormData({ ...formData, nameFa: v })} />
            <InputField label="Slug" value={formData.slug} onChange={(v) => setFormData({ ...formData, slug: v })} />
            <SelectField label="Game" value={formData.game} options={["Valorant", "CS2", "R6 Siege", "Dota 2", "Apex Legends"]} onChange={(v) => setFormData({ ...formData, game: v })} />
            <SelectField label="Category" value={formData.category} options={["Aimbot", "Wallhack", "ESP Overlay", "HWID Spoofer", "Skin Changer", "Radar"]} onChange={(v) => setFormData({ ...formData, category: v })} />
          </div>

          {/* Pricing Tiers */}
          <div className="border border-white/5 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-gold flex items-center gap-2">
              <CreditCard size={14} /> Multi-Tier Pricing
            </p>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Base Price ($)" type="number" value={formData.price} onChange={(v) => setFormData({ ...formData, price: v })} placeholder="29.99" />
              <InputField label="Sale Price ($)" type="number" value={formData.salePrice} onChange={(v) => setFormData({ ...formData, salePrice: v })} placeholder="Optional" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InputField label="Daily ($)" type="number" value={formData.priceDaily} onChange={(v) => setFormData({ ...formData, priceDaily: v })} placeholder="4.99" />
              <InputField label="Weekly ($)" type="number" value={formData.priceWeekly} onChange={(v) => setFormData({ ...formData, priceWeekly: v })} placeholder="14.99" />
              <InputField label="Monthly ($)" type="number" value={formData.priceMonthly} onChange={(v) => setFormData({ ...formData, priceMonthly: v })} placeholder="29.99" />
              <InputField label="Lifetime ($)" type="number" value={formData.priceLifetime} onChange={(v) => setFormData({ ...formData, priceLifetime: v })} placeholder="79.99" />
            </div>
          </div>

          {/* Description & Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextAreaField label="Description (EN)" value={formData.description} onChange={(v) => setFormData({ ...formData, description: v })} rows={3} />
            <TextAreaField label="Description (FA)" value={formData.descriptionFa} onChange={(v) => setFormData({ ...formData, descriptionFa: v })} rows={3} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField label="Short Description (EN)" value={formData.shortDesc} onChange={(v) => setFormData({ ...formData, shortDesc: v })} />
            <InputField label="Short Description (FA)" value={formData.shortDescFa} onChange={(v) => setFormData({ ...formData, shortDescFa: v })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextAreaField label="Features EN (one per line)" value={formData.features} onChange={(v) => setFormData({ ...formData, features: v })} rows={4} />
            <TextAreaField label="Features FA (one per line)" value={formData.featuresFa} onChange={(v) => setFormData({ ...formData, featuresFa: v })} rows={4} />
          </div>

          {/* Rich Features & Gallery (JSON) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextAreaField label="Features Detail (JSON: [{titleFa,titleEn,icon}])" value={formData.featuresDetail} onChange={(v) => setFormData({ ...formData, featuresDetail: v })} rows={3} />
            <TextAreaField label="Gallery Items (JSON: [{url,captionFa,captionEn,order}])" value={formData.galleryItems} onChange={(v) => setFormData({ ...formData, galleryItems: v })} rows={3} />
          </div>

          {/* Image Upload */}
          <div className="border border-white/5 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-gold">Product Image</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div className="w-24 h-24 rounded-lg border border-white/10 bg-obsidian flex items-center justify-center overflow-hidden flex-shrink-0">
                {imagePreview || formData.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagePreview || formData.imageUrl || ""}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon size={24} className="text-gray-600" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline-gold"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUploading}
                    icon={imageUploading ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}
                  >
                    {imageUploading ? "Uploading..." : "Upload Image"}
                  </Button>
                  {(imagePreview || formData.imageUrl) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData((prev) => ({ ...prev, imageUrl: "" }));
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      <Trash2 size={12} className="text-danger" />
                    </Button>
                  )}
                </div>
                <InputField
                  label="Or paste image URL"
                  value={formData.imageUrl}
                  onChange={(v) => {
                    setFormData({ ...formData, imageUrl: v });
                    setImagePreview(v || null);
                  }}
                  placeholder="/images/product.png"
                />
              </div>
            </div>
          </div>

          {/* Media Upload Section */}
          <div className="border border-white/5 rounded-xl p-4 space-y-4">
            <p className="text-xs font-bold text-gold flex items-center gap-2">
              <ImageIcon size={14} /> Media Files
            </p>

            {/* Banner Image */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-medium">Banner Image</label>
                <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                <div className="flex items-center gap-2">
                  <Button variant="outline-gold" size="sm" onClick={() => bannerInputRef.current?.click()} disabled={uploadingField === "image"}
                    icon={uploadingField === "image" ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}>
                    {uploadingField === "image" ? "Uploading..." : "Upload Banner"}
                  </Button>
                  {formData.bannerImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={formData.bannerImage} alt="banner" className="w-10 h-10 rounded-md object-cover border border-white/10" />
                  )}
                </div>
              </div>

              {/* Video Upload */}
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-medium">Video (MP4, WebM)</label>
                <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                <div className="flex items-center gap-2">
                  <Button variant="outline-gold" size="sm" onClick={() => videoInputRef.current?.click()} disabled={uploadingField === "video"}
                    icon={uploadingField === "video" ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}>
                    {uploadingField === "video" ? "Uploading..." : "Upload Video"}
                  </Button>
                  {formData.videoUrl && <span className="text-[10px] text-success">Video uploaded</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Audio Upload */}
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-medium">Audio (MP3, WAV, OGG)</label>
                <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                <div className="flex items-center gap-2">
                  <Button variant="outline-gold" size="sm" onClick={() => audioInputRef.current?.click()} disabled={uploadingField === "audio"}
                    icon={uploadingField === "audio" ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}>
                    {uploadingField === "audio" ? "Uploading..." : "Upload Audio"}
                  </Button>
                  {formData.audioUrl && <span className="text-[10px] text-success">Audio uploaded</span>}
                </div>
              </div>

              {/* Gallery Upload */}
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-medium">Gallery Images</label>
                <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
                <div className="flex items-center gap-2">
                  <Button variant="outline-gold" size="sm" onClick={() => galleryInputRef.current?.click()} disabled={uploadingField === "image"}
                    icon={uploadingField === "image" ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}>
                    Add Images
                  </Button>
                  <span className="text-[10px] text-gray-500">{galleryPreviews.length} images</span>
                </div>
                {galleryPreviews.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {galleryPreviews.map((url, idx) => (
                      <div key={url} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-14 h-14 rounded-md object-cover border border-white/10" />
                        <button onClick={() => removeGalleryImage(idx)}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-white flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* URL fields for video/audio */}
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Video URL (or upload above)" value={formData.videoUrl} onChange={(v) => setFormData({ ...formData, videoUrl: v })} placeholder="/uploads/videos/..." />
              <InputField label="Audio URL (or upload above)" value={formData.audioUrl} onChange={(v) => setFormData({ ...formData, audioUrl: v })} placeholder="/uploads/audio/..." />
            </div>
          </div>

          {/* Other Settings */}
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Bypass Rate" value={formData.bypassRate} onChange={(v) => setFormData({ ...formData, bypassRate: v })} />
            <SelectField label="Update Status" value={formData.updateStatus} options={["Undetected", "Updating", "Testing"]} onChange={(v) => setFormData({ ...formData, updateStatus: v })} />
            <SelectField label="Status" value={formData.status} options={["active", "inactive"]} onChange={(v) => setFormData({ ...formData, status: v })} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} icon={<CheckCircle size={14} />}>{editingProduct ? "Update" : "Create"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Licenses Tab ────────────────────────────────────────────────────────────

function LicensesTab() {
  const [licenses, setLicenses] = useState<LicenseItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ userId: "", productId: "", quantity: "1", billingCycle: "monthly", expiresAt: "" });

  const loadLicenses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<{ licenses: LicenseItem[]; total: number }>(`/api/admin/licenses?search=${search}`);
      setLicenses(data.licenses);
    } catch {
      toast.error("خطا", "بارگذاری لایسنس‌ها با مشکل مواجه شد");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { loadLicenses(); }, [loadLicenses]);

  const handleCreate = async () => {
    try {
      await apiPost("/api/admin/licenses", {
        ...formData,
        quantity: parseInt(formData.quantity),
        expiresAt: formData.expiresAt || undefined,
      });
      toast.success("لایسنس ایجاد شد", `${formData.quantity} لایسنس جدید با موفقیت ساخته شد`);
      setShowModal(false);
      loadLicenses();
    } catch (err: unknown) {
      toast.error("خطا", err instanceof Error ? err.message : "ساخت لایسنس با مشکل مواجه شد");
    }
  };

  const handleRevoke = async (license: LicenseItem) => {
    if (!confirm(`Revoke license "${license.key}"?`)) return;
    try {
      await apiDelete(`/api/admin/licenses/${license.id}`);
      toast.success("لایسنس لغو شد", "لایسنس با موفقیت غیرفعال شد");
      loadLicenses();
    } catch {
      toast.error("خطا", "لغو لایسنس با مشکل مواجه شد");
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.info("کپی شد", "کلید لایسنس کپی شد");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search licenses..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white placeholder:text-gray-600 focus:border-gold/30 focus:outline-none" />
        </div>
        <Button onClick={() => setShowModal(true)} icon={<Plus size={14} />}>Generate License</Button>
      </div>

      <div className="bg-obsidian-light rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-gray-500">
                <th className="text-left px-3 py-2.5 font-medium">Key</th>
                <th className="text-left px-3 py-2.5 font-medium">User</th>
                <th className="text-left px-3 py-2.5 font-medium">Product</th>
                <th className="text-left px-3 py-2.5 font-medium">Status</th>
                <th className="text-left px-3 py-2.5 font-medium">Expires</th>
                <th className="text-left px-3 py-2.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={`lic-skel-${i}`} columns={6} />)
              ) : licenses.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">No licenses found</td></tr>
              ) : (
                licenses.map((l) => (
                  <tr key={l.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <code className="text-[10px] font-mono text-cyber bg-cyber/5 px-1.5 py-0.5 rounded">{l.key}</code>
                        <button onClick={() => copyKey(l.key)} className="text-gray-500 hover:text-white"><Copy size={10} /></button>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-white">{l.user?.username || "—"}</td>
                    <td className="px-3 py-2.5 text-gray-400">{l.productName}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={l.status} /></td>
                    <td className="px-3 py-2.5 text-gray-500 text-[10px]">{new Date(l.expiresAt).toLocaleDateString()}</td>
                    <td className="px-3 py-2.5">
                      <button onClick={() => handleRevoke(l)} className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 hover:text-danger"><XCircle size={12} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} title="Generate License">
        <div className="space-y-3">
          <InputField label="User ID" value={formData.userId} onChange={(v) => setFormData({ ...formData, userId: v })} placeholder="Enter user ID" />
          <InputField label="Product ID" value={formData.productId} onChange={(v) => setFormData({ ...formData, productId: v })} placeholder="Enter product ID" />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Quantity" type="number" value={formData.quantity} onChange={(v) => setFormData({ ...formData, quantity: v })} />
            <SelectField label="Billing Cycle" value={formData.billingCycle} options={["monthly", "lifetime"]} onChange={(v) => setFormData({ ...formData, billingCycle: v })} />
          </div>
          <InputField label="Expires At" type="date" value={formData.expiresAt} onChange={(v) => setFormData({ ...formData, expiresAt: v })} placeholder="Optional" />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} icon={<Zap size={14} />}>Generate</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── License Inventory Tab ────────────────────────────────────────────────────

interface InventoryItem {
  id: string;
  productId: string;
  productName: string | null;
  billingCycle: string | null;
  licenseKey: string;
  status: string;
  createdAt: string;
  orderId?: string | null;
  assignedAt?: string | null;
  product?: { id: string; name: string; nameFa: string | null; slug: string };
  order?: { id: string; user?: { username: string } } | null;
}

interface StockEntry {
  productId: string;
  billingCycle: string | null;
  available: number;
}

function LicenseInventoryTab() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stock, setStock] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({ productId: "", billingCycle: "monthly", licenseKey: "", productName: "" });
  const [products, setProducts] = useState<{ id: string; name: string; nameFa: string | null }[]>([]);

  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);
      const [invData, prodData] = await Promise.all([
        apiGet<{ items: InventoryItem[]; stock: StockEntry[] }>("/api/admin/licenses/inventory"),
        apiGet<{ products: { id: string; name: string; nameFa: string | null }[] }>("/api/admin/products"),
      ]);
      setItems(invData.items);
      setStock(invData.stock);
      setProducts(prodData.products);
    } catch {
      toast.error("خطا", "بارگذاری انبار لایسنس با مشکل مواجه شد");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadInventory(); }, [loadInventory]);

  const handleAdd = async () => {
    try {
      const res = await fetch("/api/admin/licenses/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("لایسنس اضافه شد", "لایسنس جدید به انبار اضافه شد");
        setShowAdd(false);
        setFormData({ productId: "", billingCycle: "monthly", licenseKey: "", productName: "" });
        loadInventory();
      } else {
        toast.error("خطا", data.error?.message || "اضافه کردن لایسنس با مشکل مواجه شد");
      }
    } catch {
      toast.error("خطا", "ارتباط با سرور برقرار نشد");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("از حذف این لایسنس از انبار مطمئن هستید؟")) return;
    try {
      const res = await fetch(`/api/admin/licenses/inventory/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("حذف شد", "لایسنس از انبار حذف شد");
        loadInventory();
      } else {
        toast.error("خطا", data.error?.message || "حذف لایسنس با مشکل مواجه شد");
      }
    } catch {
      toast.error("خطا", "ارتباط با سرور برقرار نشد");
    }
  };

  const getProductName = (productId: string) => {
    const p = products.find((pr) => pr.id === productId);
    return p?.nameFa || p?.name || productId;
  };

  return (
    <div className="space-y-6">
      {/* Stock Summary */}
      {stock.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">موجودی انبار</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {stock.map((s, i) => (
              <div
                key={`${s.productId}-${s.billingCycle}-${i}`}
                className="p-3 rounded-xl border border-white/5 bg-obsidian-light"
              >
                <p className="text-xs text-gray-400 mb-1">{getProductName(s.productId)}</p>
                <p className="text-[10px] text-gold/60 mb-1">{s.billingCycle || "—"}</p>
                <p className={`text-lg font-bold ${s.available > 0 ? "text-green-400" : "text-red-400"}`}>
                  {s.available}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-sm font-semibold text-gray-400">لیست لایسنس‌ها در انبار</h3>
        <Button onClick={() => setShowAdd(true)} icon={<Plus size={14} />}>افزودن لایسنس</Button>
      </div>

      {/* Table */}
      <div className="bg-obsidian-light rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-gray-500">
                <th className="text-left px-3 py-2.5 font-medium">محصول</th>
                <th className="text-left px-3 py-2.5 font-medium">دوره</th>
                <th className="text-left px-3 py-2.5 font-medium">کلید لایسنس</th>
                <th className="text-left px-3 py-2.5 font-medium">وضعیت</th>
                <th className="text-left px-3 py-2.5 font-medium">تاریخ</th>
                <th className="text-left px-3 py-2.5 font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={`inv-skel-${i}`} columns={6} />)
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">هیچ لایسنسی در انبار نیست</td></tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer"
                    onClick={() => { setSelectedItem(item); setShowDetail(true); }}
                  >
                    <td className="px-3 py-2.5 text-white">
                      {item.product?.nameFa || item.productName || getProductName(item.productId)}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-gold/10 text-gold">
                        {item.billingCycle || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <code className="text-[10px] font-mono text-cyber bg-cyber/5 px-1.5 py-0.5 rounded">
                        {item.licenseKey.length > 20
                          ? `${item.licenseKey.slice(0, 10)}...${item.licenseKey.slice(-8)}`
                          : item.licenseKey}
                      </code>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                        item.status === "available"
                          ? "bg-green-500/15 text-green-400"
                          : item.status === "assigned"
                            ? "bg-blue-500/15 text-blue-400"
                            : "bg-gray-500/15 text-gray-400"
                      }`}>
                        {item.status === "available" ? "آزاد" : item.status === "assigned" ? "تخصیص یافته" : item.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-500 text-[10px]">
                      {new Date(item.createdAt).toLocaleDateString("fa-IR")}
                    </td>
                    <td className="px-3 py-2.5">
                      {item.status === "available" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                          className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 hover:text-danger"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal show={showAdd} onClose={() => setShowAdd(false)} title="افزودن لایسنس به انبار">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">محصول</label>
            <select
              value={formData.productId}
              onChange={(e) => {
                const p = products.find((pr) => pr.id === e.target.value);
                setFormData({ ...formData, productId: e.target.value, productName: p?.nameFa || p?.name || "" });
              }}
              className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
            >
              <option value="">انتخاب محصول...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.nameFa || p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">دوره صورتحساب</label>
            <select
              value={formData.billingCycle}
              onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
              className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
            >
              <option value="daily">روزانه</option>
              <option value="weekly">هفتگی</option>
              <option value="monthly">ماهانه</option>
              <option value="lifetime">مادام‌العمر</option>
            </select>
          </div>
          <InputField
            label="کلید لایسنس"
            value={formData.licenseKey}
            onChange={(v) => setFormData({ ...formData, licenseKey: v })}
            placeholder="مثال: XXXX-XXXX-XXXX-XXXX"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowAdd(false)}>انصراف</Button>
            <Button
              onClick={handleAdd}
              icon={<Plus size={14} />}
              disabled={!formData.productId || !formData.licenseKey.trim()}
            >
              افزودن
            </Button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal show={showDetail} onClose={() => { setShowDetail(false); setSelectedItem(null); }} title="جزئیات لایسنس">
        {selectedItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-obsidian rounded-lg border border-white/5">
                <p className="text-[10px] text-gray-500 mb-0.5">شناسه</p>
                <code className="text-xs font-mono text-white break-all">{selectedItem.id}</code>
              </div>
              <div className="p-3 bg-obsidian rounded-lg border border-white/5">
                <p className="text-[10px] text-gray-500 mb-0.5">کلید لایسنس</p>
                <code className="text-xs font-mono text-cyber break-all">{selectedItem.licenseKey}</code>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-obsidian rounded-lg border border-white/5">
                <p className="text-[10px] text-gray-500 mb-0.5">محصول</p>
                <p className="text-xs text-white font-medium">
                  {selectedItem.product?.nameFa || selectedItem.productName || "—"}
                </p>
                {selectedItem.product?.slug && (
                  <p className="text-[10px] text-gray-500 mt-0.5">اسلاگ: {selectedItem.product.slug}</p>
                )}
              </div>
              <div className="p-3 bg-obsidian rounded-lg border border-white/5">
                <p className="text-[10px] text-gray-500 mb-0.5">دوره صورتحساب</p>
                <span className="px-2 py-0.5 rounded text-xs bg-gold/10 text-gold font-medium">
                  {selectedItem.billingCycle || "—"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-obsidian rounded-lg border border-white/5">
                <p className="text-[10px] text-gray-500 mb-0.5">وضعیت</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  selectedItem.status === "available"
                    ? "bg-green-500/15 text-green-400"
                    : selectedItem.status === "assigned"
                      ? "bg-blue-500/15 text-blue-400"
                      : "bg-gray-500/15 text-gray-400"
                }`}>
                  {selectedItem.status === "available" ? "آزاد" : selectedItem.status === "assigned" ? "تخصیص یافته" : selectedItem.status}
                </span>
              </div>
              <div className="p-3 bg-obsidian rounded-lg border border-white/5">
                <p className="text-[10px] text-gray-500 mb-0.5">تاریخ ایجاد</p>
                <p className="text-xs text-white">
                  {new Date(selectedItem.createdAt).toLocaleString("fa-IR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>

            {selectedItem.status === "assigned" && selectedItem.orderId && (
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-[10px] text-blue-400 mb-1 font-medium">اطلاعات تخصیص به سفارش</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">شناسه سفارش</p>
                    <p className="text-white font-mono">{selectedItem.orderId}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">کاربر</p>
                    <p className="text-white">{selectedItem.order?.user?.username || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">تاریخ تخصیص</p>
                    <p className="text-white">
                      {selectedItem.assignedAt
                        ? new Date(selectedItem.assignedAt).toLocaleString("fa-IR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
              <Button variant="ghost" onClick={() => { setShowDetail(false); setSelectedItem(null); }}>بستن</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Users Tab ───────────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [formData, setFormData] = useState({ username: "", phone: "", role: "user", status: "active", walletBalance: "", password: "" });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<{ users: UserItem[]; total: number }>(`/api/admin/users?search=${search}`);
      setUsers(data.users);
    } catch {
      toast.error("خطا", "بارگذاری کاربران با مشکل مواجه شد");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleSave = async () => {
    try {
      const payload: Record<string, unknown> = {
        username: formData.username, phone: formData.phone, role: formData.role,
        status: formData.status, walletBalance: parseFloat(formData.walletBalance),
      };
      if (formData.password) payload.password = formData.password;
      if (editingUser) {
        await apiPut(`/api/admin/users/${editingUser.id}`, payload);
        toast.success("کاربر به‌روزرسانی شد", `${formData.username} ویرایش شد`);
      } else {
        await apiPost("/api/admin/users", payload);
        toast.success("کاربر جدید ایجاد شد", `${formData.username} با موفقیت اضافه شد`);
      }
      setShowModal(false);
      setEditingUser(null);
      loadUsers();
    } catch (err: unknown) {
      toast.error("خطا", err instanceof Error ? err.message : "ذخیره کاربر با مشکل مواجه شد");
    }
  };

  const handleDelete = async (user: UserItem) => {
    if (!confirm(`Delete user "${user.username}"?`)) return;
    try {
      await apiDelete(`/api/admin/users/${user.id}`);
      toast.success("کاربر حذف شد", `${user.username} حذف شد`);
      loadUsers();
    } catch {
      toast.error("خطا", "حذف کاربر با مشکل مواجه شد");
    }
  };

  const openEdit = (user: UserItem) => {
    setEditingUser(user);
    setFormData({ username: user.username, phone: user.phone, role: user.role, status: user.status, walletBalance: String(user.walletBalance), password: "" });
    setShowModal(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white placeholder:text-gray-600 focus:border-gold/30 focus:outline-none" />
        </div>
        <Button onClick={() => { setEditingUser(null); setFormData({ username: "", phone: "", role: "user", status: "active", walletBalance: "0", password: "" }); setShowModal(true); }} icon={<Plus size={14} />}>New User</Button>
      </div>

      <div className="bg-obsidian-light rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-gray-500">
                <th className="text-left px-3 py-2.5 font-medium">Username</th>
                <th className="text-left px-3 py-2.5 font-medium">Phone</th>
                <th className="text-left px-3 py-2.5 font-medium">Role</th>
                <th className="text-left px-3 py-2.5 font-medium">Balance</th>
                <th className="text-left px-3 py-2.5 font-medium">Status</th>
                <th className="text-left px-3 py-2.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={`user-skel-${i}`} columns={6} />)
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">No users found</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-3 py-2.5 font-medium text-white">{u.username}</td>
                    <td className="px-3 py-2.5 text-gray-400 font-mono text-[10px]">{u.phone}</td>
                    <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${u.role === "admin" ? "bg-gold/15 text-gold" : "bg-white/5 text-gray-400"}`}>{u.role}</span></td>
                    <td className="px-3 py-2.5 text-gold">${u.walletBalance.toFixed(2)}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={u.status} /></td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 hover:text-cyber"><Edit size={12} /></button>
                        <button onClick={() => handleDelete(u)} className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 hover:text-danger"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} title={editingUser ? "Edit User" : "New User"}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Username" value={formData.username} onChange={(v) => setFormData({ ...formData, username: v })} />
            <InputField label="Phone" value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} />
            <SelectField label="Role" value={formData.role} options={["user", "admin"]} onChange={(v) => setFormData({ ...formData, role: v })} />
            <SelectField label="Status" value={formData.status} options={["active", "suspended"]} onChange={(v) => setFormData({ ...formData, status: v })} />
            <InputField label="Wallet Balance" type="number" value={formData.walletBalance} onChange={(v) => setFormData({ ...formData, walletBalance: v })} />
            <InputField label={editingUser ? "New Password (optional)" : "Password"} type="password" value={formData.password} onChange={(v) => setFormData({ ...formData, password: v })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} icon={<CheckCircle size={14} />}>{editingUser ? "Update" : "Create"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Orders Tab (Pro) — imported from @/components/admin/OrdersTab ──────────

// ─── Tickets Tab ─────────────────────────────────────────────────────────────

function TicketsTab() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [replyText, setReplyText] = useState("");

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      params.set("take", "50");
      const data = await apiGet<{ tickets: TicketItem[]; total: number }>(`/api/admin/tickets?${params}`);
      setTickets(data.tickets);
    } catch {
      toast.error("خطا", "بارگذاری تیکت‌ها با مشکل مواجه شد");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const handleReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    try {
      await apiPut(`/api/admin/tickets/${selectedTicket.id}`, { status: "answered", reply: replyText });
      toast.success("پاسخ ارسال شد", "پاسخ شما با موفقیت ارسال شد");
      setReplyText("");
      loadTickets();
      setSelectedTicket(null);
    } catch {
      toast.error("خطا", "ارسال پاسخ با مشکل مواجه شد");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none">
          <option value="">All Tickets</option>
          <option value="open">Open</option>
          <option value="answered">Answered</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-obsidian-light rounded-xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-obsidian-light">
                <tr className="border-b border-white/5 text-gray-500">
                  <th className="text-left px-3 py-2.5 font-medium">Subject</th>
                  <th className="text-left px-3 py-2.5 font-medium">User</th>
                  <th className="text-left px-3 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={`ticket-skel-${i}`} columns={3} />)
                ) : tickets.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-8 text-gray-500">No tickets found</td></tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className={`border-b border-white/5 hover:bg-white/[0.02] cursor-pointer ${selectedTicket?.id === ticket.id ? "bg-gold/5" : ""}`} onClick={() => setSelectedTicket(ticket)}>
                      <td className="px-3 py-2.5">
                        <p className="text-white font-medium truncate max-w-[200px]">{ticket.subject}</p>
                        <p className="text-gray-500 text-[10px]">{ticket.game}</p>
                      </td>
                      <td className="px-3 py-2.5 text-gray-400">{ticket.user?.username || "—"}</td>
                      <td className="px-3 py-2.5"><StatusBadge status={ticket.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-obsidian-light rounded-xl border border-white/5 p-4">
          {selectedTicket ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">{selectedTicket.subject}</h3>
                <button onClick={() => setSelectedTicket(null)} className="text-gray-500 hover:text-white"><X size={14} /></button>
              </div>
              <div className="text-xs text-gray-400">
                <span>From: {selectedTicket.user?.username || "—"}</span> | <span>Game: {selectedTicket.game}</span> | <span>{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="border-t border-white/5 pt-3 space-y-2 max-h-[300px] overflow-y-auto">
                {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                  selectedTicket.messages.map((msg) => (
                    <div key={msg.id} className={`p-2 rounded-lg text-xs ${msg.userId === "admin" ? "bg-gold/10 border border-gold/20" : "bg-white/5"}`}>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-medium text-white">{msg.userId === "admin" ? "Admin" : "User"}</span>
                        <span className="text-gray-500 text-[10px]">{new Date(msg.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-300">{msg.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-xs">No messages yet</p>
                )}
              </div>
              <div className="border-t border-white/5 pt-3 space-y-2">
                <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your reply..."
                  className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white placeholder:text-gray-600 focus:border-gold/30 focus:outline-none resize-none h-20" />
                <div className="flex justify-between">
                  <select value={selectedTicket.status} onChange={(e) => apiPut(`/api/admin/tickets/${selectedTicket.id}`, { status: e.target.value }).then(() => { loadTickets(); setSelectedTicket({ ...selectedTicket, status: e.target.value }); }).catch(() => toast.error("خطا", "تغییر وضعیت با مشکل مواجه شد"))}
                    className="px-2 py-1.5 bg-obsidian border border-white/10 rounded text-[10px] text-white focus:outline-none">
                    <option value="open">Open</option>
                    <option value="answered">Answered</option>
                    <option value="closed">Closed</option>
                  </select>
                  <Button onClick={handleReply} icon={<Zap size={12} />} disabled={!replyText.trim()}>Reply</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500 text-xs">Select a ticket to view</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Articles Tab ────────────────────────────────────────────────────────────

function ArticlesTab() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadArticles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<{ articles: ArticleItem[]; total: number }>(`/api/admin/articles?search=${search}`);
      setArticles(data.articles);
    } catch {
      toast.error("خطا", "بارگذاری مقالات با مشکل مواجه شد");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { loadArticles(); }, [loadArticles]);

  const handleDelete = async (article: ArticleItem) => {
    if (!confirm(`Delete "${article.title}"?`)) return;
    try {
      await apiDelete(`/api/admin/articles/${article.id}`);
      toast.success("مقاله حذف شد");
      loadArticles();
    } catch {
      toast.error("خطا", "حذف مقاله با مشکل مواجه شد");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white placeholder:text-gray-600 focus:border-gold/30 focus:outline-none" />
        </div>
        <Link href="/admin/articles/new" className="inline-flex items-center gap-1.5 px-3 py-2 bg-gold text-obsidian text-xs font-semibold rounded-lg hover:bg-gold/90 transition-colors">
          <Plus size={14} /> New Article
        </Link>
      </div>

      <div className="bg-obsidian-light rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-gray-500">
                <th className="text-left px-3 py-2.5 font-medium">Title</th>
                <th className="text-left px-3 py-2.5 font-medium">Category</th>
                <th className="text-left px-3 py-2.5 font-medium">Status</th>
                <th className="text-left px-3 py-2.5 font-medium">Views</th>
                <th className="text-left px-3 py-2.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={`article-skel-${i}`} columns={5} />)
              ) : articles.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No articles found</td></tr>
              ) : (
                articles.map((a) => (
                  <tr key={a.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-3 py-2.5">
                      <p className="font-medium text-white">{a.title}</p>
                      <p className="text-gray-500 text-[10px]">{a.slug}</p>
                    </td>
                    <td className="px-3 py-2.5 text-gray-400">{a.category}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={a.status} /></td>
                    <td className="px-3 py-2.5 text-gray-400">{a.views}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/articles/${a.id}/edit`} className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 hover:text-cyber"><Edit size={12} /></Link>
                        <button onClick={() => handleDelete(a)} className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 hover:text-danger"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Courses Tab ─────────────────────────────────────────────────────────────

function CoursesTab() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; game: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [formData, setFormData] = useState({ title: "", slug: "", description: "", thumbnail: "", category: "General", game: "General", status: "draft", productId: "" });
  const [lessonForm, setLessonForm] = useState({ title: "", content: "", videoUrl: "", imageUrl: "", audioUrl: "", fileUrl: "", fileName: "", duration: "10", order: "0" });
  const [uploadingLessonField, setUploadingLessonField] = useState<string | null>(null);
  const lessonVideoRef = useRef<HTMLInputElement>(null);
  const lessonImageRef = useRef<HTMLInputElement>(null);
  const lessonAudioRef = useRef<HTMLInputElement>(null);
  const lessonFileRef = useRef<HTMLInputElement>(null);

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      const [coursesData, productsData] = await Promise.all([
        apiGet<{ courses: CourseItem[]; total: number }>("/api/admin/courses"),
        apiGet<{ products: { id: string; name: string; game: string }[]; total: number }>("/api/admin/products?take=100"),
      ]);
      setCourses(coursesData.courses);
      setProducts(productsData.products);
    } catch {
      toast.error("خطا", "بارگذاری دوره‌ها با مشکل مواجه شد");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  const handleSave = async () => {
    try {
      const payload = { ...formData, productId: formData.productId || null };
      if (editingCourse) {
        await apiPut(`/api/admin/courses/${editingCourse.id}`, payload);
        toast.success("دوره به‌روزرسانی شد");
      } else {
        await apiPost("/api/admin/courses", payload);
        toast.success("دوره جدید ایجاد شد");
      }
      setShowModal(false);
      setEditingCourse(null);
      loadCourses();
    } catch (err: unknown) {
      toast.error("خطا", err instanceof Error ? err.message : "ذخیره دوره با مشکل مواجه شد");
    }
  };

  const uploadLessonFile = async (file: File, field: "videoUrl" | "imageUrl" | "audioUrl" | "fileUrl"): Promise<string | null> => {
    setUploadingLessonField(field);
    try {
      const uploadForm = new FormData();
      uploadForm.append("file", file);
      const type = field === "videoUrl" ? "video" : field === "audioUrl" ? "audio" : field === "imageUrl" ? "image" : "file";
      uploadForm.append("type", type);
      const res = await fetch("/api/admin/upload", { method: "POST", body: uploadForm });
      const json = await res.json();
      if (json.success) {
        toast.success("آپلود موفق", `${type} با موفقیت آپلود شد`);
        return json.data.url;
      }
      toast.error("خطا", json.error?.message || "آپلود با مشکل مواجه شد");
      return null;
    } catch {
      toast.error("خطا", "آپلود با مشکل مواجه شد");
      return null;
    } finally {
      setUploadingLessonField(null);
    }
  };

  const handleAddLesson = async () => {
    try {
      await apiPost(`/api/admin/courses/${selectedCourseId}/lessons`, {
        ...lessonForm,
        duration: parseInt(lessonForm.duration),
        order: parseInt(lessonForm.order),
        imageUrl: lessonForm.imageUrl || null,
        audioUrl: lessonForm.audioUrl || null,
        fileUrl: lessonForm.fileUrl || null,
        fileName: lessonForm.fileName || null,
      });
      toast.success("درس جدید اضافه شد");
      setShowLessonModal(false);
      setLessonForm({ title: "", content: "", videoUrl: "", imageUrl: "", audioUrl: "", fileUrl: "", fileName: "", duration: "10", order: "0" });
      loadCourses();
    } catch (err: unknown) {
      toast.error("خطا", err instanceof Error ? err.message : "اضافه کردن درس با مشکل مواجه شد");
    }
  };

  const handleDeleteCourse = async (course: CourseItem) => {
    if (!confirm(`Delete "${course.title}"?`)) return;
    try {
      await apiDelete(`/api/admin/courses/${course.id}`);
      toast.success("دوره حذف شد");
      loadCourses();
    } catch {
      toast.error("خطا", "حذف دوره با مشکل مواجه شد");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><BookOpen size={18} className="text-gold" /> Courses</h2>
        <Button onClick={() => { setEditingCourse(null); setFormData({ title: "", slug: "", description: "", thumbnail: "", category: "General", game: "General", status: "draft", productId: "" }); setShowModal(true); }} icon={<Plus size={14} />}>New Course</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading ? (
          <CardsSkeleton count={6} />
        ) : courses.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">No courses yet</div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="bg-obsidian-light rounded-xl border border-white/5 overflow-hidden hover:border-gold/20 transition-colors">
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{course.title}</h3>
                    <p className="text-[10px] text-gray-500">{course.game} · {course.category}</p>
                  </div>
                  <StatusBadge status={course.status} />
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-gray-500">{course.lessons?.length || 0} lessons</span>
                  {course.productName && (
                    <span className="text-[10px] text-gold bg-gold/10 px-1.5 py-0.5 rounded">
                      {course.productName}
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setSelectedCourseId(course.id); setShowLessonModal(true); }} className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-cyber" title="Add Lesson"><Plus size={12} /></button>
                    <button onClick={() => { setEditingCourse(course); setFormData({ title: course.title, slug: course.slug, description: course.description, thumbnail: course.thumbnail || "", category: course.category, game: course.game, status: course.status, productId: course.productId || "" }); setShowModal(true); }} className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-gold"><Edit size={12} /></button>
                    <button onClick={() => handleDeleteCourse(course)} className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-danger"><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} title={editingCourse ? "Edit Course" : "New Course"}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Title" value={formData.title} onChange={(v) => setFormData({ ...formData, title: v })} />
            <InputField label="Slug" value={formData.slug} onChange={(v) => setFormData({ ...formData, slug: v })} />
            <SelectField label="Game" value={formData.game} options={["Valorant", "CS2", "R6 Siege", "Dota 2", "Apex Legends", "General"]} onChange={(v) => setFormData({ ...formData, game: v })} />
            <SelectField label="Category" value={formData.category} options={["Tutorial", "Installation", "Configuration", "General"]} onChange={(v) => setFormData({ ...formData, category: v })} />
            <InputField label="Thumbnail URL" value={formData.thumbnail} onChange={(v) => setFormData({ ...formData, thumbnail: v })} />
            <SelectField label="Status" value={formData.status} options={["draft", "published"]} onChange={(v) => setFormData({ ...formData, status: v })} />
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-medium">Linked Product</label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none transition-colors"
              >
                <option value="">— None —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.game})</option>
                ))}
              </select>
            </div>
          </div>
          <TextAreaField label="Description" value={formData.description} onChange={(v) => setFormData({ ...formData, description: v })} rows={3} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} icon={<CheckCircle size={14} />}>{editingCourse ? "Update" : "Create"}</Button>
          </div>
        </div>
      </Modal>

      <Modal show={showLessonModal} onClose={() => setShowLessonModal(false)} title="Add Lesson">
        <div className="space-y-3">
          <InputField label="Lesson Title" value={lessonForm.title} onChange={(v) => setLessonForm({ ...lessonForm, title: v })} />
          <TextAreaField label="Content" value={lessonForm.content} onChange={(v) => setLessonForm({ ...lessonForm, content: v })} rows={3} />

          {/* Video Upload */}
          <div className="border border-white/5 rounded-xl p-3 space-y-2">
            <p className="text-[10px] text-gold font-medium">Video</p>
            <input ref={lessonVideoRef} type="file" accept="video/*" className="hidden"
              onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const url = await uploadLessonFile(f, "videoUrl"); if (url) setLessonForm(prev => ({ ...prev, videoUrl: url })); }} />
            <div className="flex items-center gap-2">
              <Button variant="outline-gold" size="sm" onClick={() => lessonVideoRef.current?.click()} disabled={uploadingLessonField === "videoUrl"}
                icon={uploadingLessonField === "videoUrl" ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}>
                {uploadingLessonField === "videoUrl" ? "Uploading..." : "Upload Video"}
              </Button>
              {lessonForm.videoUrl && <span className="text-[10px] text-success">Video uploaded</span>}
            </div>
            <InputField label="Or paste video URL" value={lessonForm.videoUrl} onChange={(v) => setLessonForm({ ...lessonForm, videoUrl: v })} placeholder="/uploads/videos/..." />
          </div>

          {/* Image Upload */}
          <div className="border border-white/5 rounded-xl p-3 space-y-2">
            <p className="text-[10px] text-gold font-medium">Image</p>
            <input ref={lessonImageRef} type="file" accept="image/*" className="hidden"
              onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const url = await uploadLessonFile(f, "imageUrl"); if (url) setLessonForm(prev => ({ ...prev, imageUrl: url })); }} />
            <div className="flex items-center gap-2">
              <Button variant="outline-gold" size="sm" onClick={() => lessonImageRef.current?.click()} disabled={uploadingLessonField === "imageUrl"}
                icon={uploadingLessonField === "imageUrl" ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}>
                {uploadingLessonField === "imageUrl" ? "Uploading..." : "Upload Image"}
              </Button>
              {lessonForm.imageUrl && <span className="text-[10px] text-success">Image uploaded</span>}
            </div>
          </div>

          {/* Audio Upload */}
          <div className="border border-white/5 rounded-xl p-3 space-y-2">
            <p className="text-[10px] text-gold font-medium">Audio</p>
            <input ref={lessonAudioRef} type="file" accept="audio/*" className="hidden"
              onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const url = await uploadLessonFile(f, "audioUrl"); if (url) setLessonForm(prev => ({ ...prev, audioUrl: url })); }} />
            <div className="flex items-center gap-2">
              <Button variant="outline-gold" size="sm" onClick={() => lessonAudioRef.current?.click()} disabled={uploadingLessonField === "audioUrl"}
                icon={uploadingLessonField === "audioUrl" ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}>
                {uploadingLessonField === "audioUrl" ? "Uploading..." : "Upload Audio"}
              </Button>
              {lessonForm.audioUrl && <span className="text-[10px] text-success">Audio uploaded</span>}
            </div>
          </div>

          {/* File Upload */}
          <div className="border border-white/5 rounded-xl p-3 space-y-2">
            <p className="text-[10px] text-gold font-medium">File (PDF, ZIP, etc.)</p>
            <input ref={lessonFileRef} type="file" accept=".pdf,.zip,.rar,.7z" className="hidden"
              onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const url = await uploadLessonFile(f, "fileUrl"); if (url) setLessonForm(prev => ({ ...prev, fileUrl: url, fileName: f.name })); }} />
            <div className="flex items-center gap-2">
              <Button variant="outline-gold" size="sm" onClick={() => lessonFileRef.current?.click()} disabled={uploadingLessonField === "fileUrl"}
                icon={uploadingLessonField === "fileUrl" ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}>
                {uploadingLessonField === "fileUrl" ? "Uploading..." : "Upload File"}
              </Button>
              {lessonForm.fileName && <span className="text-[10px] text-success">{lessonForm.fileName}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputField label="Duration (min)" type="number" value={lessonForm.duration} onChange={(v) => setLessonForm({ ...lessonForm, duration: v })} />
            <InputField label="Order" type="number" value={lessonForm.order} onChange={(v) => setLessonForm({ ...lessonForm, order: v })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowLessonModal(false)}>Cancel</Button>
            <Button onClick={handleAddLesson} icon={<Plus size={14} />}>Add Lesson</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Bank Cards Tab ──────────────────────────────────────────────────────────

function BankCardsTab() {
  const [cards, setCards] = useState<BankCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<BankCardItem | null>(null);
  const [formData, setFormData] = useState({ cardNumber: "", shebaNumber: "", bankName: "", accountHolder: "", isActive: true });

  const loadCards = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<BankCardItem[]>("/api/admin/bank-cards");
      setCards(data);
    } catch {
      toast.error("خطا", "بارگذاری کارت‌ها با مشکل مواجه شد");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCards(); }, [loadCards]);

  const handleSave = async () => {
    try {
      if (editingCard) {
        await apiPut(`/api/admin/bank-cards/${editingCard.id}`, formData);
        toast.success("کارت به‌روزرسانی شد");
      } else {
        await apiPost("/api/admin/bank-cards", formData);
        toast.success("کارت جدید اضافه شد");
      }
      setShowModal(false);
      setEditingCard(null);
      loadCards();
    } catch (err: unknown) {
      toast.error("خطا", err instanceof Error ? err.message : "ذخیره کارت با مشکل مواجه شد");
    }
  };

  const handleDelete = async (card: BankCardItem) => {
    if (!confirm(`Delete card "${card.cardNumber}"?`)) return;
    try {
      await apiDelete(`/api/admin/bank-cards/${card.id}`);
      toast.success("کارت حذف شد");
      loadCards();
    } catch {
      toast.error("خطا", "حذف کارت با مشکل مواجه شد");
    }
  };

  const toggleActive = async (card: BankCardItem) => {
    try {
      await apiPut(`/api/admin/bank-cards/${card.id}`, { isActive: !card.isActive });
      toast.success(card.isActive ? "کارت غیرفعال شد" : "کارت فعال شد");
      loadCards();
    } catch {
      toast.error("خطا", "تغییر وضعیت با مشکل مواجه شد");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><Landmark size={18} className="text-gold" /> Bank Cards</h2>
        <Button onClick={() => { setEditingCard(null); setFormData({ cardNumber: "", shebaNumber: "", bankName: "", accountHolder: "", isActive: true }); setShowModal(true); }} icon={<Plus size={14} />}>Add Card</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading ? (
          <CardsSkeleton count={6} />
        ) : cards.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">No bank cards added yet</div>
        ) : (
          cards.map((card) => (
            <div key={card.id} className={`bg-obsidian-light rounded-xl border p-4 space-y-3 ${card.isActive ? "border-success/20" : "border-white/5 opacity-60"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold"><Landmark size={16} /></div>
                  <div>
                    <p className="text-sm font-bold text-white">{card.bankName}</p>
                    <p className="text-[10px] text-gray-500">{card.accountHolder}</p>
                  </div>
                </div>
                <button onClick={() => toggleActive(card)} className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${card.isActive ? "bg-success/15 text-success" : "bg-white/5 text-gray-500"}`}>
                  {card.isActive ? "Active" : "Inactive"}
                </button>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">Card:</span><span className="font-mono text-gray-300">{card.cardNumber}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">SHABA:</span><span className="font-mono text-gray-300 text-[10px]">{card.shebaNumber}</span></div>
              </div>
              <div className="flex items-center justify-end gap-1 pt-1">
                <button onClick={() => { setEditingCard(card); setFormData({ cardNumber: card.cardNumber, shebaNumber: card.shebaNumber, bankName: card.bankName, accountHolder: card.accountHolder, isActive: card.isActive }); setShowModal(true); }} className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 hover:text-cyber"><Edit size={12} /></button>
                <button onClick={() => handleDelete(card)} className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 hover:text-danger"><Trash2 size={12} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} title={editingCard ? "Edit Bank Card" : "Add Bank Card"}>
        <div className="space-y-3">
          <InputField label="Bank Name" value={formData.bankName} onChange={(v) => setFormData({ ...formData, bankName: v })} placeholder="e.g. ملی, ملت, صادرات" />
          <InputField label="Card Number" value={formData.cardNumber} onChange={(v) => setFormData({ ...formData, cardNumber: v })} placeholder="60379918XXXXX" />
          <InputField label="SHABA Number" value={formData.shebaNumber} onChange={(v) => setFormData({ ...formData, shebaNumber: v })} placeholder="IR000000000000000000000000" />
          <InputField label="Account Holder" value={formData.accountHolder} onChange={(v) => setFormData({ ...formData, accountHolder: v })} placeholder="Full name" />
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded" />
            <label className="text-xs text-gray-400">Active</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} icon={<CheckCircle size={14} />}>{editingCard ? "Update" : "Add"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Skeleton Components ─────────────────────────────────────────────────────

function SkeletonRow({ columns }: { columns: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={`skel-cell-${i}`} className="px-3 py-3">
          <div className="h-3 bg-white/5 rounded w-full max-w-[80px]" />
        </td>
      ))}
    </tr>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-obsidian-light rounded-xl border border-white/5 p-4 animate-pulse">
      <div className="h-4 bg-white/5 rounded w-2/3 mb-3" />
      <div className="h-3 bg-white/5 rounded w-full mb-2" />
      <div className="h-3 bg-white/5 rounded w-1/2" />
    </div>
  );
}

function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-obsidian-light rounded-xl border border-white/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5 text-gray-500">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={`skel-th-${i}`} className="text-left px-3 py-2.5 font-medium">
                  <div className="h-2.5 bg-white/5 rounded w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <SkeletonRow key={`table-skel-${i}`} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={`card-skel-${i}`} />
      ))}
    </div>
  );
}

// ─── Shared Components ───────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  const colorMap: Record<string, string> = {
    gold: "from-gold/15 to-gold/5 border-gold/10 text-gold",
    cyber: "from-cyber/15 to-cyber/5 border-cyber/10 text-cyber",
    success: "from-success/15 to-success/5 border-success/10 text-success",
    warning: "from-gold/15 to-gold/5 border-gold/10 text-gold",
    purple: "from-purple-500/15 to-purple-500/5 border-purple-500/10 text-purple-400",
    danger: "from-danger/15 to-danger/5 border-danger/10 text-danger",
  };
  return (
    <div className={`rounded-xl bg-gradient-to-br ${colorMap[color]} border p-3`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-500 text-[10px]">{label}</span>
        {icon}
      </div>
      <p className="text-lg font-bold text-white">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; icon: React.ReactNode }> = {
    active: { bg: "bg-success/10 text-success", icon: <CheckCircle size={10} /> },
    inactive: { bg: "bg-white/5 text-gray-500", icon: <XCircle size={10} /> },
    pending: { bg: "bg-gold/10 text-gold", icon: <Clock size={10} /> },
    paid: { bg: "bg-cyber/10 text-cyber", icon: <CheckCircle size={10} /> },
    cancelled: { bg: "bg-danger/10 text-danger", icon: <XCircle size={10} /> },
    refunded: { bg: "bg-purple-500/10 text-purple-400", icon: <RefreshCw size={10} /> },
    open: { bg: "bg-cyber/10 text-cyber", icon: <AlertTriangle size={10} /> },
    answered: { bg: "bg-gold/10 text-gold", icon: <Clock size={10} /> },
    closed: { bg: "bg-white/5 text-gray-500", icon: <CheckCircle size={10} /> },
    published: { bg: "bg-success/10 text-success", icon: <CheckCircle size={10} /> },
    draft: { bg: "bg-white/5 text-gray-500", icon: <Edit size={10} /> },
    suspended: { bg: "bg-danger/10 text-danger", icon: <XCircle size={10} /> },
  };
  const c = config[status] || config.inactive;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${c.bg}`}>
      {c.icon}
      {status}
    </span>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ show, onClose, title, children, wide }: { show: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`relative w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[85vh] overflow-y-auto bg-obsidian-light border border-white/10 rounded-2xl shadow-2xl`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b border-white/5 bg-obsidian-light/90 backdrop-blur-xl rounded-t-2xl">
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </div>
  );
}

// ─── InputField ───────────────────────────────────────────────────────────────

function InputField({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-gray-500 font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white placeholder:text-gray-600 focus:border-gold/30 focus:outline-none transition-colors"
      />
    </div>
  );
}

// ─── SelectField ──────────────────────────────────────────────────────────────

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-gray-500 font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none transition-colors"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

// ─── TextAreaField ────────────────────────────────────────────────────────────

function TextAreaField({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-gray-500 font-medium">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white placeholder:text-gray-600 focus:border-gold/30 focus:outline-none transition-colors resize-none"
      />
    </div>
  );
}
