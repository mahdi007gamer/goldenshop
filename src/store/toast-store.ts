import { create } from "zustand";
import type { ToastItem } from "@/components/ui/Toast";

interface ToastState {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

let toastIdCounter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${++toastIdCounter}-${Date.now()}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAll: () => set({ toasts: [] }),
}));

// Convenience helpers
export const toast = {
  success: (title: string, message?: string, options?: Partial<ToastItem>) =>
    useToastStore.getState().addToast({ type: "success", title, message, ...options }),

  error: (title: string, message?: string, options?: Partial<ToastItem>) =>
    useToastStore.getState().addToast({ type: "error", title, message, ...options }),

  warning: (title: string, message?: string, options?: Partial<ToastItem>) =>
    useToastStore.getState().addToast({ type: "warning", title, message, ...options }),

  info: (title: string, message?: string, options?: Partial<ToastItem>) =>
    useToastStore.getState().addToast({ type: "info", title, message, ...options }),
};
