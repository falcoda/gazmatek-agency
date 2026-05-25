import { logger } from "@src/helpers/logger";

import { closeDB, connectDB, pool } from "./dbConnect";
import { runSqlFiles } from "./runSqlFiles";

const MIGRATION_ADVISORY_LOCK_KEY = 4_247_001;

const run = async () => {
  await connectDB();
  const applied = await runSqlFiles(pool, {
    directoryName: "migrations",
    historyTable: "schema_migrations",
    advisoryLockKey: MIGRATION_ADVISORY_LOCK_KEY,
    lockTimeoutMs: 5000,
  });

  logger.info(
    applied.length > 0
      ? `Applied migrations: ${applied.join(", ")}`
      : "No pending migrations",
  );
};

void run()
  .catch((error: Error) => {
    logger.error("Migration failed", { message: error.message });
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDB();
  });
