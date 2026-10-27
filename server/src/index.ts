import dotenv from "dotenv";
import http from "http";
import path from "path";
import { Router, json } from "./router";
import { registerAuthRoutes } from "./routes/auth";
import { registerUserRoutes } from "./routes/users";
import { registerProductRoutes } from "./routes/products";
import { registerAdminRoutes } from "./routes/admin";
import { registerOrderRoutes } from "./routes/orders";
import { registerSavedItemRoutes } from "./routes/savedItems";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const PORT = Number(process.env.PORT ?? 4000);

console.log(
  `[config] database=${process.env.PGDATABASE ?? "green_rock_outdoor_gear"} ` +
    `user=${process.env.PGUSER ?? "postgres"} ` +
    `host=${process.env.PGHOST ?? "localhost"}:${process.env.PGPORT ?? "5432"} ` +
    `password=${process.env.PGPASSWORD ? "set" : "missing"}`,
);

// Origins that are allowed to call the API.
// In development the Vite dev server runs on port 5173 by default.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "http://localhost:5173").split(",");

// ─────────────────────────────────────────────────────────────────────────────
// Register all routes
// ─────────────────────────────────────────────────────────────────────────────

const router = new Router();

registerAuthRoutes(router);
registerUserRoutes(router);
registerProductRoutes(router);
registerAdminRoutes(router);
registerOrderRoutes(router);
registerSavedItemRoutes(router);

// ─────────────────────────────────────────────────────────────────────────────
// HTTP server
// ─────────────────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const origin = req.headers["origin"] ?? "";

  // ── CORS headers ────────────────────────────────────────────────────────
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");

  // Handle pre-flight requests
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Only serve paths under /api
  const url = req.url ?? "/";
  if (!url.startsWith("/api")) {
    json(res, 404, { error: "Not found." });
    return;
  }

  // Dispatch to matching route handler
  const matched = await router.dispatch(req, res);
  if (!matched) {
    json(res, 404, { error: "Endpoint not found." });
  }
});

server.listen(PORT, () => {
  console.log(`✅  Green Rock API server running on http://localhost:${PORT}`);
});

// Graceful shutdown
function shutdown() {
  console.log("\nShutting down…");
  server.close(() => process.exit(0));
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
