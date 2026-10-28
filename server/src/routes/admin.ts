import pool from "../db/pool";
import { json } from "../router";
import type { Router, Request, Response } from "../router";
import { requireAdmin } from "./auth";
import { parseMultipart } from "../multipart";
import {
  deleteImage,
  isAllowedImageType,
  uploadImage,
} from "../storage";
import type { ProductRow, ProductPublic, UpdateStockBody } from "../types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function toPublicProduct(row: ProductRow): ProductPublic {
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
    img: row.img,
    gallery: row.gallery,
    category: row.category,
    stock: row.stock,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Route registration
// All routes under /api/admin require the requesting user to have is_admin = true
// ─────────────────────────────────────────────────────────────────────────────

export function registerAdminRoutes(router: Router): void {

  // ── GET /api/admin/products ───────────────────────────────────────────────
  // Returns all products including stock levels — for the admin dashboard.
  router.get("/api/admin/products", async (req: Request, res: Response) => {
    const adminId = await requireAdmin(req, res);
    if (!adminId) return;

    const result = await pool.query<ProductRow>(
      "SELECT * FROM products ORDER BY id ASC"
    );
    return json(res, 200, result.rows.map(toPublicProduct));
  });

  // ── PATCH /api/admin/products/:id/stock ───────────────────────────────────
  // Update the stock level for a single product.
  // Body: { stock: number }
  router.patch("/api/admin/products/:id/stock", async (req: Request, res: Response) => {
    const adminId = await requireAdmin(req, res);
    if (!adminId) return;

    const productId = Number(req.params.id);
    if (isNaN(productId)) return json(res, 400, { error: "Invalid product ID." });

    const { stock } = req.body as UpdateStockBody;
    if (typeof stock !== "number" || !Number.isInteger(stock) || stock < 0) {
      return json(res, 400, { error: "stock must be a non-negative integer." });
    }

    const result = await pool.query<ProductRow>(
      "UPDATE products SET stock = $1 WHERE id = $2 RETURNING *",
      [stock, productId]
    );

    if (!result.rowCount) return json(res, 404, { error: "Product not found." });
    return json(res, 200, toPublicProduct(result.rows[0]));
  });

  // ── PUT /api/admin/products/:id ───────────────────────────────────────────
  // Full product update (name, brand, price, description, sizes, colors, img,
  // gallery, category, stock).
  router.put("/api/admin/products/:id", async (req: Request, res: Response) => {
    const adminId = await requireAdmin(req, res);
    if (!adminId) return;

    const productId = Number(req.params.id);
    if (isNaN(productId)) return json(res, 400, { error: "Invalid product ID." });

    const body = req.body as Partial<ProductPublic>;

    const {
      name, brand, price, description,
      sizes, colors, img, gallery, category, stock,
    } = body;

    if (!name || !brand || price === undefined || !category) {
      return json(res, 400, { error: "name, brand, price and category are required." });
    }
    if (typeof price !== "number" || price < 0) {
      return json(res, 400, { error: "price must be a non-negative number." });
    }
    if (stock !== undefined && (typeof stock !== "number" || stock < 0)) {
      return json(res, 400, { error: "stock must be a non-negative integer." });
    }

    const result = await pool.query<ProductRow>(
      `UPDATE products
       SET name        = $1,
           brand       = $2,
           price       = $3,
           description = $4,
           sizes       = $5,
           colors      = $6,
           img         = $7,
           gallery     = $8,
           category    = $9,
           stock       = $10
       WHERE id = $11
       RETURNING *`,
      [
        name,
        brand,
        price,
        description ?? "",
        sizes ?? [],
        colors ?? [],
        img ?? "",
        gallery ?? [],
        category,
        stock ?? 0,
        productId,
      ]
    );

    if (!result.rowCount) return json(res, 404, { error: "Product not found." });
    return json(res, 200, toPublicProduct(result.rows[0]));
  });

  // ── POST /api/admin/products ──────────────────────────────────────────────
  // Add a new product.
  router.post("/api/admin/products", async (req: Request, res: Response) => {
    const adminId = await requireAdmin(req, res);
    if (!adminId) return;

    const body = req.body as Partial<ProductPublic>;
    const { name, brand, price, description, sizes, colors, img, gallery, category, stock } = body;

    if (!name || !brand || price === undefined || !category) {
      return json(res, 400, { error: "name, brand, price and category are required." });
    }
    if (typeof price !== "number" || price < 0) {
      return json(res, 400, { error: "price must be a non-negative number." });
    }

    const result = await pool.query<ProductRow>(
      `INSERT INTO products
         (name, brand, price, description, sizes, colors, img, gallery, category, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        name,
        brand,
        price,
        description ?? "",
        sizes ?? [],
        colors ?? [],
        img ?? "",
        gallery ?? [],
        category,
        stock ?? 0,
      ]
    );
    return json(res, 201, toPublicProduct(result.rows[0]));
  });

  // ── DELETE /api/admin/products/:id ────────────────────────────────────────
  router.delete("/api/admin/products/:id", async (req: Request, res: Response) => {
    const adminId = await requireAdmin(req, res);
    if (!adminId) return;

    const productId = Number(req.params.id);
    if (isNaN(productId)) return json(res, 400, { error: "Invalid product ID." });

    const result = await pool.query(
      "DELETE FROM products WHERE id = $1",
      [productId]
    );
    if (!result.rowCount) return json(res, 404, { error: "Product not found." });

    return json(res, 200, { message: "Product deleted." });
  });

  // ── GET /api/admin/users ──────────────────────────────────────────────────
  // List all users (id, name, email, tier, created_at) — no password hashes.
  router.get("/api/admin/users", async (req: Request, res: Response) => {
    const adminId = await requireAdmin(req, res);
    if (!adminId) return;

    const result = await pool.query(
      `SELECT id, first_name, last_name, email, member_tier, is_admin, created_at
       FROM users ORDER BY id ASC`
    );
    return json(res, 200, result.rows);
  });

  // ── POST /api/admin/products/:id/images/main ──────────────────────────────
  // Upload the primary image for a product.
  // Request: multipart/form-data with a single field named "image".
  // On success, stores the object-storage URL in products.img and returns the updated product.
  router.post(
    "/api/admin/products/:id/images/main",
    async (req: Request, res: Response) => {
      const adminId = await requireAdmin(req, res);
      if (!adminId) return;

      const productId = Number(req.params.id);
      if (isNaN(productId)) return json(res, 400, { error: "Invalid product ID." });

      // Check the product exists and get its current img URL (to delete old one)
      const existing = await pool.query<{ img: string }>(
        "SELECT img FROM products WHERE id = $1",
        [productId]
      );
      if (!existing.rowCount) return json(res, 404, { error: "Product not found." });
      const oldImgUrl = existing.rows[0].img;

      // Parse the multipart upload
      let parsed;
      try {
        parsed = await parseMultipart(req);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Upload failed.";
        return json(res, 400, { error: msg });
      }

      const file = parsed.files.find((f) => f.fieldName === "image");
      if (!file) return json(res, 400, { error: 'No file found. Use field name "image".' });
      if (!isAllowedImageType(file.mimeType)) {
        return json(res, 415, {
          error: "Unsupported image type. Use JPEG, PNG, WebP, GIF, or AVIF.",
        });
      }

      // Upload new image to object storage
      const { url } = await uploadImage(
        file.data,
        file.mimeType,
        `products/${productId}`,
        "main"
      );

      // Save URL to DB
      const result = await pool.query<ProductRow>(
        "UPDATE products SET img = $1 WHERE id = $2 RETURNING *",
        [url, productId]
      );

      // Delete old image after successful DB update (best-effort)
      if (oldImgUrl) {
        deleteImage(oldImgUrl).catch((err: unknown) =>
          console.warn("[storage] Failed to delete old main image:", err)
        );
      }

      return json(res, 200, toPublicProduct(result.rows[0]));
    }
  );

  // ── POST /api/admin/products/:id/images/gallery ───────────────────────────
  // Append one image to the product's gallery array.
  // Request: multipart/form-data with a single field named "image".
  // Returns the updated product.
  router.post(
    "/api/admin/products/:id/images/gallery",
    async (req: Request, res: Response) => {
      const adminId = await requireAdmin(req, res);
      if (!adminId) return;

      const productId = Number(req.params.id);
      if (isNaN(productId)) return json(res, 400, { error: "Invalid product ID." });

      // Fetch current gallery length for naming the slot
      const existing = await pool.query<{ gallery: string[] }>(
        "SELECT gallery FROM products WHERE id = $1",
        [productId]
      );
      if (!existing.rowCount) return json(res, 404, { error: "Product not found." });
      const currentGallery: string[] = existing.rows[0].gallery ?? [];

      if (currentGallery.length >= 8) {
        return json(res, 400, {
          error: "Gallery is full (max 8 images). Remove one before adding more.",
        });
      }

      // Parse upload
      let parsed;
      try {
        parsed = await parseMultipart(req);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Upload failed.";
        return json(res, 400, { error: msg });
      }

      const file = parsed.files.find((f) => f.fieldName === "image");
      if (!file) return json(res, 400, { error: 'No file found. Use field name "image".' });
      if (!isAllowedImageType(file.mimeType)) {
        return json(res, 415, {
          error: "Unsupported image type. Use JPEG, PNG, WebP, GIF, or AVIF.",
        });
      }

      const slot = `gallery-${currentGallery.length}`;
      const { url } = await uploadImage(
        file.data,
        file.mimeType,
        `products/${productId}`,
        slot
      );

      // Append to the gallery array using Postgres array append
      const result = await pool.query<ProductRow>(
        "UPDATE products SET gallery = array_append(gallery, $1) WHERE id = $2 RETURNING *",
        [url, productId]
      );

      return json(res, 200, toPublicProduct(result.rows[0]));
    }
  );

  // ── DELETE /api/admin/products/:id/images/gallery/:index ─────────────────
  // Remove a gallery image by its zero-based index.
  // Deletes the file from object storage and removes the URL from the gallery array.
  router.delete(
    "/api/admin/products/:id/images/gallery/:index",
    async (req: Request, res: Response) => {
      const adminId = await requireAdmin(req, res);
      if (!adminId) return;

      const productId = Number(req.params.id);
      const galleryIndex = Number(req.params.index);
      if (isNaN(productId)) return json(res, 400, { error: "Invalid product ID." });
      if (isNaN(galleryIndex) || galleryIndex < 0) {
        return json(res, 400, { error: "Invalid gallery index." });
      }

      const existing = await pool.query<{ gallery: string[] }>(
        "SELECT gallery FROM products WHERE id = $1",
        [productId]
      );
      if (!existing.rowCount) return json(res, 404, { error: "Product not found." });

      const gallery: string[] = existing.rows[0].gallery ?? [];
      if (galleryIndex >= gallery.length) {
        return json(res, 404, { error: "Gallery index out of range." });
      }

      const urlToDelete = gallery[galleryIndex];

      // Remove the element at the given index (Postgres arrays are 1-based)
      const result = await pool.query<ProductRow>(
        `UPDATE products
         SET gallery = array_remove(gallery, gallery[$1])
         WHERE id = $2
         RETURNING *`,
        [galleryIndex + 1, productId] // convert 0-based JS index to 1-based Postgres
      );

      // Delete from object storage (best-effort)
      if (urlToDelete) {
        deleteImage(urlToDelete).catch((err: unknown) =>
          console.warn("[storage] Failed to delete gallery image:", err)
        );
      }

      return json(res, 200, toPublicProduct(result.rows[0]));
    }
  );

  // ── DELETE /api/admin/products/:id/images/main ────────────────────────────
  // Remove the main image — clears products.img to "" and deletes from object storage.
  router.delete(
    "/api/admin/products/:id/images/main",
    async (req: Request, res: Response) => {
      const adminId = await requireAdmin(req, res);
      if (!adminId) return;

      const productId = Number(req.params.id);
      if (isNaN(productId)) return json(res, 400, { error: "Invalid product ID." });

      const existing = await pool.query<{ img: string }>(
        "SELECT img FROM products WHERE id = $1",
        [productId]
      );
      if (!existing.rowCount) return json(res, 404, { error: "Product not found." });

      const oldUrl = existing.rows[0].img;

      const result = await pool.query<ProductRow>(
        "UPDATE products SET img = '' WHERE id = $1 RETURNING *",
        [productId]
      );

      if (oldUrl) {
        deleteImage(oldUrl).catch((err: unknown) =>
          console.warn("[storage] Failed to delete main image:", err)
        );
      }

      return json(res, 200, toPublicProduct(result.rows[0]));
    }
  );
}
