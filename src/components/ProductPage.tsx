import { useState } from "react";
import type { Product } from "../data/products";
import { PRODUCTS } from "../data/products";
import { formatZMW } from "../utils/currency";
import { useCart } from "../context/CartContext";
import Footer from "./Footer";

interface Props {
  product: Product;
  onBack: () => void;
  onProductClick: (product: Product) => void;
}

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

export default function ProductPage({ product, onBack, onProductClick }: Props) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]);
  const [qty, setQty] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const { addItem, openCart } = useCart();

  // Similar items — same category, exclude current product, up to 3
  const similar = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);

  const galleryImgs = product.gallery.length > 0 ? product.gallery : [product.img];

  function handleAddToCart() {
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        size: selectedSize ?? undefined,
        color: selectedColor,
        img: product.img || undefined,
      });
    }
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1800);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ── Back breadcrumb ── */}
      <div className="px-4 md:px-8 pt-4 pb-2">
        <button
          onClick={onBack}
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

        {/* Left — image gallery */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Main image */}
          <div className="w-full aspect-square md:aspect-auto md:h-[420px] rounded-2xl overflow-hidden bg-gray-100">
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

          {/* Thumbnails */}
          {galleryImgs.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {galleryImgs.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                    activeImg === i ? "border-green-500" : "border-transparent"
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  {src ? (
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImgPlaceholder />
                  )}
                </button>
              ))}
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

            {/* CTA buttons */}
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
                onClick={() => { handleAddToCart(); openCart(); }}
                className="w-full border-2 border-gray-900 text-gray-900 font-bold text-sm py-3 rounded-full hover:bg-gray-50 transition-colors uppercase tracking-wide"
              >
                Add to Wishlist
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
                <button
                  key={p.id}
                  onClick={() => onProductClick(p)}
                  className="aspect-square rounded-xl overflow-hidden bg-gray-200 shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label={p.name}
                >
                  {p.img ? (
                    <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImgPlaceholder />
                  )}
                </button>
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
