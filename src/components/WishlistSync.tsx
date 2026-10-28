import { useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { useWishlistStore } from "../stores/wishlistStore";

export default function WishlistSync({ children }: { children: ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const load = useWishlistStore((state) => state.load);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      clearWishlist();
      return;
    }

    load(token).catch(() => {
      // Keep the current client state if the wishlist request fails.
    });
  }, [clearWishlist, isAuthenticated, load, token]);

  return children;
}
