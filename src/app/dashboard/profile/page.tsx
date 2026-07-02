"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Phone, Lock, Save, Camera, CheckCircle } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useLang } from "@/context/LangContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "@/store/toast-store";

export default function ProfilePage() {
  const { user, updateProfile, isLoading, error } = useAuthStore();
  useLang();

  // Profile form — initialize from user data (user is guaranteed by dashboard layout)
  const [username, setUsername] = useState(() => user?.username ?? "");
  const [phone, setPhone] = useState(() => user?.phone ?? "");
  const [profileSaved, setProfileSaved] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  // Handle profile update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(false);

    if (!username.trim()) {
      toast.error("نام کاربری نمی‌تواند خالی باشد");
      return;
    }
    if (!/^09\d{9}$/.test(phone)) {
      toast.error("شماره تماس باید ۱۱ رقم باشد و با 09 شروع شود");
      return;
    }

    try {
      await updateProfile({ username: username.trim(), phone });
      setProfileSaved(true);
      toast.success("پروفایل با موفقیت به‌روزرسانی شد");
      setTimeout(() => setProfileSaved(false), 3000);
    } catch {
      toast.error(error || "خطا در به‌روزرسانی پروفایل");
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaved(false);

    if (!currentPassword) {
      toast.error("رمز عبور فعلی را وارد کنید");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("رمز عبور جدید باید حداقل ۶ کاراکتر باشد");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("رمزهای عبور جدید مطابقت ندارند");
      return;
    }

    try {
      // Call the change-password API
      const res = await fetch("/api/users/" + user?.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error?.message || "خطا در تغییر رمز عبور");
      }

      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      toast.success("رمز عبور با موفقیت تغییر کرد");
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "خطا در تغییر رمز عبور";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-fa)" }}>
          تنظیمات پروفایل
        </h1>
        <p className="text-gray-400" style={{ fontFamily: "var(--font-fa)" }}>
          اطلاعات حساب کاربری خود را مدیریت کنید
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-obsidian-light border border-obsidian-lighter overflow-hidden"
      >
        {/* Avatar section */}
        <div className="bg-gradient-to-br from-gold/10 to-cyber/5 p-6 flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-lg shadow-gold/20">
              <span className="text-obsidian font-black text-3xl">
                {user?.username?.charAt(0).toUpperCase() ?? "U"}
              </span>
            </div>
            <button
              type="button"
              className="absolute -bottom-1 -end-1 w-7 h-7 rounded-full bg-obsidian border border-obsidian-lighter flex items-center justify-center text-gray-400 hover:text-gold transition-colors"
              title="تغییر آواتار"
            >
              <Camera size={14} />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.username}</h2>
            <p className="text-gray-400 text-sm">{user?.phone}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                user?.role === "admin"
                  ? "bg-gold/10 text-gold border border-gold/20"
                  : "bg-cyber/10 text-cyber border border-cyber/20"
              }`}>
                {user?.role === "admin" ? "مدیر" : "کاربر"}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                <CheckCircle size={10} />
                فعال
              </span>
            </div>
          </div>
        </div>

        {/* Profile form */}
        <form onSubmit={handleProfileSubmit} className="p-6 space-y-5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2" style={{ fontFamily: "var(--font-fa)" }}>
            <User size={18} className="text-gold" />
            اطلاعات شخصی
          </h3>

          <Input
            label="نام کاربری"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            icon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="شماره تماس"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09xxxxxxxxx"
            icon={<Phone className="w-4 h-4" />}
            hint="شماره ۱۱ رقمی با شروع 09"
            required
          />

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={isLoading} icon={<Save className="w-4 h-4" />}>
              ذخیره تغییرات
            </Button>
            {profileSaved && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1 text-success text-sm"
              >
                <CheckCircle size={16} />
                ذخیره شد!
              </motion.span>
            )}
          </div>
        </form>
      </motion.div>

      {/* Change Password Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-obsidian-light border border-obsidian-lighter p-6"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2" style={{ fontFamily: "var(--font-fa)" }}>
            <Lock size={18} className="text-cyber" />
            تغییر رمز عبور
          </h3>

          <Input
            label="رمز عبور فعلی"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <Input
            label="رمز عبور جدید"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="حداقل ۶ کاراکتر"
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <Input
            label="تکرار رمز عبور جدید"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="outline-gold" icon={<Lock className="w-4 h-4" />}>
              تغییر رمز عبور
            </Button>
            {passwordSaved && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1 text-success text-sm"
              >
                <CheckCircle size={16} />
                رمز تغییر کرد!
              </motion.span>
            )}
          </div>
        </form>
      </motion.div>

      {/* Account Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-obsidian-light border border-obsidian-lighter p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "var(--font-fa)" }}>
          اطلاعات حساب
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500" style={{ fontFamily: "var(--font-fa)" }}>شناسه کاربری</p>
            <p className="text-sm text-white font-mono">{user?.id ?? "—"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500" style={{ fontFamily: "var(--font-fa)" }}>تاریخ عضویت</p>
            <p className="text-sm text-white">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("fa-IR")
                : "—"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500" style={{ fontFamily: "var(--font-fa)" }}>موجودی کیف پول</p>
            <p className="text-sm text-gold font-bold">${user?.walletBalance?.toFixed(2) ?? "0.00"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500" style={{ fontFamily: "var(--font-fa)" }}>وضعیت حساب</p>
            <p className="text-sm text-success flex items-center gap-1">
              <CheckCircle size={14} />
              فعال
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
