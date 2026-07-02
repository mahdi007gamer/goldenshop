"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";

interface UnreadResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
}

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?take=1", { credentials: "include" });
      const json: UnreadResponse = await res.json();
      if (json.success) {
        setUnreadCount(json.data.unreadCount);
      }
    } catch {
      // Silent fail — don't show error for notification fetch
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  return (
    <Link
      href="/dashboard/notifications"
      className="relative flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-gold hover:bg-white/5 transition-colors"
    >
      <Bell size={18} />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] flex items-center justify-center rounded-full text-white text-[9px] font-bold px-1"
          style={{ backgroundColor: "#ff3366", boxShadow: "0 0 0 2px #0B0B0B" }}>
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
