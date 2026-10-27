import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";
import { formatZMW } from "../utils/currency";
import Footer from "./Footer";

const SHIPPING_THRESHOLD = 2500;
const SHIPPING_COST = 199;

interface OrderResponse {
  id: string;
  status: string;
  total: number;
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<OrderResponse | null>(null);

  async function handlePlaceOrder() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (items.length === 0) return;

    setLoading(true);
    setError("");

    try {
      const order = await apiFetch<OrderResponse>("/api/orders", {
        method: "POST",
        token,
        body: {
          items: items.map((item) => ({
            productName: item.name,
            quantity: item.qty,
            unitPrice: item.price,
          })),
          total,
        },
      });
      clearCart();
      setConfirmedOrder(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Order confirmed state ──────────────────────────────────────────────────
  if (confirmedOrder) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 pt-[56px]">
        <main className="flex-1 flex flex-col items-center justify-center gap-6 px-4 py-16">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-green-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Order Confirmed!</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Your order <span className="font-semibold text-gray-800">{confirmedOrder.id}</span> is being processed.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-5 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Total charged</p>
            <p className="text-2xl font-bold text-green-700">{formatZMW(confirmedOrder.total)}</p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/profile"
              className="text-xs font-bold text-white bg-gray-900 rounded-full py-2.5 px-6 hover:bg-gray-700 transition-colors"
            >
              View My Orders
            </Link>
            <Link
              to="/"
              className="text-xs font-bold text-gray-700 border border-gray-300 rounded-full py-2.5 px-6 hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Empty cart ─────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 pt-[56px]">
        <main className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-16 h-16">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
          <p className="text-sm font-medium">Your cart is empty</p>
          <Link to="/" className="text-xs font-bold text-white bg-green-600 rounded-full py-2 px-5 hover:bg-green-700 transition-colors">
            Shop Now
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Main checkout ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pt-[56px]">
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 flex flex-col gap-6">
        <h1 className="text-xl font-bold text-gray-900">Checkout</h1>

        {/* Not logged in warning */}
        {!isAuthenticated && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 text-sm text-yellow-800">
            <span className="font-semibold">You're not logged in.</span> You'll be redirected to log in when you place your order.{" "}
            <Link to="/login" className="font-bold underline">Log in now</Link>
          </div>
        )}

        {/* Item list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {item.img ? (
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-7 h-7">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                  {item.size && <span>Size: {item.size}</span>}
                  {item.color && <span>Colour: {item.color}</span>}
                  <span>Qty: {item.qty}</span>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-900 shrink-0">{formatZMW(item.price * item.qty)}</p>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-2">Order Summary</h2>
          <div className="flex justify-between text-sm text-gray-700">
            <span>Subtotal</span>
            <span className="font-semibold">{formatZMW(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-700">
            <span>Shipping</span>
            <span className={`font-semibold ${shipping === 0 ? "text-green-600" : ""}`}>
              {shipping === 0 ? "FREE" : formatZMW(shipping)}
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-100 pt-3 mt-1">
            <span>Total</span>
            <span className="text-base">{formatZMW(total)}</span>
          </div>

          {error && (
            <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            onClick={() => void handlePlaceOrder()}
            disabled={loading}
            className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm py-3 rounded-full transition-colors uppercase tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Placing Order…" : `Place Order — ${formatZMW(total)}`}
          </button>

          <Link
            to="/"
            className="w-full text-center text-xs text-gray-500 hover:text-gray-800 transition-colors"
          >
            ← Continue Shopping
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
