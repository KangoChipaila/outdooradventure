import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  size?: string;
  color?: string;
  img?: string;
}

interface CartStore {
  items: CartItem[];
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      cartOpen: false,
      openCart: () => set({ cartOpen: true }),
      closeCart: () => set({ cartOpen: false }),
      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find((item) => item.id === newItem.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === newItem.id ? { ...item, qty: item.qty + 1 } : item,
              ),
            };
          }
          return { items: [...state.items, { ...newItem, qty: 1 }] };
        }),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      updateQty: (id, qty) => {
        if (qty < 1) return;
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, qty } : item)),
        }));
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "gr_cart_items",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export const selectCartItemCount = (state: CartStore) =>
  state.items.reduce((sum, item) => sum + item.qty, 0);

export const selectCartSubtotal = (state: CartStore) =>
  state.items.reduce((sum, item) => sum + item.price * item.qty, 0);
