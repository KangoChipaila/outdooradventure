import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const navLinks = ["Activities", "Women", "Men", "Children", "Shoes", "Clothing"];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { openCart, itemCount } = useCart();
  const { openWishlist, itemCount: wishlistCount } = useWishlist();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white flex items-center justify-between px-4 py-3 shadow-sm">
      {/* Logo */}
      <a href="/" className="flex items-center gap-2">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <polygon points="20,4 38,36 2,36" fill="#2d7a27" />
          <polygon points="20,10 30,30 10,30" fill="#1a4d16" opacity="0.6" />
          <polygon points="20,4 25,16 15,16" fill="white" opacity="0.85" />
        </svg>
        <div className="leading-tight">
          <div className="text-xs font-bold tracking-widest text-gray-900 uppercase">Green Rock</div>
          <div className="text-xs font-bold tracking-widest text-gray-900 uppercase">Outdoor Gear</div>
        </div>
      </a>

      {/* Icon group */}
      <div className="flex items-center gap-5">
        {/* User */}
        <Link to="/profile" aria-label="Account" className="text-gray-800 hover:text-green-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </Link>
        {/* Bookmark / Wishlist */}
        <button aria-label="Saved items" onClick={openWishlist} className="relative text-gray-800 hover:text-green-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
          </svg>
          {wishlistCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-green-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {wishlistCount > 99 ? "99+" : wishlistCount}
            </span>
          )}
        </button>
        {/* Cart */}
        <button aria-label="Shopping cart" onClick={openCart} className="relative text-gray-800 hover:text-green-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
          {itemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-green-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </button>

        {/* Hamburger — wrapped in a relative container to anchor the dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="text-gray-800 hover:text-green-700 transition-colors"
          >
            {menuOpen ? (
              // X icon when open
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger icon when closed
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+10px)] w-52 bg-white rounded-2xl shadow-xl py-4 px-4 z-50"
            >
              {/* Caret / pointer triangle */}
              <div
                className="absolute -top-2 right-1 w-0 h-0"
                style={{
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderBottom: "10px solid white",
                  filter: "drop-shadow(0 -1px 1px rgba(0,0,0,0.08))",
                }}
                aria-hidden="true"
              />

              {/* Category links — outlined pill buttons with green border */}
              <ul className="flex flex-col gap-2 mb-4">
                {navLinks.map((label) => (
                  <li key={label}>
                    <Link
                      to={`/category/${label.toLowerCase()}`}
                      role="menuitem"
                      className="block w-full text-center text-xs font-medium text-gray-900 border border-green-500 rounded-full py-1.5 px-3 hover:bg-green-50 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Bottom action buttons — black filled */}
              <div className="flex flex-col gap-2">
                <Link
                  to="/help"
                  role="menuitem"
                  className="block w-full text-center text-xs font-bold text-white bg-gray-900 rounded-full py-2 px-3 hover:bg-gray-700 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Help and feedback
                </Link>
                <Link
                  to="/faqs"
                  role="menuitem"
                  className="block w-full text-center text-xs font-bold text-white bg-gray-900 rounded-full py-2 px-3 hover:bg-gray-700 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  FAQs
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
