import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, BillingCycle } from "@/types";

interface CartState {
  items: CartItem[];
  isHydrated: boolean;
  addItem: (product: Product, billingCycle: BillingCycle) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  setHydrated: () => void;
}

function getItemPrice(product: Product, billingCycle: BillingCycle): number {
  switch (billingCycle) {
    case "daily": return product.priceDaily ?? product.price;
    case "weekly": return product.priceWeekly ?? product.price;
    case "monthly": return product.priceMonthly ?? product.price;
    case "lifetime": return product.priceLifetime ?? product.price * 3;
    default: return product.price;
  }
}

function computeTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    return sum + getItemPrice(item.product, item.billingCycle) * item.quantity;
  }, 0);
}

function computeCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,

      addItem: (product, billingCycle) => {
        const items = get().items;
        const existing = items.find(
          (i) => i.product.id === product.id && i.billingCycle === billingCycle
        );

        if (existing) {
          const updated = items.map((i) =>
            i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i
          );
          set({ items: updated, total: computeTotal(updated), itemCount: computeCount(updated) });
        } else {
          const newItem: CartItem = {
            id: `${product.id}-${billingDate()}`,
            product,
            quantity: 1,
            billingCycle,
          };
          const updated = [...items, newItem];
          set({ items: updated, total: computeTotal(updated), itemCount: computeCount(updated) });
        }
      },

      removeItem: (id) => {
        const updated = get().items.filter((i) => i.id !== id);
        set({ items: updated, total: computeTotal(updated), itemCount: computeCount(updated) });
      },

      clearCart: () => set({ items: [], total: 0, itemCount: 0 }),

      get total() { return computeTotal(get().items); },
      get itemCount() { return computeCount(get().items); },

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "gc_cart",
      onRehydrateStorage: () => (state) => {
        try {
          state?.setHydrated();
        } catch (e) {
          console.error("[cart-store] rehydrate error:", e);
          state?.setHydrated();
        }
      },
    }
  )
);

function billingDate(): string {
  return Date.now().toString(36);
}
