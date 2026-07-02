"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/store/toast-store";

export default function NewCoursePage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: "دوره جدید",
          slug: `course-${Date.now()}`,
          status: "draft",
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("موفق", "دوره ایجاد شد");
        router.replace(`/admin/courses/${json.data.id}`);
      } else {
        toast.error("خطا", json.error?.message || "ایجاد دوره با مشکل مواجه شد");
      }
    } catch {
      toast.error("خطا", "ایجاد دوره با مشکل مواجه شد");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-obsidian-light rounded-2xl border border-white/10 p-8 text-center">
        <BookOpen size={48} className="mx-auto mb-4 text-gold" />
        <h1 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-fa)" }}>
          ایجاد دوره جدید
        </h1>
        <p className="text-gray-500 mb-6" style={{ fontFamily: "var(--font-fa)" }}>
          یک دوره پیش‌نویس ساخته شده و شما به صفحه ویرایش کامل هدایت می‌شوید
        </p>
        <Button onClick={handleCreate} disabled={creating} icon={<Loader2 size={14} />} className="w-full">
          {creating ? "در حال ایجاد..." : "ساخت و ادامه به ویرایشگر"}
        </Button>
        <p className="text-xs text-gray-500 mt-4" style={{ fontFamily: "var(--font-fa)" }}>
          یا <a href="/admin?tab=courses" className="text-gold hover:underline">بازگشت به لیست دوره‌ها</a>
        </p>
      </div>
    </div>
  );
}