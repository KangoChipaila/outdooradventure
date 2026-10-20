import pool from "../db/pool";
import { json } from "../router";
import type { Router, Request, Response } from "../router";
import { requireAuth } from "./auth";
import type { OrderRow, OrderItemRow, OrderPublic } from "../types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatOrderDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Route registration
// ─────────────────────────────────────────────────────────────────────────────

export function registerOrderRoutes(router: Router): void {

  // ── GET /api/users/me/orders ──────────────────────────────────────────────
  // Returns the authenticated user's full order history with item names.
  router.get("/api/users/me/orders", async (req: Request, res: Response) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    // Fetch orders
    const ordersResult = await pool.query<OrderRow>(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    if (ordersResult.rows.length === 0) {
      return json(res, 200, []);
    }

    const orderIds = ordersResult.rows.map((o) => o.id);

    // Fetch all items for these orders in one query
    const itemsResult = await pool.query<OrderItemRow>(
      `SELECT * FROM order_items WHERE order_id = ANY($1::text[])`,
      [orderIds]
    );

    // Group items by order id
    const itemsByOrder = new Map<string, string[]>();
    for (const item of itemsResult.rows) {
      const list = itemsByOrder.get(item.order_id) ?? [];
      list.push(item.product_name);
      itemsByOrder.set(item.order_id, list);
    }

    const orders: OrderPublic[] = ordersResult.rows.map((order) => ({
      id: order.id,
      date: formatOrderDate(order.created_at),
      status: order.status,
      total: Number(order.total),
      items: itemsByOrder.get(order.id) ?? [],
    }));

    return json(res, 200, orders);
  });

  // ── GET /api/users/me/orders/:orderId ─────────────────────────────────────
  // Returns a single order by ID (must belong to the authenticated user).
  router.get("/api/users/me/orders/:orderId", async (req: Request, res: Response) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const { orderId } = req.params;

    const orderResult = await pool.query<OrderRow>(
      "SELECT * FROM orders WHERE id = $1 AND user_id = $2",
      [orderId, userId]
    );
    const order = orderResult.rows[0];
    if (!order) return json(res, 404, { error: "Order not found." });

    const itemsResult = await pool.query<OrderItemRow>(
      "SELECT * FROM order_items WHERE order_id = $1",
      [orderId]
    );

    const result: OrderPublic = {
      id: order.id,
      date: formatOrderDate(order.created_at),
      status: order.status,
      total: Number(order.total),
      items: itemsResult.rows.map((i) => i.product_name),
    };

    return json(res, 200, result);
  });
}
