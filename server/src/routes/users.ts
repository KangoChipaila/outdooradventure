import bcrypt from "bcrypt";
import pool from "../db/pool";
import { json } from "../router";
import type { Router, Request, Response } from "../router";
import { requireAuth, toPublicUser } from "./auth";
import type {
  UserRow,
  UpdatePersonalBody,
  UpdatePasswordBody,
  UpdateNotificationsBody,
  AddressRow,
  AddressPublic,
  UpsertAddressBody,
  ActivityPreferenceRow,
} from "../types";

const SALT_ROUNDS = 12;

// ── Helpers ───────────────────────────────────────────────────────────────────

function toPublicAddress(row: AddressRow): AddressPublic {
  return {
    id: row.id,
    label: row.label,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    country: row.country,
    isDefault: row.is_default,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Route registration
// ─────────────────────────────────────────────────────────────────────────────

export function registerUserRoutes(router: Router): void {

  // ── GET /api/users/me ─────────────────────────────────────────────────────
  // Returns the currently authenticated user's profile.
  router.get("/api/users/me", async (req: Request, res: Response) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const result = await pool.query<UserRow>(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    );
    const user = result.rows[0];
    if (!user) return json(res, 404, { error: "User not found." });

    return json(res, 200, toPublicUser(user));
  });

  // ── PUT /api/users/me ─────────────────────────────────────────────────────
  // Update first name, last name, email, phone.
  router.put("/api/users/me", async (req: Request, res: Response) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const { firstName, lastName, email, phone } = req.body as UpdatePersonalBody;
    if (!firstName || !lastName || !email) {
      return json(res, 400, { error: "firstName, lastName and email are required." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(res, 400, { error: "Invalid email address." });
    }

    // Check the new email isn't taken by another user
    const dup = await pool.query<{ id: number }>(
      "SELECT id FROM users WHERE email = $1 AND id <> $2",
      [email.toLowerCase().trim(), userId]
    );
    if (dup.rowCount && dup.rowCount > 0) {
      return json(res, 409, { error: "That email is already in use." });
    }

    const result = await pool.query<UserRow>(
      `UPDATE users
       SET first_name = $1, last_name = $2, email = $3, phone = $4
       WHERE id = $5
       RETURNING *`,
      [firstName.trim(), lastName.trim(), email.toLowerCase().trim(), phone ?? null, userId]
    );
    return json(res, 200, toPublicUser(result.rows[0]));
  });

  // ── PUT /api/users/me/password ────────────────────────────────────────────
  router.put("/api/users/me/password", async (req: Request, res: Response) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const { currentPassword, newPassword } = req.body as UpdatePasswordBody;
    if (!currentPassword || !newPassword) {
      return json(res, 400, { error: "currentPassword and newPassword are required." });
    }
    if (newPassword.length < 8) {
      return json(res, 400, { error: "New password must be at least 8 characters." });
    }

    const result = await pool.query<{ password_hash: string }>(
      "SELECT password_hash FROM users WHERE id = $1",
      [userId]
    );
    const user = result.rows[0];
    if (!user) return json(res, 404, { error: "User not found." });

    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) return json(res, 401, { error: "Current password is incorrect." });

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, userId]);

    return json(res, 200, { message: "Password updated." });
  });

  // ── PUT /api/users/me/notifications ──────────────────────────────────────
  router.put("/api/users/me/notifications", async (req: Request, res: Response) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const prefs = req.body as UpdateNotificationsBody;
    await pool.query(
      `UPDATE users
       SET notif_order_updates = $1,
           notif_deals         = $2,
           notif_new_arrivals  = $3,
           notif_newsletter    = $4
       WHERE id = $5`,
      [
        Boolean(prefs.orderUpdates),
        Boolean(prefs.deals),
        Boolean(prefs.newArrivals),
        Boolean(prefs.newsletter),
        userId,
      ]
    );
    return json(res, 200, { message: "Notification preferences updated." });
  });

  // ── GET /api/users/me/addresses ───────────────────────────────────────────
  router.get("/api/users/me/addresses", async (req: Request, res: Response) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const result = await pool.query<AddressRow>(
      "SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id ASC",
      [userId]
    );
    return json(res, 200, result.rows.map(toPublicAddress));
  });

  // ── POST /api/users/me/addresses ─────────────────────────────────────────
  router.post("/api/users/me/addresses", async (req: Request, res: Response) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const { label, line1, line2, city, country, isDefault } = req.body as UpsertAddressBody;
    if (!label || !line1 || !city || !country) {
      return json(res, 400, { error: "label, line1, city and country are required." });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // If this will be the new default, clear the old one first
      if (isDefault) {
        await client.query(
          "UPDATE addresses SET is_default = FALSE WHERE user_id = $1",
          [userId]
        );
      }

      const result = await client.query<AddressRow>(
        `INSERT INTO addresses (user_id, label, line1, line2, city, country, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [userId, label, line1, line2 ?? null, city, country, Boolean(isDefault)]
      );

      await client.query("COMMIT");
      return json(res, 201, toPublicAddress(result.rows[0]));
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  });

  // ── PUT /api/users/me/addresses/:addressId ────────────────────────────────
  router.put("/api/users/me/addresses/:addressId", async (req: Request, res: Response) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const addressId = Number(req.params.addressId);
    if (isNaN(addressId)) return json(res, 400, { error: "Invalid address ID." });

    const { label, line1, line2, city, country, isDefault } = req.body as UpsertAddressBody;
    if (!label || !line1 || !city || !country) {
      return json(res, 400, { error: "label, line1, city and country are required." });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      if (isDefault) {
        await client.query(
          "UPDATE addresses SET is_default = FALSE WHERE user_id = $1",
          [userId]
        );
      }

      const result = await client.query<AddressRow>(
        `UPDATE addresses
         SET label = $1, line1 = $2, line2 = $3, city = $4, country = $5, is_default = $6
         WHERE id = $7 AND user_id = $8
         RETURNING *`,
        [label, line1, line2 ?? null, city, country, Boolean(isDefault), addressId, userId]
      );

      await client.query("COMMIT");

      if (!result.rowCount) return json(res, 404, { error: "Address not found." });
      return json(res, 200, toPublicAddress(result.rows[0]));
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  });

  // ── DELETE /api/users/me/addresses/:addressId ─────────────────────────────
  router.delete("/api/users/me/addresses/:addressId", async (req: Request, res: Response) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const addressId = Number(req.params.addressId);
    if (isNaN(addressId)) return json(res, 400, { error: "Invalid address ID." });

    const result = await pool.query(
      "DELETE FROM addresses WHERE id = $1 AND user_id = $2",
      [addressId, userId]
    );
    if (!result.rowCount) return json(res, 404, { error: "Address not found." });

    return json(res, 200, { message: "Address removed." });
  });

  // ── GET /api/users/me/activity-preferences ────────────────────────────────
  router.get("/api/users/me/activity-preferences", async (req: Request, res: Response) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const result = await pool.query<ActivityPreferenceRow>(
      "SELECT activity FROM activity_preferences WHERE user_id = $1 ORDER BY id ASC",
      [userId]
    );
    return json(res, 200, result.rows.map((r) => r.activity));
  });

  // ── POST /api/users/me/activity-preferences ───────────────────────────────
  router.post("/api/users/me/activity-preferences", async (req: Request, res: Response) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const { activity } = req.body as { activity: string };
    if (!activity?.trim()) return json(res, 400, { error: "activity is required." });

    await pool.query(
      "INSERT INTO activity_preferences (user_id, activity) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [userId, activity.trim()]
    );
    return json(res, 201, { message: "Activity added." });
  });

  // ── DELETE /api/users/me/activity-preferences/:activity ──────────────────
  router.delete(
    "/api/users/me/activity-preferences/:activity",
    async (req: Request, res: Response) => {
      const userId = requireAuth(req, res);
      if (!userId) return;

      await pool.query(
        "DELETE FROM activity_preferences WHERE user_id = $1 AND activity = $2",
        [userId, req.params.activity]
      );
      return json(res, 200, { message: "Activity removed." });
    }
  );

  // ── DELETE /api/users/me ──────────────────────────────────────────────────
  router.delete("/api/users/me", async (req: Request, res: Response) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    // ON DELETE CASCADE handles all related rows
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    return json(res, 200, { message: "Account deleted." });
  });
}
