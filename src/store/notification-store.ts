import { create } from "zustand";
import { api } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { Notification } from "@/types";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const notifications = await api.get<Notification[]>(API.notifications.list);
      const unreadCount = notifications.filter((n) => !n.read).length;
      set({ notifications, unreadCount, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await api.post(API.notifications.read, { id });
      const notifications = get().notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      const unreadCount = notifications.filter((n) => !n.read).length;
      set({ notifications, unreadCount });
    } catch {
      // silent fail
    }
  },

  markAllAsRead: async () => {
    try {
      await api.post(API.notifications.read, { all: true });
      const notifications = get().notifications.map((n) => ({ ...n, read: true }));
      set({ notifications, unreadCount: 0 });
    } catch {
      // silent fail
    }
  },
}));
