"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldX } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * Client-side guard for admin pages.
 * Three states:
 *   1. Loading → spinner (while session is being verified)
 *   2. Authenticated + admin → render children
 *   3. Not authenticated OR not admin → redirect (no render)
 *
 * The server layout already provides initialUser, so this usually
 * renders children immediately for legit admins. The refetch()
 * catches expired cookies that the server didn't know about.
 */
export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user, refetch } = useAuth();
  const [verified, setVerified] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      try {
        await refetch();
      } catch {
        // network error — fall through with whatever user we have
      }
      if (cancelled) return;
      setVerified(true);
    }

    verify();
    return () => { cancelled = true; };
  }, [refetch]);

  useEffect(() => {
    if (!verified) return;

    // Not logged in → send to login
    if (!user) {
      setAccessDenied(true);
      // Use replace so the admin URL doesn't stay in history
      router.replace("/dashboard?redirect=admin");
      return;
    }

    // Logged in but not admin → send to dashboard
    if (user.role !== "admin") {
      setAccessDenied(true);
      router.replace("/dashboard");
    }
  }, [verified, user, router]);

  // While verifying session, show loading spinner
  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="text-gold animate-spin" />
          <span className="text-gray-500 text-sm">در حال بررسی دسترسی...</span>
        </div>
      </div>
    );
  }

  // Access denied — show brief message while redirecting
  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <div className="flex flex-col items-center gap-3 text-center">
          <ShieldX size={32} className="text-danger" />
          <p className="text-danger font-medium">دسترسی غیرمجاز</p>
          <p className="text-gray-500 text-xs">در حال انتقال به صفحه اصلی...</p>
        </div>
      </div>
    );
  }

  // All good — render admin content
  return <>{children}</>;
}
