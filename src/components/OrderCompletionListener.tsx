"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderCompletionListener() {
  const [show, setShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      // Optionally you can redirect to order status page if needed
      // const orderId = customEvent.detail?.orderId;
      // if (orderId) router.push(`/checkout/${orderId}`);
      setShow(true);
      // Hide after 5 seconds
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("order-completed", handler as EventListener);
    return () => {
      window.removeEventListener("order-completed", handler as EventListener);
    };
  }, [router]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="text-5xl text-gold animate-bounce">
        🎉
      </div>
    </div>
  );
}