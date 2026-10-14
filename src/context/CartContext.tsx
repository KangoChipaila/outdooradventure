import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  size?: string;
  color?: string;
  img?: string;
}

interface CartContextValue {
  items: CartItem[];
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

// Seed data — representative items so the cart isn't empty on first load
const INITIAL_ITEMS: CartItem[] = [
  {
    id: 1,
    name: "Trail Running Shoe",
    price: 2499.99,
    qty: 1,
    size: "UK 10",
    color: "Olive",
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&q=80",
  },
  {
    id: 2,
    name: "Polarised Sunglasses",
    price: 1249.50,
    qty: 2,
    color: "Teal",
    img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=120&q=80",
  },
  {
    id: 3,
    name: "Hardshell Jacket",
    price: 4199.00,
    qty: 1,
    size: "M",
    color: "Black / Lime",
    img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=120&q=80",
  },
];

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS);
  const [cartOpen, setCartOpen] = useState(false);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const addItem = useCallback((newItem: Omit<CartItem, "qty">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      if (existing) {
        return prev.map((i) => (i.id === newItem.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...newItem, qty: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id: number, qty: number) => {
    if (qty < 1) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, cartOpen, openCart, closeCart, addItem, removeItem, updateQty, clearCart, itemCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
