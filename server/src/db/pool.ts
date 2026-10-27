import dotenv from "dotenv";
import path from "path";
import { Pool } from "pg";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Single shared connection pool for the entire server process.
 *
 * Configuration is read from environment variables so that credentials are
 * never hard-coded.  Copy .env.example → .env and fill in your values.
 *
 * PG env vars understood by the `pg` library automatically:
 *   PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, PGSSL
 *
 * We also accept the DATABASE_URL connection string if you prefer that style.
 */

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.PGHOST ?? "localhost",
      port: Number(process.env.PGPORT ?? 5432),
      database: process.env.PGDATABASE ?? "green_rock_outdoor_gear",
      user: process.env.PGUSER ?? "postgres",
      password: process.env.PGPASSWORD ?? "",
      // Uncomment if connecting to a cloud Postgres instance that requires SSL:
      // ssl: { rejectUnauthorized: false },
    });

pool.on("error", (err) => {
  console.error("[db] Unexpected pool error:", err.message);
});

export default pool;
