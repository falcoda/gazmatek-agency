import { config } from "@src/helpers/config";
import { logger } from "@src/helpers/logger";
import { Pool } from "pg";

export const pool = new Pool({
  host: config.db.host,
  database: config.db.name,
  user: config.db.username,
  password: config.db.password,
  port: config.db.port,
  // Cap concurrent connections so a burst (or an N+1) cannot exhaust the DB.
  max: config.db.pool.max,
  // Reclaim idle clients instead of holding them open forever.
  idleTimeoutMillis: config.db.pool.idleTimeoutMs,
  // Fail fast when the pool is saturated rather than hanging the request.
  connectionTimeoutMillis: config.db.pool.connectionTimeoutMs,
  // Server-side guard: Postgres cancels any query exceeding this budget.
  statement_timeout: config.db.pool.statementTimeoutMs,
  // Never let an open transaction pin a connection indefinitely.
  idle_in_transaction_session_timeout: config.db.pool.statementTimeoutMs,
});

// An error on an idle client would otherwise crash the process by default.
pool.on("error", (error) => {
  logger.error("Unexpected database pool error", { error });
});

let hasConnected = false;

export async function connectDB(): Promise<void> {
  if (hasConnected) {
    return;
  }

  const start = Date.now();
  const client = await pool.connect();
  client.release();
  hasConnected = true;
  logger.info("Database connected successfully", {
    duration_ms: Date.now() - start,
    connected_at: new Date().toISOString(),
    pool_max: config.db.pool.max,
  });
}

export async function closeDB(): Promise<void> {
  await pool.end();
  hasConnected = false;
  logger.info("Database pool closed");
}

export default pool;
