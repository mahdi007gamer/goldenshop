"use client";

import { ToastContainer } from "@/components/ui/Toast";
import { useToastStore } from "@/store/toast-store";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useToastStore();

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}
