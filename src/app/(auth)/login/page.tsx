"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, User, Lock, Phone, ArrowRight, MessageSquare } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useLang } from "@/context/LangContext";
import { toast } from "@/store/toast-store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type AuthView = "login" | "register" | "forgot-password";
type LoginMethod = "password" | "sms";

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 justify-center" dir="ltr">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          type="text"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            const newCode = value.split("");
            newCode[i] = val;
            onChange(newCode.join(""));
            const tgt = e.target as HTMLInputElement;
            if (val && tgt.nextElementSibling) {
              (tgt.nextElementSibling as HTMLInputElement).focus();
            }
          }}
          onKeyDown={(e) => {
            const target = e.target as HTMLInputElement;
            if (e.key === "Backspace" && !value[i] && target.previousElementSibling) {
              (target.previousElementSibling as HTMLInputElement).focus();
            }
          }}
          className="w-12 h-12 text-center text-xl font-mono rounded-lg bg-obsidian-light border border-obsidian-lighter text-white focus:border-cyber/50 focus:ring-1 focus:ring-cyber/20 focus:outline-none transition-all"
        />
      ))}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { translate: t } = useLang();
  const { login, loginWithSms, verifySmsLogin, register, verifyRegister, forgotPassword, resetPassword, isLoading, error, clearError } = useAuthStore();

  const [view, setView] = useState<AuthView>("login");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("password");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Form fields
  const [usernameOrPhone, setUsernameOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotPhone, setForgotPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Clear error when switching views
  const switchView = (newView: AuthView) => {
    setView(newView);
    clearError();
    setOtpSent(false);
    setOtpCode("");
  };

  // Handle password login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login({ usernameOrPhone, password });
      toast.success("خوش آمدید!", "با موفقیت وارد حساب کاربری شدید");
      if (result?.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch {
      toast.error("ورود ناموفق", error || "نام کاربری یا رمز عبور اشتباه است");
    }
  };

  // Handle SMS login — request OTP
  const handleSmsRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginWithSms(phone);
      setOtpSent(true);
      setCountdown(60);
      toast.info("کد تایید ارسال شد", `کد ۶ رقمی به شماره ${phone} ارسال شد`);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch {
      toast.error("خطا در ارسال", error || "ارسال پیامک با مشکل مواجه شد");
    }
  };

  // Handle SMS login — verify OTP
  const handleSmsVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await verifySmsLogin(phone, otpCode);
      toast.success("خوش آمدید!", "با موفقیت وارد حساب کاربری شدید");
      if (result?.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch {
      toast.error("کد نامعتبر", error || "کد تایید اشتباه است یا منقضی شده");
    }
  };

  // Handle registration — request OTP
  const handleRegisterRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.warning("رمز عبور مطابقت ندارد", "لطفاً رمز عبور و تکرار آن را بررسی کنید");
      return;
    }
    if (!/^09\d{9}$/.test(phone)) {
      toast.warning("شماره نامعتبر", "شماره تماس باید ۱۱ رقم باشد و با 09 شروع شود");
      return;
    }
    if (password.length < 6) {
      toast.warning("رمز عبور ضعیف", "رمز عبور باید حداقل ۶ کاراکتر باشد");
      return;
    }
    try {
      await register({ username, phone, password });
      setOtpSent(true);
      setCountdown(60);
      toast.info("کد تایید ارسال شد", `کد ۶ رقمی به شماره ${phone} ارسال شد`);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch {
      toast.error("خطا در ثبت‌نام", error || "ثبت‌نام با مشکل مواجه شد");
    }
  };

  // Handle registration — verify OTP
  const handleRegisterVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyRegister(phone, otpCode);
      toast.success("ثبت‌نام موفق!", "حساب کاربری شما با موفقیت ایجاد شد");
      router.push("/dashboard");
    } catch {
      toast.error("کد نامعتبر", error || "کد تایید اشتباه است یا منقضی شده");
    }
  };

  // Handle forgot password — request OTP
  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword(forgotPhone);
      setOtpSent(true);
      setCountdown(60);
      toast.info("کد بازیابی ارسال شد", `کد بازیابی به شماره ${forgotPhone} ارسال شد`);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch {
      toast.error("خطا در ارسال", error || "ارسال کد بازیابی با مشکل مواجه شد");
    }
  };

  // Handle forgot password — reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.warning("رمز عبور مطابقت ندارد", "لطفاً رمز عبور و تکرار آن را بررسی کنید");
      return;
    }
    if (newPassword.length < 6) {
      toast.warning("رمز عبور ضعیف", "رمز عبور باید حداقل ۶ کاراکتر باشد");
      return;
    }
    try {
      await resetPassword({ phone: forgotPhone, code: otpCode, newPassword });
      toast.success("رمز عبور تغییر کرد", "رمز عبور جدید با موفقیت ثبت شد");
      switchView("login");
    } catch {
      toast.error("خطا در تغییر رمز", error || "تغییر رمز عبور با مشکل مواجه شد");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* View: LOGIN */}
      <AnimatePresence mode="wait">
        {view === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-fa)" }}>
                {t("login.welcome") || "خوش آمدی جنگجو!"}
              </h1>
              <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-fa)" }}>
                وارد حساب کاربری خود شوید
              </p>
            </div>

            {/* Login method toggle */}
            <div className="flex rounded-lg bg-obsidian-light p-1">
              <button
                onClick={() => setLoginMethod("password")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                  loginMethod === "password"
                    ? "bg-gold/20 text-gold border border-gold/30"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <Lock className="w-4 h-4" />
                رمز عبور
              </button>
              <button
                onClick={() => setLoginMethod("sms")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                  loginMethod === "sms"
                    ? "bg-cyber/20 text-cyber border border-cyber/30"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                پیامک
              </button>
            </div>

            {/* Password login form */}
            {loginMethod === "password" && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <Input
                  label="نام کاربری یا شماره تماس"
                  type="text"
                  value={usernameOrPhone}
                  onChange={(e) => setUsernameOrPhone(e.target.value)}
                  placeholder="username یا 09xxxxxxxxx"
                  icon={<User className="w-4 h-4" />}
                  required
                />
                <div className="relative">
                  <Input
                    label="رمز عبور"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    icon={<Lock className="w-4 h-4" />}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-8 end-3 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                    <input type="checkbox" className="rounded border-obsidian-lighter bg-obsidian-light text-gold focus:ring-gold/20" />
                    مرا به خاطر بسپار
                  </label>
                  <button
                    type="button"
                    onClick={() => switchView("forgot-password")}
                    className="text-cyber hover:text-cyber-dim transition-colors"
                  >
                    فراموشی رمز؟
                  </button>
                </div>

                <Button type="submit" className="w-full" size="lg" loading={isLoading}>
                  ورود
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </Button>
              </form>
            )}

            {/* SMS login form */}
            {loginMethod === "sms" && !otpSent && (
              <form onSubmit={handleSmsRequest} className="space-y-4">
                <Input
                  label="شماره تماس"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09xxxxxxxxx"
                  icon={<Phone className="w-4 h-4" />}
                  required
                />
                <Button type="submit" className="w-full" size="lg" loading={isLoading} variant="outline-gold">
                  <MessageSquare className="w-4 h-4" />
                  ارسال کد تایید
                </Button>
              </form>
            )}

            {/* SMS OTP verification */}
            {loginMethod === "sms" && otpSent && (
              <form onSubmit={handleSmsVerify} className="space-y-4">
                <p className="text-center text-gray-400 text-sm">
                  کد ۶ رقمی ارسال شده به <span className="text-cyber">{phone}</span> را وارد کنید
                </p>
                <OtpInput value={otpCode} onChange={setOtpCode} />
                <Button type="submit" className="w-full" size="lg" loading={isLoading} disabled={otpCode.length !== 6}>
                  تایید و ورود
                </Button>
                {countdown > 0 ? (
                  <p className="text-center text-gray-500 text-sm">{countdown} ثانیه تا ارسال مجدد</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSmsRequest}
                    className="w-full text-center text-cyber text-sm hover:underline"
                  >
                    ارسال مجدد کد
                  </button>
                )}
              </form>
            )}

            {/* Register link */}
            <p className="text-center text-gray-400 text-sm">
              حساب ندارید؟{" "}
              <button
                onClick={() => switchView("register")}
                className="text-gold hover:text-gold-dim font-medium transition-colors"
              >
                ثبت‌نام کنید
              </button>
            </p>
          </motion.div>
        )}

        {/* View: REGISTER */}
        {view === "register" && !otpSent && (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-fa)" }}>
                ثبت‌نام در گلدن چیت
              </h1>
              <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-fa)" }}>
                به جمع جنگویان بپیوندید
              </p>
            </div>

            <form onSubmit={handleRegisterRequest} className="space-y-4">
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
              <div className="relative">
                <Input
                  label="رمز عبور"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="حداقل ۶ کاراکتر"
                  icon={<Lock className="w-4 h-4" />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-8 end-3 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Input
                label="تکرار رمز عبور"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                required
              />

              <Button type="submit" className="w-full" size="lg" loading={isLoading}>
                ثبت‌نام
                <ArrowRight className="w-4 h-4 rotate-180" />
              </Button>
            </form>

            <p className="text-center text-gray-400 text-sm">
              حساب دارید؟{" "}
              <button
                onClick={() => switchView("login")}
                className="text-gold hover:text-gold-dim font-medium transition-colors"
              >
                وارد شوید
              </button>
            </p>
          </motion.div>
        )}

        {/* View: REGISTER OTP */}
        {view === "register" && otpSent && (
          <motion.div
            key="register-otp"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-white">تایید شماره تماس</h1>
              <p className="text-gray-400 text-sm">
                کد ۶ رقمی ارسال شده به <span className="text-cyber">{phone}</span> را وارد کنید
              </p>
            </div>

            <form onSubmit={handleRegisterVerify} className="space-y-4">
              <OtpInput value={otpCode} onChange={setOtpCode} />
              <Button type="submit" className="w-full" size="lg" loading={isLoading} disabled={otpCode.length !== 6}>
                تایید و ایجاد حساب
              </Button>
              {countdown > 0 ? (
                <p className="text-center text-gray-500 text-sm">{countdown} ثانیه تا ارسال مجدد</p>
              ) : (
                <button
                  type="button"
                  onClick={handleRegisterRequest}
                  className="w-full text-center text-cyber text-sm hover:underline"
                >
                  ارسال مجدد کد
                </button>
              )}
            </form>
          </motion.div>
        )}

        {/* View: FORGOT PASSWORD */}
        {view === "forgot-password" && !otpSent && (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-fa)" }}>
                بازیابی رمز عبور
              </h1>
              <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-fa)" }}>
                شماره تماس خود را وارد کنید تا کد بازیابی ارسال شود
              </p>
            </div>

            <form onSubmit={handleForgotRequest} className="space-y-4">
              <Input
                label="شماره تماس"
                type="tel"
                value={forgotPhone}
                onChange={(e) => setForgotPhone(e.target.value)}
                placeholder="09xxxxxxxxx"
                icon={<Phone className="w-4 h-4" />}
                required
              />
              <Button type="submit" className="w-full" size="lg" loading={isLoading} variant="outline-gold">
                <MessageSquare className="w-4 h-4" />
                ارسال کد بازیابی
              </Button>
            </form>

            <p className="text-center text-gray-400 text-sm">
              <button
                onClick={() => switchView("login")}
                className="text-cyber hover:text-cyber-dim font-medium transition-colors"
              >
                بازگشت به ورود
              </button>
            </p>
          </motion.div>
        )}

        {/* View: RESET PASSWORD */}
        {view === "forgot-password" && otpSent && (
          <motion.div
            key="reset"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-white">رمز عبور جدید</h1>
              <p className="text-gray-400 text-sm">
                کد بازیابی و رمز جدید را وارد کنید
              </p>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <OtpInput value={otpCode} onChange={setOtpCode} />
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
                label="تکرار رمز جدید"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                required
              />
              <Button type="submit" className="w-full" size="lg" loading={isLoading} disabled={otpCode.length !== 6}>
                تغییر رمز عبور
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
