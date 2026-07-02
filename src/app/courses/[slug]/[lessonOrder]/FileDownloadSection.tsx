"use client";

import { Download, Lock } from "lucide-react";
import { PasswordModal } from "@/components/ui/PasswordModal";
import { useState } from "react";
import { useLang } from "@/context/LangContext";
import { toast } from "@/store/toast-store";

interface FileDownloadSectionProps {
  fileUrl: string;
  filePassword?: string | null;
  fileName?: string | null;
}

export default function FileDownloadSection({ fileUrl, filePassword, fileName }: FileDownloadSectionProps) {
  const { lang } = useLang();
  const isFa = lang === "fa";
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleDownload = (enteredPassword: string) => {
    if (filePassword && enteredPassword !== filePassword) {
      toast.error(isFa ? "رمز عبور اشتباه است" : "Incorrect password");
      return;
    }
    window.location.href = fileUrl;
  };

  const needsPassword = !!filePassword;

  return (
    <>
      <div className="mb-10 rounded-xl border border-white/10 bg-obsidian-light/50 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white" style={{ fontFamily: "var(--font-fa)" }}>
          <Download size={18} className="text-gold" />
          فایل دانلودی
        </h3>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/10 text-gold hover:bg-gold/20 transition-colors text-sm font-medium"
        >
          <Download size={16} />
          دانلود فایل: {fileName || "فایل آموزشی"}
          {filePassword && <Lock size={14} className="text-amber-400" />}
        </button>
        {filePassword && (
          <p className="mt-2 text-xs text-amber-300" style={{ fontFamily: "var(--font-fa)" }}>
            این فایل نیاز به رمز عبور دارد. پس از کلیک روی دکمه، رمز عبور را وارد کنید.
          </p>
        )}
      </div>

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handleDownload}
        hint={isFa ? "رمز عبور فایل را وارد کنید" : "Enter file password"}
      />
    </>
  );
}