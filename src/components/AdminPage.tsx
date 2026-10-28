import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

interface ProductRecord {
  id?: number;
  name: string;
  brand: string;
  price: number;
  category: string;
  stock: number;
  description: string;
  sizes: string[];
  colors: string[];
  img: string;
  gallery: string[];
}

interface ProductFormState {
  name: string;
  brand: string;
  price: string;
  category: string;
  stock: string;
  description: string;
  sizes: string;
  colors: string;
  img: string;
  gallery: string;
}

const emptyForm: ProductFormState = {
  name: "",
  brand: "",
  price: "",
  category: "",
  stock: "",
  description: "",
  sizes: "",
  colors: "",
  img: "",
  gallery: "",
};

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

async function uploadProductImage(productId: number, file: File, kind: "main" | "gallery", token: string) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`http://localhost:4000/api/admin/products/${productId}/images/${kind}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const payload = (await response.json()) as { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? `Upload failed (${response.status})`);
  }

  return payload;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useAuth();
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user && !user.isAdmin) {
      navigate("/");
      return;
    }
  }, [isAuthenticated, navigate, user]);

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin || !token) return;

    let ignore = false;

    const loadProducts = async () => {
      try {
        const rows = await apiFetch<ProductRecord[]>("/api/admin/products", { token });
        if (!ignore) {
          setProducts(rows);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load products.");
        }
      }
    };

    void loadProducts();
    return () => {
      ignore = true;
    };
  }, [isAuthenticated, token, user?.isAdmin]);

  const formLabel = useMemo(
    () => (editingId === null ? "Create product" : `Editing product #${editingId}`),
    [editingId],
  );

  const categories = useMemo(
    () => ["all", ...new Set(products.map((item) => item.category).filter(Boolean))],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...products]
      .filter((product) => {
        const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
        const matchesSearch =
          !term ||
          product.name.toLowerCase().includes(term) ||
          product.brand.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term);
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price_high":
            return b.price - a.price;
          case "price_low":
            return a.price - b.price;
          case "stock":
            return b.stock - a.stock;
          case "category":
            return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
          default:
            return a.name.localeCompare(b.name);
        }
      });
  }, [categoryFilter, products, search, sortBy]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  function populateForm(product: ProductRecord) {
    setEditingId(product.id ?? null);
    setForm({
      name: product.name,
      brand: product.brand,
      price: String(product.price),
      category: product.category,
      stock: String(product.stock),
      description: product.description,
      sizes: product.sizes.join(", "),
      colors: product.colors.join(", "),
      img: product.img,
      gallery: product.gallery.join(", "),
    });
    setError("");
  }

  async function refreshProducts() {
    if (!token) return;
    const rows = await apiFetch<ProductRecord[]>("/api/admin/products", { token });
    setProducts(rows);
  }

  async function handleQuickStockUpdate(productId: number, delta: number) {
    if (!token) return;
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    const nextStock = Math.max(0, product.stock + delta);
    try {
      await apiFetch(`/api/admin/products/${productId}/stock`, {
        method: "PATCH",
        token,
        body: { stock: nextStock },
      });
      await refreshProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update stock.");
    }
  }

  async function handleUpload(productId: number, kind: "main" | "gallery", file: File | null) {
    if (!file || !token) return;
    try {
      await uploadProductImage(productId, file, kind, token);
      await refreshProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      price: Number(form.price),
      category: form.category.trim(),
      stock: Number(form.stock),
      description: form.description.trim(),
      sizes: parseList(form.sizes),
      colors: parseList(form.colors),
      img: form.img.trim(),
      gallery: parseList(form.gallery),
    };

    if (!payload.name || !payload.brand || !payload.category || Number.isNaN(payload.price) || Number.isNaN(payload.stock)) {
      setError("Name, brand, category, price, and stock are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (editingId === null) {
        await apiFetch<ProductRecord>("/api/admin/products", {
          method: "POST",
          token,
          body: payload,
        });
      } else {
        await apiFetch<ProductRecord>(`/api/admin/products/${editingId}`, {
          method: "PUT",
          token,
          body: payload,
        });
      }
      await refreshProducts();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!token) return;
    try {
      await apiFetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        token,
      });
      await refreshProducts();
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product.");
    }
  }

  if (!isAuthenticated || !user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-700">Admin</p>
            <h1 className="text-3xl font-black text-gray-900">Product control centre</h1>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100"
          >
            New product
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-xl font-bold text-gray-900">Products</h2>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search"
                  className="rounded-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500"
                />
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="rounded-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All categories" : category}
                    </option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="rounded-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500"
                >
                  <option value="name">Sort: Name</option>
                  <option value="price_low">Sort: Price low-high</option>
                  <option value="price_high">Sort: Price high-low</option>
                  <option value="stock">Sort: Stock</option>
                  <option value="category">Sort: Category</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <div key={product.id} className="rounded-2xl border border-gray-200 p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.img || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&q=80"}
                      alt={product.name}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.brand} · {product.category}</p>
                      <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => populateForm(product)}
                        className="rounded-full border border-green-600 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(product.id ?? 0)}
                        className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void handleQuickStockUpdate(product.id ?? 0, -1)}
                      className="h-8 w-8 rounded-full border border-gray-300 text-base font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold text-gray-900">{product.stock}</span>
                    <button
                      type="button"
                      onClick={() => void handleQuickStockUpdate(product.id ?? 0, 1)}
                      className="h-8 w-8 rounded-full border border-gray-300 text-base font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      +
                    </button>
                    <label className="ml-auto cursor-pointer rounded-full border border-green-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-green-700 hover:bg-green-50">
                      Main image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => void handleUpload(product.id ?? 0, "main", event.target.files?.[0] ?? null)}
                      />
                    </label>
                    <label className="cursor-pointer rounded-full border border-gray-300 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-700 hover:bg-gray-100">
                      Gallery
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => void handleUpload(product.id ?? 0, "gallery", event.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-gray-900">{formLabel}</h2>
            <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm text-gray-700">
                  <span className="font-medium">Name</span>
                  <input
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-500"
                  />
                </label>

                <label className="space-y-1 text-sm text-gray-700">
                  <span className="font-medium">Brand</span>
                  <input
                    value={form.brand}
                    onChange={(event) => setForm((prev) => ({ ...prev, brand: event.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-500"
                  />
                </label>

                <label className="space-y-1 text-sm text-gray-700">
                  <span className="font-medium">Price</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-500"
                  />
                </label>

                <label className="space-y-1 text-sm text-gray-700">
                  <span className="font-medium">Stock</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-500"
                  />
                </label>

                <label className="space-y-1 text-sm text-gray-700 md:col-span-2">
                  <span className="font-medium">Category</span>
                  <input
                    value={form.category}
                    onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-500"
                  />
                </label>

                <label className="space-y-1 text-sm text-gray-700 md:col-span-2">
                  <span className="font-medium">Description</span>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-500"
                  />
                </label>

                <label className="space-y-1 text-sm text-gray-700 md:col-span-2">
                  <span className="font-medium">Sizes (comma separated)</span>
                  <input
                    value={form.sizes}
                    onChange={(event) => setForm((prev) => ({ ...prev, sizes: event.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-500"
                  />
                </label>

                <label className="space-y-1 text-sm text-gray-700 md:col-span-2">
                  <span className="font-medium">Colors (comma separated)</span>
                  <input
                    value={form.colors}
                    onChange={(event) => setForm((prev) => ({ ...prev, colors: event.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-500"
                  />
                </label>

                <label className="space-y-1 text-sm text-gray-700 md:col-span-2">
                  <span className="font-medium">Main image URL</span>
                  <input
                    value={form.img}
                    onChange={(event) => setForm((prev) => ({ ...prev, img: event.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-500"
                  />
                </label>

                <label className="space-y-1 text-sm text-gray-700 md:col-span-2">
                  <span className="font-medium">Gallery URLs (comma separated)</span>
                  <input
                    value={form.gallery}
                    onChange={(event) => setForm((prev) => ({ ...prev, gallery: event.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-500"
                  />
                </label>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-green-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-800 disabled:opacity-60"
                >
                  {loading ? "Saving..." : editingId === null ? "Create" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Clear
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
