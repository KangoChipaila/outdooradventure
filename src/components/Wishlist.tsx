import { useEffect, useRef } from "react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { formatZMW } from "../utils/currency";

function EmptyWishlist() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 text-gray-400 py-16">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.2}
        stroke="currentColor"
        className="w-16 h-16"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
        />
      </svg>
      <p className="text-sm font-medium">Your wishlist is empty</p>
      <p className="text-xs text-center max-w-[180px]">
        Save items you love and find them here anytime.
      </p>
    </div>
  );
}

export default function Wishlist() {
  const { items, wishlistOpen, closeWishlist, removeItem, clearWishlist, itemCount } =
    useWishlist();
  const { addItem: addToCart, openCart } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeWishlist();
    }
    if (wishlistOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [wishlistOpen, closeWishlist]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = wishlistOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [wishlistOpen]);

  if (!wishlistOpen) return null;

  function handleMoveToCart(item: (typeof items)[number]) {
    addToCart({ id: item.id, name: item.name, price: item.price, img: item.img });
    removeItem(item.id);
    closeWishlist();
    openCart();
  }

  function handleMoveAllToCart() {
    items.forEach((item) =>
      addToCart({ id: item.id, name: item.name, price: item.price, img: item.img })
    );
    clearWishlist();
    closeWishlist();
    openCart();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[60] transition-opacity"
        onClick={closeWishlist}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Wishlist"
        className="fixed top-0 right-0 h-full w-full max-w-sm bg-gray-50 z-[70] flex flex-col shadow-2xl"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            {/* Bookmark icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="w-5 h-5 text-green-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
              />
            </svg>
            <h2 className="font-bold text-gray-900 text-sm uppercase tracking-widest">
              Wishlist
            </h2>
            {itemCount > 0 && (
              <span className="bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeWishlist}
            aria-label="Close wishlist"
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Item list ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <EmptyWishlist />
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex gap-3"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.img ? (
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.2}
                          stroke="currentColor"
                          className="w-8 h-8"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-sm font-bold text-green-700 mt-1">
                      {formatZMW(item.price)}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => handleMoveToCart(item)}
                        className="text-xs font-bold text-white bg-green-600 rounded-full px-3 py-1 hover:bg-green-700 transition-colors"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name} from wishlist`}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Footer CTA ── */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 px-5 py-5 bg-white flex flex-col gap-3">
            {/* Total saved value */}
            <div className="flex justify-between text-sm text-gray-700">
              <span>
                {itemCount} {itemCount === 1 ? "item" : "items"} saved
              </span>
              <span className="font-bold text-gray-900">
                {formatZMW(items.reduce((sum, i) => sum + i.price, 0))}
              </span>
            </div>

            {/* Move all to cart */}
            <button
              onClick={handleMoveAllToCart}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-sm py-3 rounded-full transition-colors uppercase tracking-wide"
            >
              Move All to Cart
            </button>

            {/* Continue browsing */}
            <button
              onClick={closeWishlist}
              className="w-full text-xs text-gray-500 hover:text-gray-800 transition-colors text-center"
            >
              ← Continue browsing
            </button>

            {/* Clear wishlist */}
            <button
              onClick={clearWishlist}
              className="w-full text-xs text-red-400 hover:text-red-600 transition-colors text-center"
            >
              Clear wishlist
            </button>
          </div>
        )}
      </div>
    </>
  );
}
