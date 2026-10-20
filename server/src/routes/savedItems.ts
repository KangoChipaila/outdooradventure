import pool from "../db/pool";
import { json } from "../router";
import type { Router, Request, Response } from "../router";
import { requireAuth } from "./auth";
import type { SavedItemPublic } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// Route registration
// ─────────────────────────────────────────────────────────────────────────────

export function registerSavedItemRoutes(router: Router): void {

  // ── GET /api/users/me/saved-items ─────────────────────────────────────────
  // Returns the authenticated user's saved/wishlist items with product details.
  router.get("/api/users/me/saved-items", async (req: Request, res: Response) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const result = await pool.query<{
      id: number;
      product_id: number;
      name: string;
      price: number;
      img: string;
    }>(
      `SELECT si.id, si.product_id, p.name, p.price, p.img
       FROM saved_items si
       JOIN products p ON p.id = si.product_id
       WHERE si.user_id = $1
       ORDER BY si.created_at DESC`,
      [userId]
    );

    const items: SavedItemPublic[] = result.rows.map((row) => ({
      id: row.id,
      productId: row.product_id,
      name: row.name,
      price: Number(row.price),
      img: row.img,
    }));

    return json(res, 200, items);
  });

  // ── POST /api/users/me/saved-items ────────────────────────────────────────
  // Save a product.  Body: { productId: number }
  router.post("/api/users/me/saved-items", async (req: Request, res: Response) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const { productId } = req.body as { productId: number };
    if (typeof productId !== "number" || isNaN(productId)) {
      return json(res, 400, { error: "productId must be a number." });
    }

    // Verify product exists
    const product = await pool.query<{ id: number }>(
      "SELECT id FROM products WHERE id = $1",
      [productId]
    );
    if (!product.rowCount) return json(res, 404, { error: "Product not found." });

    await pool.query(
      "INSERT INTO saved_items (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [userId, productId]
    );

    return json(res, 201, { message: "Item saved." });
  });

  // ── DELETE /api/users/me/saved-items/:savedItemId ─────────────────────────
  // Remove a saved item by its saved_items.id (not product_id).
  router.delete(
    "/api/users/me/saved-items/:savedItemId",
    async (req: Request, res: Response) => {
      const userId = requireAuth(req, res);
      if (!userId) return;

      const savedItemId = Number(req.params.savedItemId);
      if (isNaN(savedItemId)) return json(res, 400, { error: "Invalid saved item ID." });

      const result = await pool.query(
        "DELETE FROM saved_items WHERE id = $1 AND user_id = $2",
        [savedItemId, userId]
      );

      if (!result.rowCount) return json(res, 404, { error: "Saved item not found." });
      return json(res, 200, { message: "Item removed." });
    }
  );
}
