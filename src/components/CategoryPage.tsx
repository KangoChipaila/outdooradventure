import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { PRODUCTS } from "../data/products";
import { formatZMW } from "../utils/currency";
import Footer from "./Footer";

// ─── Category config ───────────────────────────────────────────────────────────
// Maps URL param → { display title, hero tagline, product category filters }
type CategoryConfig = {
  title: string;
  tagline: string;
  // If empty, show all products; otherwise filter by these product categories
  categories: string[];
};

const CATEGORY_MAP: Record<string, CategoryConfig> = {
  activities: {
    title: "Activities",
    tagline: "Gear built for every adventure.",
    categories: ["Hiking", "Climbing", "Camping", "Lighting", "Bags"],
  },
  women: {
    title: "Women",
    tagline: "Performance gear designed for her.",
    categories: ["Clothing", "Shoes", "Accessories"],
  },
  men: {
    title: "Men",
    tagline: "Built tough, finished sharp.",
    categories: ["Clothing", "Shoes", "Accessories"],
  },
  children: {
    title: "Children",
    tagline: "Young adventurers, big gear.",
    categories: [], // show all — kids can use any product
  },
  shoes: {
    title: "Shoes",
    tagline: "Step into the wild with confidence.",
    categories: ["Shoes"],
  },
  clothing: {
    title: "Clothing",
    tagline: "Layers that move with you.",
    categories: ["Clothing"],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ImgPlaceholder() {
  return (
    <div className="flex items-center justify-center w-full h-full bg-gray-100">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.2}
        stroke="currentColor"
        className="w-12 h-12 text-gray-300"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
        />
      </svg>
    </div>
  );
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
          className="w-3.5 h-3.5"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Sort / Filter options ────────────────────────────────────────────────────
type SortKey = "default" | "price-asc" | "price-desc" | "rating";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "default", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const config = CATEGORY_MAP[slug?.toLowerCase() ?? ""] ?? {
    title: "All Products",
    tagline: "Everything you need for the outdoors.",
    categories: [],
  };

  const [sort, setSort] = useState<SortKey>("default");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Derive the full set of product categories available for this page's filter pills
  const baseProducts = useMemo(() => {
    if (config.categories.length === 0) return PRODUCTS;
    return PRODUCTS.filter((p) => config.categories.includes(p.category));
  }, [config.categories]);

  const availableCategories = useMemo(() => {
    const cats = Array.from(new Set(baseProducts.map((p) => p.category)));
    return ["All", ...cats];
  }, [baseProducts]);

  const displayed = useMemo(() => {
    let list = activeCategory === "All"
      ? baseProducts
      : baseProducts.filter((p) => p.category === activeCategory);

    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);

    return list;
  }, [baseProducts, activeCategory, sort]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ── Hero banner ── */}
      <div className="bg-green-700 pt-[56px]">
        <div className="max-w-5xl mx-auto px-4 py-12 text-white">
          <p className="text-xs font-bold tracking-widest uppercase text-green-200 mb-1">
            Green Rock Outdoor Gear
          </p>
          <h1 className="text-4xl font-extrabold uppercase tracking-wide">
            {config.title}
          </h1>
          <p className="text-green-200 mt-2 text-sm">{config.tagline}</p>
        </div>
      </div>

      {/* ── Toolbar: category pills + sort ── */}
      <div className="sticky top-[56px] z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          {/* Category filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-medium rounded-full py-1.5 px-4 border transition-colors ${
                  activeCategory === cat
                    ? "bg-gray-900 text-white border-gray-900"
                    : "text-gray-700 border-green-500 hover:bg-green-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="sort" className="text-xs text-gray-500 font-medium">
              Sort:
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="text-xs border border-gray-200 rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-800"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Product grid ── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
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
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <p className="text-sm font-medium">No products found.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-5">
              {displayed.length} {displayed.length === 1 ? "product" : "products"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {displayed.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label={product.name}
                >
                  {/* Product image */}
                  <div className="aspect-square overflow-hidden">
                    {product.img ? (
                      <img
                        src={product.img}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <ImgPlaceholder />
                    )}
                  </div>

                  {/* Product info */}
                  <div className="p-3 flex flex-col gap-1">
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                      {product.brand}
                    </p>
                    <p className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <StarRating rating={product.rating} />
                      <span className="text-[10px] text-gray-400">
                        ({product.reviewCount})
                      </span>
                    </div>
                    <p className="text-sm font-extrabold text-gray-900 mt-1">
                      {formatZMW(product.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
