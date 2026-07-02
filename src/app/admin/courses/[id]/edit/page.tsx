"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";

export default function CourseEditRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    if (id) {
      router.replace(`/admin/courses/${id}`);
    }
  }, [id, router]);

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-obsidian-light rounded-2xl border border-white/10 p-8 text-center">
        <Loader2 size={32} className="mx-auto mb-4 text-gold animate-spin" />
        <p className="text-gray-400" style={{ fontFamily: "var(--font-fa)" }}>
          در حال انتقال به ویرایشگر دوره...
        </p>
        <p className="text-xs text-gray-600 mt-2" style={{ fontFamily: "var(--font-fa)" }}>
          اگر به صورت خودکار منتقل نشدید،
          <a href={`/admin/courses/${id}`} className="text-gold hover:underline ml-1">
            اینجا کلیک کنید
          </a>
        </p>
      </div>
    </div>
  );
}