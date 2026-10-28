import pool from "../db/pool";
import { json } from "../router";
import type { Router, Request, Response } from "../router";
import type { ProductRow, ProductPublic } from "../types";
import { createImageReadUrl } from "../storage";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function toPublicProduct(row: ProductRow): Promise<ProductPublic> {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    price: Number(row.price),
    rating: Number(row.rating),
    reviewCount: row.review_count,
    description: row.description,
    sizes: row.sizes,
    colors: row.colors,
    img: await createImageReadUrl(row.img),
    gallery: await Promise.all(row.gallery.map(createImageReadUrl)),
    category: row.category,
    stock: row.stock,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Route registration
// ─────────────────────────────────────────────────────────────────────────────

export function registerProductRoutes(router: Router): void {

  // ── GET /api/products ─────────────────────────────────────────────────────
  // Optional query params: ?category=Shoes  ?sort=price_asc|price_desc|rating
  router.get("/api/products", async (req: Request, res: Response) => {
    const { category, sort } = req.query;

    const conditions: string[] = [];
    const values: unknown[] = [];

    if (category) {
      values.push(category);
      conditions.push(`category = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const orderBy =
      sort === "price_asc"  ? "price ASC"     :
      sort === "price_desc" ? "price DESC"    :
      sort === "rating"     ? "rating DESC"   :
      "id ASC";

    const result = await pool.query<ProductRow>(
      `SELECT * FROM products ${where} ORDER BY ${orderBy}`,
      values
    );

    return json(res, 200, await Promise.all(result.rows.map(toPublicProduct)));
  });

  // ── GET /api/products/:id ─────────────────────────────────────────────────
  router.get("/api/products/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return json(res, 400, { error: "Invalid product ID." });

    const result = await pool.query<ProductRow>(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );
    const product = result.rows[0];
    if (!product) return json(res, 404, { error: "Product not found." });

    return json(res, 200, await toPublicProduct(product));
  });

  // ── GET /api/products/category/:category ──────────────────────────────────
  // Convenience endpoint matching the CategoryPage slug → category mapping
  router.get("/api/products/category/:category", async (req: Request, res: Response) => {
    const { category } = req.params;
    const { sort } = req.query;

    const orderBy =
      sort === "price_asc"  ? "price ASC"   :
      sort === "price_desc" ? "price DESC"  :
      sort === "rating"     ? "rating DESC" :
      "id ASC";

    const result = await pool.query<ProductRow>(
      `SELECT * FROM products WHERE category = $1 ORDER BY ${orderBy}`,
      [category]
    );
    return json(res, 200, await Promise.all(result.rows.map(toPublicProduct)));
  });
}
