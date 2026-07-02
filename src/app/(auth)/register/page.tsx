"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * /register route — redirects to /login which handles
 * register view internally via client-side state.
 */
export default function RegisterPage() {
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
