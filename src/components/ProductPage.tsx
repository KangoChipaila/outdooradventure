import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PRODUCTS } from "../data/products";
import type { Product } from "../types";
import { formatZMW } from "../utils/currency";
import { useCart } from "../stores/cartStore";
import { useWishlist } from "../stores/wishlistStore";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";
import Footer from "./Footer";


function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill={star <= Math.round(rating) ? "#22c55e" : "none"}
          stroke="#22c55e"
          strokeWidth={1}
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
        </svg>
      ))}
    </div>
  );
}

function ImgPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-200">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-16 h-16 text-gray-400" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addItem: addToWishlist, isWishlisted, removeItem: removeWishlistItem, items: wishlistItems } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(
    PRODUCTS.find((p) => p.id === Number(id)) ?? null
  );
  const [allProducts, setAllProducts] = useState<Product[]>(PRODUCTS);
  const [loading, setLoading] = useState(!product);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const thumbnailScroller = useRef<HTMLDivElement>(null);

  // Fetch the product from the API
  useEffect(() => {
    const numId = Number(id);
    if (isNaN(numId)) return;

    apiFetch<Product>(`/api/products/${numId}`)
      .then((p) => {
        setProduct(p);
        setSelectedColor(p.colors[0] ?? "");
        setLoading(false);
      })
      .catch(() => setLoading(false));

    apiFetch<Product[]>("/api/products").then(setAllProducts).catch(() => {});
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg">Product not found.</p>
        <Link to="/" className="text-green-700 underline text-sm">Back to home</Link>
      </div>
    );
  }

  // Similar items — same category, exclude current product, up to 3
  const similar = allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);
  const galleryImgs = [product.img, ...product.gallery].filter(Boolean);

  const wishlisted = isWishlisted(product.id);

  function handleAddToCart() {
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product!.id,
        name: product!.name,
        price: product!.price,
        size: selectedSize ?? undefined,
        color: selectedColor,
        img: product!.img || undefined,
      });
    }
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1800);
  }

  async function handleToggleWishlist() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (wishlisted) {
      const existingItem = wishlistItems.find((i) => i.productId === product!.id);
      if (existingItem) await removeWishlistItem(existingItem.id);
    } else {
      await addToWishlist({
        productId: product!.id,
        name: product!.name,
        price: product!.price,
        img: product!.img || undefined,
      });
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ── Back breadcrumb ── */}
      <div className="px-4 md:px-8 pt-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>
      </div>

      {/* ── Main product layout ── */}
      <section className="flex flex-col md:flex-row gap-6 px-4 md:px-8 py-4 flex-1">

        {/* Left — main image with gallery carousel */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Main image */}
          <div className="w-full aspect-square md:aspect-auto md:h-[420px] rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
            {galleryImgs[activeImg] ? (
              <img
                src={galleryImgs[activeImg]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImgPlaceholder />
            )}
          </div>

          {/* Thumbnail carousel */}
          {galleryImgs.length > 1 && (
            <div className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={() => thumbnailScroller.current?.scrollBy({ left: -180, behavior: "smooth" })}
                className="shrink-0 rounded-full border border-gray-200 bg-white p-2 text-gray-600 shadow-sm hover:border-green-500 hover:text-green-700"
                aria-label="Scroll gallery left"
              >
                <span aria-hidden="true">←</span>
              </button>
              <div
                ref={thumbnailScroller}
                className="flex min-w-0 flex-1 gap-3 overflow-x-auto scroll-smooth py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                aria-label="Product image gallery"
              >
                {galleryImgs.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors md:h-24 md:w-24 ${
                      activeImg === i ? "border-green-500" : "border-transparent"
                    }`}
                    aria-label={`${i === 0 ? "View main image" : `View gallery image ${i}`} `}
                    aria-current={activeImg === i ? "true" : undefined}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => thumbnailScroller.current?.scrollBy({ left: 180, behavior: "smooth" })}
                className="shrink-0 rounded-full border border-gray-200 bg-white p-2 text-gray-600 shadow-sm hover:border-green-500 hover:text-green-700"
                aria-label="Scroll gallery right"
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
        </div>

        {/* Right — product info card */}
        <div className="w-full md:w-80 flex flex-col">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-col gap-5">

            {/* Brand + name */}
            <div>
              <p className="text-xs text-gray-500 font-medium mb-0.5">{product.brand}</p>
              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <StarRating rating={product.rating} />
              <span className="text-xs font-semibold text-gray-700">{product.rating}/5</span>
              <a href="#" className="text-xs text-gray-400 underline hover:text-green-700 transition-colors">
                {product.reviewCount} reviews
              </a>
            </div>

            {/* Price pill */}
            <div>
              <span className="inline-block bg-gray-900 text-white font-extrabold text-lg px-8 py-2.5 rounded-full">
                {formatZMW(product.price)}
              </span>
            </div>

            {/* Size selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-900">Size</span>
                <a href="#" className="text-xs text-gray-400 underline hover:text-green-700 transition-colors">Custom size</a>
              </div>
              <div className="bg-green-500 rounded-2xl p-2 grid grid-cols-3 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`text-xs font-semibold rounded-lg py-2 px-1 transition-colors text-center ${
                      selectedSize === size
                        ? "bg-gray-900 text-white"
                        : "bg-white text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {product.sizes.length === 1 && product.sizes[0] === "One Size" && (
                <p className="text-xs text-white mt-1 text-center">One size fits all</p>
              )}
            </div>

            {/* Colour selector */}
            {product.colors.length > 1 && (
              <div>
                <span className="text-sm font-bold text-gray-900 block mb-2">Colour</span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`text-xs rounded-full px-3 py-1 border transition-colors ${
                        selectedColor === color
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-white text-gray-700 border-gray-200 hover:border-green-400"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <span className="text-sm font-bold text-gray-900 block mb-2">Quantity</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-9 h-9 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center text-xl font-bold transition-colors"
                >
                  −
                </button>
                <span className="w-8 text-center text-base font-bold text-gray-900">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-9 h-9 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center text-xl font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleAddToCart}
                className={`w-full font-bold text-sm py-3 rounded-full transition-colors uppercase tracking-wide ${
                  addedFeedback
                    ? "bg-green-600 text-white"
                    : "bg-gray-900 hover:bg-gray-700 text-white"
                }`}
              >
                {addedFeedback ? "✓ Added to Cart!" : "Add to Cart"}
              </button>
              <button
                onClick={() => void handleToggleWishlist()}
                className={`w-full border-2 font-bold text-sm py-3 rounded-full transition-colors uppercase tracking-wide ${
                  wishlisted
                    ? "border-green-600 bg-green-600 text-white hover:bg-green-700"
                    : "border-gray-900 text-gray-900 hover:bg-gray-50"
                }`}
              >
                {wishlisted ? "✓ Wishlisted" : "Add to Wishlist"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Details accordion ── */}
      <section className="px-4 md:px-8 py-4">
        <div className="border border-gray-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => setDetailsOpen((o) => !o)}
            className="w-full flex items-center gap-2 px-5 py-4 text-sm font-bold text-gray-800 hover:bg-gray-50 transition-colors"
            aria-expanded={detailsOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`w-4 h-4 transition-transform ${detailsOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
            DETAILS
          </button>
          {detailsOpen && (
            <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
              <p className="mt-4">{product.description}</p>
              <ul className="mt-3 list-disc list-inside space-y-1 text-xs text-gray-500">
                <li>Brand: {product.brand}</li>
                <li>Category: {product.category}</li>
                <li>Available colours: {product.colors.join(", ")}</li>
                <li>Available sizes: {product.sizes.join(", ")}</li>
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* ── Similar items ── */}
      <section className="bg-gray-100 px-4 md:px-8 py-8">
        <h2 className="text-sm font-bold text-gray-800 mb-4">Similar Items</h2>
        <div className="grid grid-cols-3 gap-4">
          {similar.length > 0
            ? similar.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="aspect-square rounded-xl overflow-hidden bg-gray-200 shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label={p.name}
                >
                  {p.img ? (
                    <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImgPlaceholder />
                  )}
                </Link>
              ))
            : [1, 2, 3].map((i) => (
                <div key={i} className="aspect-square rounded-xl bg-gray-200 flex items-center justify-center shadow-sm">
                  <ImgPlaceholder />
                </div>
              ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
