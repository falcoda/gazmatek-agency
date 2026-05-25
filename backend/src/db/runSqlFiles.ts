import { ConflictError } from "@src/helpers/error/errors";
import fs from "fs";
import path from "path";
import { Pool, PoolClient } from "pg";

/**
 * Run SQL migration/seed files from disk in a safe and repeatable way.
 *
 * Responsibilities:
 * - Locate the SQL directory for the current runtime (src/dist/workdir).
 * - Execute only pending files (tracked in a history table).
 * - Use optional advisory locks to prevent concurrent execution.
 * - Wrap each file execution in a transaction (BEGIN/COMMIT/ROLLBACK).
 *
 * This helper is used by both migrate.ts and seed.ts.
 */

/**
 * SQL exception policy:
 * - Business SQL must live under /src/db/query and be consumed by services/controllers.
 * - This file is an infrastructure runner for migrations/seeds and is the only allowed
 *   place where inline SQL is used for locking, history bookkeeping, and transactions.
 */

interface RunSqlFilesOptions {
  directoryName: "migrations" | "seeds";
  historyTable: "schema_migrations" | "schema_seeds";
  advisoryLockKey?: number;
  lockTimeoutMs?: number;
}

interface AdvisoryLockRow {
  locked: boolean;
}

const getSqlDirectories = (
  directoryName: RunSqlFilesOptions["directoryName"],
): string[] => {
  const directories = [
    path.resolve(__dirname, directoryName),
    path.resolve(process.cwd(), "db", directoryName),
    path.resolve(process.cwd(), "dist", "db", directoryName),
    path.resolve(process.cwd(), "src", "db", directoryName),
  ];

  return [...new Set(directories)].filter((directory) =>
    fs.existsSync(directory),
  );
};

const getSqlDirectory = (
  directoryName: RunSqlFilesOptions["directoryName"],
): string | null => getSqlDirectories(directoryName)[0] ?? null;

const getSqlFiles = (directoryName: RunSqlFilesOptions["directoryName"]) => {
  const directory = getSqlDirectory(directoryName);

  if (!directory) {
    return [];
  }

  return fs
    .readdirSync(directory)
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort();
};

export const runSqlFiles = async (
  pool: Pool,
  options: RunSqlFilesOptions,
): Promise<string[]> => {
  const sqlDirectory = getSqlDirectory(options.directoryName);

  if (!sqlDirectory) {
    return [];
  }

  const client: PoolClient = await pool.connect();

  try {
    if (options.lockTimeoutMs) {
      await client.query(`SET lock_timeout = '${options.lockTimeoutMs}ms'`);
    }

    if (options.advisoryLockKey !== undefined) {
      const advisoryLock = await client.query<AdvisoryLockRow>(
        "SELECT pg_try_advisory_lock($1) AS locked",
        [options.advisoryLockKey],
      );

      if (!advisoryLock.rows[0]?.locked) {
        throw new ConflictError(
          "Another database migration is already running",
        );
      }
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS ${options.historyTable} (
        filename TEXT PRIMARY KEY,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const alreadyExecuted = await client.query<{ filename: string }>(
      `SELECT filename FROM ${options.historyTable}`,
    );
    const executedFiles = new Set(
      alreadyExecuted.rows.map((row) => row.filename),
    );
    const pendingFiles = getSqlFiles(options.directoryName).filter(
      (fileName) => !executedFiles.has(fileName),
    );

    for (const fileName of pendingFiles) {
      const filePath = path.join(sqlDirectory, fileName);
      const sql = fs.readFileSync(filePath, "utf8").trim();

      if (!sql) {
        await client.query(
          `INSERT INTO ${options.historyTable} (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING`,
          [fileName],
        );
        continue;
      }

      await client.query("BEGIN");

      try {
        await client.query(sql);
        await client.query(
          `INSERT INTO ${options.historyTable} (filename) VALUES ($1)`,
          [fileName],
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    return pendingFiles;
  } finally {
    if (options.advisoryLockKey !== undefined) {
      await client.query("SELECT pg_advisory_unlock($1)", [
        options.advisoryLockKey,
      ]);
    }

    client.release();
  }
};
