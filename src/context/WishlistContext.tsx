import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { apiFetch } from "../utils/api";

export interface WishlistItem {
  id: number;         // saved_items.id (row id, not product id)
  productId: number;  // product id
  name: string;
  price: number;
  img?: string;
}

interface WishlistContextValue {
  items: WishlistItem[];
  wishlistOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  addItem: (item: Omit<WishlistItem, "id">) => Promise<void>;
  removeItem: (savedItemId: number) => Promise<void>;
  clearWishlist: () => void;
  isWishlisted: (productId: number) => boolean;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

// ── Sync shape from server ────────────────────────────────────────────────────

interface SavedItemPublic {
  id: number;
  productId: number;
  name: string;
  price: number;
  img: string;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, token } = useAuth();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  // Load wishlist from API whenever auth state changes
  useEffect(() => {
    if (!isAuthenticated || !token) {
      setItems([]);
      return;
    }

    apiFetch<SavedItemPublic[]>("/api/users/me/saved-items", { token })
      .then((saved) =>
        setItems(
          saved.map((s) => ({
            id: s.id,
            productId: s.productId,
            name: s.name,
            price: s.price,
            img: s.img,
          }))
        )
      )
      .catch(() => {
        // Network error or expired token — leave list empty
      });
  }, [isAuthenticated, token]);

  const openWishlist = useCallback(() => setWishlistOpen(true), []);
  const closeWishlist = useCallback(() => setWishlistOpen(false), []);

  const addItem = useCallback(
    async (newItem: Omit<WishlistItem, "id">) => {
      if (!isAuthenticated || !token) return;

      // Optimistic update
      const tempId = Date.now(); // placeholder until server responds
      setItems((prev) => {
        if (prev.find((i) => i.productId === newItem.productId)) return prev;
        return [...prev, { ...newItem, id: tempId }];
      });

      try {
        await apiFetch("/api/users/me/saved-items", {
          method: "POST",
          token,
          body: { productId: newItem.productId },
        });
        // Refresh to get the real saved_item id
        const saved = await apiFetch<SavedItemPublic[]>(
          "/api/users/me/saved-items",
          { token }
        );
        setItems(
          saved.map((s) => ({
            id: s.id,
            productId: s.productId,
            name: s.name,
            price: s.price,
            img: s.img,
          }))
        );
      } catch {
        // Roll back optimistic update on failure
        setItems((prev) => prev.filter((i) => i.id !== tempId));
      }
    },
    [isAuthenticated, token]
  );

  const removeItem = useCallback(
    async (savedItemId: number) => {
      if (!isAuthenticated || !token) return;

      // Optimistic update
      setItems((prev) => prev.filter((i) => i.id !== savedItemId));

      try {
        await apiFetch(`/api/users/me/saved-items/${savedItemId}`, {
          method: "DELETE",
          token,
        });
      } catch {
        // If delete failed, re-fetch to restore correct state
        const saved = await apiFetch<SavedItemPublic[]>(
          "/api/users/me/saved-items",
          { token }
        ).catch(() => [] as SavedItemPublic[]);
        setItems(
          saved.map((s) => ({
            id: s.id,
            productId: s.productId,
            name: s.name,
            price: s.price,
            img: s.img,
          }))
        );
      }
    },
    [isAuthenticated, token]
  );

  const clearWishlist = useCallback(() => setItems([]), []);

  const isWishlisted = useCallback(
    (productId: number) => items.some((i) => i.productId === productId),
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
