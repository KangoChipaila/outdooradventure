import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  img?: string;
}

interface WishlistContextValue {
  items: WishlistItem[];
  wishlistOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  addItem: (item: WishlistItem) => void;
  removeItem: (id: number) => void;
  clearWishlist: () => void;
  isWishlisted: (id: number) => boolean;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

// Seed data — a couple of items so the drawer isn't empty on first open
const INITIAL_ITEMS: WishlistItem[] = [
  {
    id: 3,
    name: "Hardshell Jacket",
    price: 4199.0,
    img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=120&q=80",
  },
  {
    id: 7,
    name: "Headlamp",
    price: 699.0,
    img: "",
  },
];

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(INITIAL_ITEMS);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  const openWishlist = useCallback(() => setWishlistOpen(true), []);
  const closeWishlist = useCallback(() => setWishlistOpen(false), []);

  const addItem = useCallback((newItem: WishlistItem) => {
    setItems((prev) => {
      if (prev.find((i) => i.id === newItem.id)) return prev; // already saved
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearWishlist = useCallback(() => setItems([]), []);

  const isWishlisted = useCallback(
    (id: number) => items.some((i) => i.id === id),
    [items]
  );

  const itemCount = items.length;

  return (
    <WishlistContext.Provider
      value={{
        items,
        wishlistOpen,
        openWishlist,
        closeWishlist,
        addItem,
        removeItem,
        clearWishlist,
        isWishlisted,
        itemCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
