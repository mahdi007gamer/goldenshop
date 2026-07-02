"use client";

import { Upload, File, Lock, Unlock, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "@/store/toast-store";

interface FileUploadSectionProps {
  fileUrl: string;
  fileName: string;
  filePassword?: string;
  onFileUrlChange: (url: string) => void;
  onFileNameChange: (name: string) => void;
  onFilePasswordChange: (password: string) => void;
}

export function FileUploadSection({
  fileUrl,
  fileName,
  filePassword,
  onFileUrlChange,
  onFileNameChange,
  onFilePasswordChange,
}: FileUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "file");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        onFileUrlChange(json.data.url);
        onFileNameChange(file.name);
        toast.success("موفق", "فایل آپلود شد");
      } else {
        toast.error("خطا", json.error?.message || "آپلود با مشکل مواجه شد");
      }
    } catch {
      toast.error("خطا", "آپلود فایل با مشکل مواجه شد");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-xs text-gray-400 block" style={{ fontFamily: "var(--font-fa)" }}>
        فایل دانلودی
      </label>

      {fileUrl ? (
        <div className="p-3 rounded-lg bg-success/5 border border-success/20">
          <div className="flex items-center gap-2 mb-2">
            <File size={14} className={filePassword ? "text-amber-400" : "text-success"} />
            <span className="text-xs text-success truncate max-w-[200px]">
              {fileName || "فایل آپلود شده"}
            </span>
            {filePassword && <Lock size={12} className="text-amber-400" />}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-outline-gold text-xs py-1 px-2"
            >
              {uploading ? "در حال آپلود..." : "تغییر فایل"}
            </button>
            <button
              type="button"
              onClick={() => {
                onFileUrlChange("");
                onFileNameChange("");
              }}
              className="btn-outline-danger text-xs py-1 px-2"
            >
              حذف
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={fileUrl}
            onChange={(e) => onFileUrlChange(e.target.value)}
            className="flex-1 px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30"
            placeholder="/files/download.zip"
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            آپلود
          </button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
        </div>
      )}

      <div className="flex items-center gap-2">
        {filePassword ? (
          <Unlock size={14} className="text-gold" />
        ) : (
          <Lock size={14} className="text-gray-500" />
        )}
        <input
          type="text"
          value={filePassword || ""}
          onChange={(e) => onFilePasswordChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-obsidian border border-white/10 rounded-lg text-xs text-white focus:border-gold/30"
          placeholder="رمز عبور فایل (اختیاری)..."
          dir="ltr"
        />
        {filePassword && (
          <button
            type="button"
            onClick={() => onFilePasswordChange("")}
            className="text-xs text-gray-500 hover:text-danger"
          >
            حذف
          </button>
        )}
      </div>
    </div>
  );
}