import bcrypt from "bcrypt";
import crypto from "crypto";
import pool from "../db/pool";
import { json } from "../router";
import type { Router, Request, Response } from "../router";
import type { SignUpBody, LoginBody, UserRow, UserPublic, AuthResponse } from "../types";

const SALT_ROUNDS = 12;

// ── Simple session token store (in-memory) ────────────────────────────────────
// For production replace with Redis or a signed JWT library.
const sessions = new Map<string, number>(); // token → user_id

export function getUserIdFromToken(token: string): number | undefined {
  return sessions.get(token);
}

// ── Shape a DB row into the public user object ────────────────────────────────
function toPublicUser(row: UserRow): UserPublic {
  const date = new Date(row.created_at);
  const memberSince = date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
  const initials =
    (row.first_name[0] ?? "").toUpperCase() +
    (row.last_name[0] ?? "").toUpperCase();

  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    memberSince,
    memberTier: row.member_tier,
    avatarInitials: initials,
    notifications: {
      orderUpdates: row.notif_order_updates,
      deals: row.notif_deals,
      newArrivals: row.notif_new_arrivals,
      newsletter: row.notif_newsletter,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Route registration
// ─────────────────────────────────────────────────────────────────────────────

export function registerAuthRoutes(router: Router): void {

  // ── POST /api/auth/signup ─────────────────────────────────────────────────
  router.post("/api/auth/signup", async (req: Request, res: Response) => {
    const body = req.body as SignUpBody;

    // Validate required fields
    const { firstName, lastName, email, password, phone } = body ?? {};
    if (!firstName || !lastName || !email || !password) {
      return json(res, 400, { error: "firstName, lastName, email and password are required." });
    }
    if (password.length < 8) {
      return json(res, 400, { error: "Password must be at least 8 characters." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(res, 400, { error: "Invalid email address." });
    }

    // Check for duplicate email
    const existing = await pool.query<{ id: number }>(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase()]
    );
    if (existing.rowCount && existing.rowCount > 0) {
      return json(res, 409, { error: "An account with that email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const insertResult = await pool.query<UserRow>(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [firstName.trim(), lastName.trim(), email.toLowerCase().trim(), phone ?? null, passwordHash]
    );

    const user = insertResult.rows[0];
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, user.id);

    const response: AuthResponse = { token, user: toPublicUser(user) };
    return json(res, 201, response);
  });

  // ── POST /api/auth/login ──────────────────────────────────────────────────
  router.post("/api/auth/login", async (req: Request, res: Response) => {
    const body = req.body as LoginBody;
    const { email, password } = body ?? {};

    if (!email || !password) {
      return json(res, 400, { error: "email and password are required." });
    }

    const result = await pool.query<UserRow>(
      "SELECT * FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    const user = result.rows[0];
    if (!user) {
      // Generic message — don't reveal whether the email exists
      return json(res, 401, { error: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return json(res, 401, { error: "Invalid email or password." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, user.id);

    const response: AuthResponse = { token, user: toPublicUser(user) };
    return json(res, 200, response);
  });

  // ── POST /api/auth/logout ─────────────────────────────────────────────────
  router.post("/api/auth/logout", (req: Request, res: Response) => {
    const token = extractToken(req);
    if (token) sessions.delete(token);
    return json(res, 200, { message: "Logged out." });
  });
}

// ── Middleware helper: extract Bearer token from Authorization header ─────────
export function extractToken(req: Request): string | null {
  const auth = req.headers["authorization"] ?? "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

// ── Auth guard: returns the user_id or responds 401 ──────────────────────────
export function requireAuth(
  req: Request,
  res: Response
): number | null {
  const token = extractToken(req);
  if (!token) {
    json(res, 401, { error: "Authentication required." });
    return null;
  }
  const userId = getUserIdFromToken(token);
  if (!userId) {
    json(res, 401, { error: "Invalid or expired token." });
    return null;
  }
  return userId;
}

// ── Admin guard: returns true if user is an admin, otherwise responds 403 ─────
export async function requireAdmin(
  req: Request,
  res: Response
): Promise<number | null> {
  const userId = requireAuth(req, res);
  if (!userId) return null;

  const result = await pool.query<{ is_admin: boolean }>(
    "SELECT is_admin FROM users WHERE id = $1",
    [userId]
  );
  if (!result.rows[0]?.is_admin) {
    json(res, 403, { error: "Admin access required." });
    return null;
  }
  return userId;
}

export { toPublicUser };
