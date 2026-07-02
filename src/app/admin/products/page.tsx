"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus, Search, Edit3, Trash2, Star, Package, RefreshCw,
  CheckCircle, XCircle, Eye, Filter,
} from "lucide-react";
import { toast } from "@/store/toast-store";

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  game: string;
  category: string;
  price: number;
  salePrice: number | null;
  status: string;
  isPopular: boolean;
  imageUrl: string | null;
  rating: number;
  reviewsCount: number;
  bypassRate: string;
  updateStatus: string;
}

export default function ProductsListPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterGame, setFilterGame] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [total, setTotal] = useState(0);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterGame) params.set("game", filterGame);
      if (filterStatus) params.set("status", filterStatus);
      const res = await fetch(`/api/admin/products?${params.toString()}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setProducts(json.data.products);
        setTotal(json.data.total);
      } else {
        toast.error("خطا", "بارگذاری محصولات با مشکل مواجه شد");
      }
    } catch {
      toast.error("خطا", "بارگذاری محصولات با مشکل مواجه شد");
    } finally {
      setLoading(false);
    }
  }, [search, filterGame, filterStatus]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleDelete = async (product: ProductItem) => {
    if (!confirm(`آیا از حذف "${product.name}" اطمینان دارید?`)) return;
    try {
      const res = await fetch(`/api/admin/products?id=${product.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "حذف با مشکل مواجه شد");
      toast.success("محصول حذف شد", `${product.name} حذف شد`);
      loadProducts();
    } catch {
      toast.error("خطا", "حذف محصول با مشکل مواجه شد");
    }
  };

  const games = [...new Set(products.map((p) => p.game))];

  return (
    <div className="min-h-screen bg-obsidian text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-white/5 bg-obsidian-light/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              ←
            </Link>
            <div>
              <h1 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Package size={18} className="text-gold" />
                مدیریت محصولات
              </h1>
              <p className="text-[10px] text-gray-500">{total} محصول</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/admin/products/new")}
              className="flex items-center gap-2 px-4 py-2 bg-gold text-obsidian font-bold text-sm rounded-lg hover:bg-gold/90 transition-colors"
            >
              <Plus size={14} />
              محصول جدید
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 space-y-4">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی محصول..."
              className="w-full pr-9 pl-3 py-2 bg-obsidian-light border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:border-gold/30 focus:outline-none"
              dir="rtl"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={12} className="text-gray-500" />
            <select
              value={filterGame}
              onChange={(e) => setFilterGame(e.target.value)}
              className="px-3 py-2 bg-obsidian-light border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
            >
              <option value="">همه بازی‌ها</option>
              {games.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-obsidian-light border border-white/10 rounded-lg text-xs text-white focus:border-gold/30 focus:outline-none"
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-2 text-gray-500">
              <RefreshCw size={16} className="animate-spin" />
              <span>در حال بارگذاری...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Package size={40} className="mb-3 text-gray-600" />
            <p>محصولی یافت نشد</p>
          </div>
        ) : (
          <div className="bg-obsidian-light rounded-xl border border-white/5 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-gray-500 text-xs">
                    <th className="text-right px-4 py-3 font-medium">تصویر</th>
                    <th className="text-right px-4 py-3 font-medium">نام محصول</th>
                    <th className="text-right px-4 py-3 font-medium">بازی</th>
                    <th className="text-right px-4 py-3 font-medium">دسته‌بندی</th>
                    <th className="text-right px-4 py-3 font-medium">قیمت</th>
                    <th className="text-right px-4 py-3 font-medium">وضعیت</th>
                    <th className="text-right px-4 py-3 font-medium">محبوب</th>
                    <th className="text-right px-4 py-3 font-medium">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="w-10 h-10 rounded-lg border border-white/10 bg-obsidian flex items-center justify-center overflow-hidden">
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package size={16} className="text-gray-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/products/${product.id}`} className="text-white hover:text-gold transition-colors font-medium">
                          {product.name}
                        </Link>
                        <p className="text-[10px] text-gray-500 font-mono">{product.slug}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded bg-cyber/10 text-cyber border border-cyber/20">{product.game}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{product.category}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className="text-gold font-medium">${product.price}</span>
                        {product.salePrice != null && (
                          <span className="text-gray-500 line-through ml-1 text-[10px]">${product.salePrice}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {product.status === "active" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-success"><CheckCircle size={10} /> فعال</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-gray-500"><XCircle size={10} /> غیرفعال</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {product.isPopular ? (
                          <Star size={14} className="text-gold fill-gold" />
                        ) : (
                          <Star size={14} className="text-gray-600" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => router.push(`/admin/products/${product.id}`)}
                            className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-cyber transition-colors"
                            title="ویرایش"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-danger transition-colors"
                            title="حذف"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-white/5">
              {products.map((product) => (
                <div key={product.id} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg border border-white/10 bg-obsidian flex items-center justify-center overflow-hidden flex-shrink-0">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package size={20} className="text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/admin/products/${product.id}`} className="text-white font-medium hover:text-gold transition-colors">
                        {product.name}
                      </Link>
                      <p className="text-[10px] text-gray-500">{product.game} • {product.category}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {product.isPopular && <Star size={12} className="text-gold fill-gold" />}
                      <button
                        onClick={() => router.push(`/admin/products/${product.id}`)}
                        className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-cyber transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-danger transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-gold">${product.price}</span>
                    {product.status === "active" ? (
                      <span className="text-success flex items-center gap-1"><CheckCircle size={10} /> فعال</span>
                    ) : (
                      <span className="text-gray-500 flex items-center gap-1"><XCircle size={10} /> غیرفعال</span>
                    )}
                    <span className="text-gray-500"> bypass: {product.bypassRate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
