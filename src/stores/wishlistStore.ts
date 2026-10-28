import { create } from "zustand";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

export interface WishlistItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  img?: string;
}

interface SavedItemPublic {
  id: number;
  productId: number;
  name: string;
  price: number;
  img: string;
}

interface WishlistStore {
  items: WishlistItem[];
  wishlistOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  load: (token: string) => Promise<void>;
  addItem: (item: Omit<WishlistItem, "id">, token: string) => Promise<void>;
  removeItem: (savedItemId: number, token: string) => Promise<void>;
  clearWishlist: () => void;
}

const mapSavedItem = (item: SavedItemPublic): WishlistItem => ({
  id: item.id,
  productId: item.productId,
  name: item.name,
  price: item.price,
  img: item.img,
});

export const useWishlistStore = create<WishlistStore>((set) => ({
  items: [],
  wishlistOpen: false,
  openWishlist: () => set({ wishlistOpen: true }),
  closeWishlist: () => set({ wishlistOpen: false }),
  load: async (token) => {
    const saved = await apiFetch<SavedItemPublic[]>("/api/users/me/saved-items", { token });
    set({ items: saved.map(mapSavedItem) });
  },
  addItem: async (newItem, token) => {
    const tempId = Date.now();
    let added = false;
    set((state) => {
      if (state.items.some((item) => item.productId === newItem.productId)) return state;
      added = true;
      return { items: [...state.items, { ...newItem, id: tempId }] };
    });
    if (!added) return;

    try {
      await apiFetch("/api/users/me/saved-items", {
        method: "POST",
        token,
        body: { productId: newItem.productId },
      });
      const saved = await apiFetch<SavedItemPublic[]>("/api/users/me/saved-items", { token });
      set({ items: saved.map(mapSavedItem) });
    } catch (error) {
      set((state) => ({ items: state.items.filter((item) => item.id !== tempId) }));
      throw error;
    }
  },
  removeItem: async (savedItemId, token) => {
    set((state) => ({ items: state.items.filter((item) => item.id !== savedItemId) }));
    try {
      await apiFetch(`/api/users/me/saved-items/${savedItemId}`, {
        method: "DELETE",
        token,
      });
    } catch (error) {
      try {
        const saved = await apiFetch<SavedItemPublic[]>("/api/users/me/saved-items", { token });
        set({ items: saved.map(mapSavedItem) });
      } catch {
        // Keep the optimistic state if recovery also fails.
      }
      throw error;
    }
  },
  clearWishlist: () => set({ items: [] }),
}));

export const useWishlist = () => {
  const store = useWishlistStore();
  const { isAuthenticated, token } = useAuth();
  return {
    items: isAuthenticated && token ? store.items : [],
    wishlistOpen: store.wishlistOpen,
    openWishlist: store.openWishlist,
    closeWishlist: store.closeWishlist,
    addItem: (item: Omit<WishlistItem, "id">) =>
      token ? store.addItem(item, token) : Promise.resolve(),
    removeItem: (savedItemId: number) =>
      token ? store.removeItem(savedItemId, token) : Promise.resolve(),
    clearWishlist: store.clearWishlist,
    isWishlisted: (productId: number) =>
      isAuthenticated && token
        ? store.items.some((item) => item.productId === productId)
        : false,
    itemCount: isAuthenticated && token ? store.items.length : 0,
  };
};
