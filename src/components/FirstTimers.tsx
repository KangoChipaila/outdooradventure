import { useEffect, useMemo, useState } from "react";
import chevron from "../assets/Chevron.png";
import triangle from "../assets/triangle.png";
import { apiFetch } from "../utils/api";
import type { Product } from "../types";

type FormState = {
  activity: string;
  budget: string;
  terrain: string;
};

const ACTIVITY_TERMS: Record<string, string[]> = {
  hiking: ["hiking", "hike", "trek", "trail", "walking"],
  camping: ["camping", "camp", "tent", "sleeping", "lantern", "headlamp"],
  "trail running": ["running", "run", "trail", "shoe", "hydration"],
  climbing: ["climbing", "climb", "rock", "shoe", "harness", "chalk"],
  "road cycling": ["cycling", "bike", "helmet"],
  "mountain biking": ["mountain", "bike", "cycling", "trail", "helmet"],
};

const TERRAIN_TERMS: Record<string, string[]> = {
  "flat trails": ["trail", "walking", "comfort", "lightweight"],
  "forest trails": ["forest", "trail", "hiking", "waterproof"],
  "mountain trails": ["mountain", "alpine", "technical", "trekking", "hiking"],
  "rocky terrain": ["rock", "climbing", "grip", "technical", "trekking"],
  "snow / cold conditions": ["snow", "cold", "thermal", "insulated", "jacket", "sleeping"],
  "river / wet conditions": ["water", "wet", "waterproof", "rain", "polarised"],
};

const initialForm: FormState = {
  activity: "",
  budget: "",
  terrain: "",
};

function FirstTimers() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");

  useEffect(() => {
    let ignore = false;

    apiFetch<Product[]>("/api/products")
      .then((items) => {
        if (!ignore) setProducts(items);
      })
      .catch((error: unknown) => {
        if (!ignore) {
          setProductsError(error instanceof Error ? error.message : "Could not load recommendations.");
        }
      })
      .finally(() => {
        if (!ignore) setLoadingProducts(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const recommendations = useMemo<Product[]>(() => {
    const activity = form.activity.toLowerCase();
    const budget = Number(form.budget) || 0;

    const terms = [...(ACTIVITY_TERMS[form.activity] ?? []), ...(TERRAIN_TERMS[form.terrain] ?? [])];

    return products
      .filter((product) => (product.stock ?? 0) > 0)
      .map((product) => {
        const searchable = `${product.name} ${product.brand} ${product.category} ${product.description}`.toLowerCase();
        const termMatches = terms.filter((term) => searchable.includes(term)).length;
        const categoryMatch =
          (activity === "hiking" && ["hiking", "shoes", "clothing"].includes(product.category.toLowerCase())) ||
          (activity === "camping" && ["camping", "lighting", "bags"].includes(product.category.toLowerCase())) ||
          (activity.includes("running") && product.category.toLowerCase() === "shoes") ||
          (activity.includes("climbing") && ["climbing", "shoes"].includes(product.category.toLowerCase()));
        const withinBudget = budget === 0 || form.budget === "3500" || product.price <= budget;
        const score = termMatches * 3 + (categoryMatch ? 5 : 0) + (withinBudget ? 3 : -1);

        return { product, score };
      })
      .sort((a, b) => b.score - a.score || b.product.rating - a.product.rating)
      .slice(0, 4)
      .map(({ product }) => product);
  }, [form, products]);

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
  }

  const hasCompleteForm = form.activity !== "" && form.budget !== "" && form.terrain !== "";

  return (
    <div className="min-h-screen bg-gray-50">
      <section
        className="relative flex h-[70vh] w-full flex-col items-center justify-center gap-8 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${chevron})` }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative text-center text-4xl font-black tracking-wide text-white md:text-6xl">
          WELCOME
        </div>
        <div className="relative text-center text-2xl font-bold text-green-100 md:text-4xl">
          LET&apos;S GET YOU STARTED
        </div>
      </section>

      <section className="flex flex-col items-center justify-center gap-5 pt-10 text-center">
        <div className="text-2xl font-bold text-gray-900 md:text-3xl">
          HELP US HELP YOU BY ANSWERING A FEW QUESTIONS
        </div>
        <img src={triangle} alt="Adventure arrow" className="h-10 w-10" />
      </section>

      <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 pb-16">
        <div className="grid gap-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:grid-cols-3">
          <label className="space-y-2 text-sm font-medium text-gray-700">
            <span>What do you want to do?</span>
            <select
              value={form.activity}
              onChange={(event) => handleChange("activity", event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:border-green-500"
            >
              <option value="">Select one</option>
              <option value="Hiking">Hiking</option>
              <option value="Camping">Camping</option>
              <option value="Trail running">Trail running</option>
              <option value="Climbing">Climbing</option>
              <option value="Road cycling">Road cycling</option>
              <option value="Mountain biking">Mountain biking</option>
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-gray-700">
            <span>Budget range?</span>
            <select
              value={form.budget}
              onChange={(event) => handleChange("budget", event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:border-green-500"
            >
              <option value="">Select budget</option>
              <option value="300">Under ZMW 300</option>
              <option value="700">ZMW 300 – 700</option>
              <option value="1200">ZMW 700 – 1,200</option>
              <option value="2000">ZMW 1,200 – 2,000</option>
              <option value="3500">ZMW 2,000+</option>
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-gray-700">
            <span>What kind of terrain?</span>
            <select
              value={form.terrain}
              onChange={(event) => handleChange("terrain", event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:border-green-500"
            >
              <option value="">Select terrain</option>
              <option value="Flat trails">Flat trails</option>
              <option value="Forest trails">Forest trails</option>
              <option value="Mountain trails">Mountain trails</option>
              <option value="Rocky terrain">Rocky terrain</option>
              <option value="Snow / cold conditions">Snow / cold conditions</option>
              <option value="River / wet conditions">River / wet conditions</option>
            </select>
          </label>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-800"
          >
            Show my starter list
          </button>
        </div>

        {submitted && (
          <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
            <h3 className="mb-4 text-2xl font-black text-gray-900">Your beginner recommendations</h3>
            {!hasCompleteForm && (
              <p className="text-sm text-gray-700">Please answer all three questions to see tailored products.</p>
            )}
            {loadingProducts && <p className="text-sm text-gray-700">Finding suitable gear...</p>}
            {productsError && <p className="text-sm text-red-700">{productsError}</p>}
            {!loadingProducts && !productsError && hasCompleteForm && recommendations.length === 0 && (
              <p className="text-sm text-gray-700">We could not find matching in-stock products yet. Try a broader activity or check back soon.</p>
            )}
            {!loadingProducts && !productsError && hasCompleteForm && recommendations.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {recommendations.map((product) => (
                  <a
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="overflow-hidden rounded-2xl border border-green-100 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <img src={product.img} alt={product.name} className="h-40 w-full object-cover" />
                    <div className="p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{product.brand}</p>
                      <p className="mt-1 font-bold text-gray-900">{product.name}</p>
                      <p className="mt-2 text-sm text-green-700">ZMW {product.price.toLocaleString("en-ZM", { minimumFractionDigits: 2 })}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

export default FirstTimers;
