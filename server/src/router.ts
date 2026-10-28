import type { IncomingMessage, ServerResponse } from "http";

// ─────────────────────────────────────────────────────────────────────────────
// Tiny request router — no Express, just Node's built-in http module.
// Supports path parameters via :param syntax, e.g. /api/users/:id/orders
// ─────────────────────────────────────────────────────────────────────────────

export type Params = Record<string, string>;

export interface Request extends IncomingMessage {
  params: Params;
  query: Record<string, string>;
  body: unknown;
}

export type Response = ServerResponse;

export type Handler = (req: Request, res: Response) => Promise<void> | void;

interface Route {
  method: string;
  regex: RegExp;
  paramNames: string[];
  handler: Handler;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Send a JSON response */
export function json(res: Response, status: number, data: unknown): void {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

/** Read and parse the request body as JSON */
export function readBody<T = unknown>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk: Buffer) => {
      raw += chunk.toString();
      // Reject payloads larger than 1 MB
      if (raw.length > 1_000_000) {
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? (JSON.parse(raw) as T) : ({} as T));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

// ── Router class ──────────────────────────────────────────────────────────────

export class Router {
  private routes: Route[] = [];

  private register(method: string, path: string, handler: Handler): void {
    const paramNames: string[] = [];
    // Convert /api/users/:id/orders  →  /api/users/([^/]+)/orders
    const regexSource = path
      .replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_: string, name: string) => {
        paramNames.push(name);
        return "([^/]+)";
      })
      .replace(/\//g, "\\/");
    this.routes.push({
      method: method.toUpperCase(),
      regex: new RegExp(`^${regexSource}$`),
      paramNames,
      handler,
    });
  }

  get(path: string, handler: Handler) { this.register("GET",    path, handler); }
  post(path: string, handler: Handler) { this.register("POST",   path, handler); }
  put(path: string, handler: Handler) { this.register("PUT",    path, handler); }
  patch(path: string, handler: Handler) { this.register("PATCH",  path, handler); }
  delete(path: string, handler: Handler) { this.register("DELETE", path, handler); }

  /**
   * Main dispatch function.
   * Parses query string, extracts path params, reads body, calls the handler.
   * Returns true if a route matched, false if 404.
   */
  async dispatch(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
    const method = (req.method ?? "GET").toUpperCase();
    const rawUrl = req.url ?? "/";
    const [pathname, search] = rawUrl.split("?") as [string, string | undefined];

    // Parse query string
    const query: Record<string, string> = {};
    if (search) {
      for (const [k, v] of new URLSearchParams(search)) {
        query[k] = v;
      }
    }

    for (const route of this.routes) {
      if (route.method !== method && method !== "OPTIONS") continue;
      const match = pathname.match(route.regex);
      if (!match) continue;

      // Build params
      const params: Params = {};
      route.paramNames.forEach((name, i) => {
        params[name] = decodeURIComponent(match[i + 1] ?? "");
      });

      // Attach helpers to req
      const request = req as Request;
      request.params = params;
      request.query = query;

      // JSON routes use the shared parser. Multipart routes must keep the raw
      // request stream available for their boundary-aware parser.
      const contentType = req.headers["content-type"] ?? "";
      if (["POST", "PUT", "PATCH"].includes(method) && !contentType.toLowerCase().startsWith("multipart/form-data")) {
        try {
          request.body = await readBody(req);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Bad request";
          json(res as Response, 400, { error: message });
          return true;
        }
      } else {
        request.body = undefined;
      }

      try {
        await route.handler(request, res as Response);
      } catch (err: unknown) {
        console.error("[router] Unhandled error:", err);
        if (!res.headersSent) {
          json(res as Response, 500, { error: "Internal server error" });
        }
      }
      return true;
    }

    return false; // no route matched
  }
}
