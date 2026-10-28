import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart, selectCartItemCount, selectCartSubtotal } from "../stores/cartStore";
import { formatZMW } from "../utils/currency";

const SHIPPING_THRESHOLD = 2500; // ZMW free-shipping threshold
const SHIPPING_COST = 199;       // ZMW flat shipping

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 text-gray-400 py-16">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-16 h-16">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
      </svg>
      <p className="text-sm font-medium">Your cart is empty</p>
      <p className="text-xs text-center max-w-[180px]">Add some gear and it'll show up here.</p>
    </div>
  );
}

export default function Cart() {
  const { items, cartOpen, closeCart, removeItem, updateQty, clearCart } = useCart();
  const itemCount = useCart(selectCartItemCount);
  const subtotal = useCart(selectCartSubtotal);
  const drawerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;
  const remainingForFree = SHIPPING_THRESHOLD - subtotal;

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    if (cartOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [cartOpen, closeCart]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen]);

  if (!cartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[60] transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="fixed top-0 right-0 h-full w-full max-w-sm bg-gray-50 z-[70] flex flex-col shadow-2xl"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-green-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            <h2 className="font-bold text-gray-900 text-sm uppercase tracking-widest">
              Your Cart
            </h2>
            {itemCount > 0 && (
              <span className="bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Free shipping progress bar ── */}
        {items.length > 0 && (
          <div className="px-5 py-3 bg-green-50 border-b border-green-100">
            {shipping === 0 ? (
              <p className="text-xs text-green-700 font-medium text-center">
                🎉 You've unlocked <strong>free shipping!</strong>
              </p>
            ) : (
              <>
                <p className="text-xs text-gray-600 mb-1.5">
                  Spend <strong className="text-green-700">{formatZMW(remainingForFree)}</strong> more for free shipping
                </p>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100)}%` }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Item list ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <EmptyCart />
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
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                    <div className="flex flex-wrap gap-x-2 mt-0.5">
                      {item.size && <span className="text-xs text-gray-500">Size: {item.size}</span>}
                      {item.color && <span className="text-xs text-gray-500">Colour: {item.color}</span>}
                    </div>
                    <p className="text-sm font-bold text-green-700 mt-1">{formatZMW(item.price)}</p>

                    {/* Qty stepper + remove */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-base leading-none"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-xs font-semibold text-gray-800">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-base leading-none"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Line total */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-gray-900 whitespace-nowrap">{formatZMW(item.price * item.qty)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Order summary + CTA ── */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 px-5 py-5 bg-white flex flex-col gap-3">
            {/* Summary rows */}
            <div className="flex flex-col gap-1 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">{formatZMW(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-green-600 font-semibold" : "font-semibold"}>
                  {shipping === 0 ? "FREE" : formatZMW(shipping)}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 mt-1">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-gray-900 text-base">{formatZMW(total)}</span>
              </div>
            </div>

            {/* Promo code */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Promo code"
                aria-label="Promo code"
                className="flex-1 border border-gray-200 rounded-full px-3 py-1.5 text-xs focus:outline-none focus:border-green-500 transition-colors"
              />
              <button className="text-xs font-bold text-green-700 border border-green-500 rounded-full px-3 py-1.5 hover:bg-green-50 transition-colors">
                Apply
              </button>
            </div>

            {/* Checkout button */}
            <button
              onClick={() => { closeCart(); navigate("/checkout"); }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-sm py-3 rounded-full transition-colors uppercase tracking-wide"
            >
              Checkout — {formatZMW(total)}
            </button>

            {/* Continue shopping */}
            <button
              onClick={closeCart}
              className="w-full text-xs text-gray-500 hover:text-gray-800 transition-colors text-center"
            >
              ← Continue shopping
            </button>

            {/* Clear cart */}
            <button
              onClick={clearCart}
              className="w-full text-xs text-red-400 hover:text-red-600 transition-colors text-center"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
