"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * /forgot-password route — redirects to /login which handles
 * forgot-password view internally via client-side state.
 */
export default function ForgotPasswordPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian">
      <div className="animate-pulse text-gray-500">Loading...</div>
    </div>
  );
}
